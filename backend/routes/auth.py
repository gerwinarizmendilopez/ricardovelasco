from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import httpx
import secrets
from datetime import datetime, timedelta, timezone
from auth.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    decode_access_token,
    generate_verification_code,
    User,
    UserInDB
)
from services.email_service import send_verification_email, send_password_reset_email_resend

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Usuario admin predefinido
ADMIN_EMAIL = "home.recordsinfo@gmail.com"
ADMIN_PASSWORD_HASH = get_password_hash("a1d2m3i4nHMr3cords")


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    phone_country_code: Optional[str] = None
    username: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordPhoneRequest(BaseModel):
    email: EmailStr


class VerifyPhoneResetRequest(BaseModel):
    email: EmailStr
    phone: str
    phone_country_code: str


class ResetPasswordPhoneRequest(BaseModel):
    email: EmailStr
    new_password: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def mask_phone(phone: str) -> str:
    """Ocultar el número de teléfono mostrando solo los últimos 4 dígitos"""
    if not phone or len(phone) < 4:
        return "****"
    return "*" * (len(phone) - 4) + phone[-4:]


async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Obtener usuario por email"""
    # Verificar si es el admin
    if email == ADMIN_EMAIL:
        return UserInDB(
            email=ADMIN_EMAIL,
            hashed_password=ADMIN_PASSWORD_HASH,
            is_admin=True,
            is_verified=True,
            auth_provider="email"
        )
    
    # Buscar en la base de datos (excluir _id)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user:
        return UserInDB(**user)
    return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Obtener usuario actual desde el token"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    
    user = await get_user_by_email(token_data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return User(
        email=user.email,
        is_admin=user.is_admin,
        is_verified=user.is_verified,
        name=user.name,
        picture=user.picture,
        user_id=user.user_id
    )


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verificar que el usuario es admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user


@router.post("/register")
async def register(request: RegisterRequest):
    """Registrar nuevo usuario con teléfono obligatorio"""
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Validar teléfono
    if not request.phone or len(request.phone) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de teléfono debe tener al menos 10 dígitos"
        )
    
    if not request.phone_country_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes seleccionar un código de país"
        )
    
    # Crear usuario (ya verificado - sin necesidad de código por email)
    hashed_password = get_password_hash(request.password)
    user_id = str(uuid.uuid4())
    user = {
        "user_id": user_id,
        "email": request.email,
        "hashed_password": hashed_password,
        "phone": request.phone,
        "phone_country_code": request.phone_country_code,
        "is_admin": False,
        "is_verified": True,  # Usuario verificado automáticamente
        "auth_provider": "email",
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    # Crear token de acceso automáticamente
    access_token = create_access_token(data={"sub": request.email})
    
    return {
        "message": "Usuario registrado exitosamente",
        "email": request.email,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": request.email,
            "is_admin": False,
            "is_verified": True
        }
    }


@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verificar email con código"""
    # Buscar código de verificación
    verification = await db.verification_codes.find_one({
        "email": request.email,
        "code": request.code
    })
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificación inválido"
        )
    
    # Verificar si expiró
    if verification['expires_at'] < datetime.utcnow().timestamp():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificación expirado"
        )
    
    # Marcar usuario como verificado
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"is_verified": True}}
    )
    
    # Eliminar código usado
    await db.verification_codes.delete_one({"_id": verification['_id']})
    
    return {"message": "Email verificado exitosamente"}


@router.post("/login")
async def login(request: LoginRequest):
    """Login con email y contraseña"""
    user = await get_user_by_email(request.email)
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Verificar si el email está verificado (excepto admin)
    if not user.is_admin and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Por favor verifica tu email antes de iniciar sesión"
        )
    
    # Verificar si necesita completar perfil (solo para usuarios de Google)
    user_data = await db.users.find_one({"email": request.email}, {"_id": 0})
    needs_phone = False
    needs_profile = False
    username = None
    
    if user_data and not user.is_admin:
        username = user_data.get("username")
        auth_provider = user_data.get("auth_provider", "email")
        
        # Solo pedir completar perfil si es usuario de Google y le falta info
        if auth_provider == "google":
            if not user_data.get("phone") or not user_data.get("username"):
                needs_profile = True
            if not user_data.get("phone"):
                needs_phone = True
    
    # Crear token de acceso
    access_token = create_access_token(
        data={
            "sub": user.email,
            "is_admin": user.is_admin
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "username": username,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified,
            "needs_phone": needs_phone,
            "needs_profile": needs_profile
        }
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    # Verificar si el usuario tiene teléfono y username registrado
    user_data = await db.users.find_one({"email": current_user.email}, {"_id": 0})
    
    needs_phone = False
    needs_profile = False
    username = None
    
    if user_data:
        username = user_data.get("username")
        auth_provider = user_data.get("auth_provider", "email")
        
        # El admin no necesita completar perfil obligatoriamente
        # Solo usuarios de Google necesitan completar perfil si les falta info
        if not current_user.is_admin and auth_provider == "google":
            if not user_data.get("phone") or not user_data.get("username"):
                needs_profile = True
            if not user_data.get("phone"):
                needs_phone = True
    
    return {
        "email": current_user.email,
        "username": username,
        "is_admin": current_user.is_admin,
        "is_verified": current_user.is_verified,
        "name": current_user.name,
        "picture": current_user.picture,
        "user_id": current_user.user_id,
        "needs_phone": needs_phone,
        "needs_profile": needs_profile
    }


@router.post("/resend-verification")
async def resend_verification(email: EmailStr):
    """Reenviar código de verificación"""
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if user.get('is_verified'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está verificado"
        )
    
    # Generar nuevo código
    verification_code = generate_verification_code()
    expires_at = datetime.utcnow().timestamp() + (10 * 60)
    
    # Eliminar códigos anteriores
    await db.verification_codes.delete_many({"email": email})
    
    # Guardar nuevo código
    await db.verification_codes.insert_one({
        "email": email,
        "code": verification_code,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    })
    
    # Enviar email
    email_sent = await send_verification_email(email, verification_code)
    
    if not email_sent:
        print(f"Warning: No se pudo enviar email a {email}")
    
    return {
        "message": "Código de verificación reenviado.",
        "verification_code": verification_code  # En producción, quitar esto
    }


# ========== NUEVO SISTEMA DE PASSWORD RESET CON TELÉFONO ==========

@router.post("/forgot-password-phone")
async def forgot_password_phone(request: ForgotPasswordPhoneRequest):
    """
    Paso 1: Solicitar restablecimiento de contraseña.
    Si el email existe, devuelve los últimos 4 dígitos del teléfono.
    """
    # Verificar si el usuario existe
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    
    if not user:
        return {
            "success": False,
            "message": "No encontramos una cuenta con este email."
        }
    
    # Verificar que no sea usuario de Google sin teléfono
    if user.get('auth_provider') == 'google' and not user.get('phone'):
        return {
            "success": False,
            "message": "Esta cuenta usa Google para iniciar sesión. No necesitas contraseña."
        }
    
    # Verificar que tenga teléfono registrado
    phone = user.get('phone')
    phone_country_code = user.get('phone_country_code', '+52')
    
    if not phone:
        return {
            "success": False,
            "message": "Esta cuenta no tiene un número de teléfono registrado. Contacta soporte."
        }
    
    # Devolver hint del teléfono (últimos 4 dígitos)
    phone_hint = mask_phone(phone)
    
    return {
        "success": True,
        "phone_hint": phone_hint,
        "dial_code": phone_country_code,
        "message": "Verifica tu teléfono para continuar."
    }


@router.post("/verify-phone-reset")
async def verify_phone_reset(request: VerifyPhoneResetRequest):
    """
    Paso 2: Verificar que el teléfono coincide con el registrado.
    """
    # Buscar usuario
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    stored_phone = user.get('phone', '')
    stored_country_code = user.get('phone_country_code', '')
    
    # Comparar teléfono (solo los dígitos)
    input_phone = ''.join(filter(str.isdigit, request.phone))
    stored_phone_clean = ''.join(filter(str.isdigit, stored_phone))
    
    # Verificar que coincidan el teléfono y el código de país
    if input_phone != stored_phone_clean or request.phone_country_code != stored_country_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de teléfono no coincide con el registrado"
        )
    
    # Marcar que este usuario puede cambiar su contraseña (guardar token temporal)
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow().timestamp() + (10 * 60)  # 10 minutos
    
    # Eliminar tokens anteriores
    await db.phone_reset_tokens.delete_many({"email": request.email})
    
    # Guardar nuevo token
    await db.phone_reset_tokens.insert_one({
        "email": request.email,
        "token": reset_token,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    })
    
    return {
        "success": True,
        "message": "Teléfono verificado correctamente"
    }


@router.post("/reset-password-phone")
async def reset_password_phone(request: ResetPasswordPhoneRequest):
    """
    Paso 3: Cambiar la contraseña después de verificar el teléfono.
    """
    # Verificar que el usuario tenga un token válido de verificación de teléfono
    reset_record = await db.phone_reset_tokens.find_one({"email": request.email})
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes verificar tu teléfono primero"
        )
    
    # Verificar expiración
    if reset_record['expires_at'] < datetime.utcnow().timestamp():
        await db.phone_reset_tokens.delete_one({"email": request.email})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La sesión ha expirado. Inicia el proceso de nuevo."
        )
    
    # Validar contraseña
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 6 caracteres"
        )
    
    # Actualizar contraseña
    hashed_password = get_password_hash(request.new_password)
    
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    # Eliminar token usado
    await db.phone_reset_tokens.delete_one({"email": request.email})
    
    # Crear token de acceso para login automático
    user = await get_user_by_email(request.email)
    access_token = create_access_token(
        data={
            "sub": request.email,
            "is_admin": user.is_admin if user else False
        }
    )
    
    return {
        "message": "Contraseña actualizada exitosamente",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": request.email,
            "is_admin": user.is_admin if user else False,
            "is_verified": user.is_verified if user else True
        }
    }


# ========== ENDPOINTS ANTIGUOS (por compatibilidad) ==========

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Solicitar restablecimiento de contraseña (método antiguo por email)"""
    # Verificar si el usuario existe
    user = await db.users.find_one({"email": request.email})
    
    # No revelar si el email existe o no por seguridad
    if not user:
        return {
            "success": False,
            "message": "Si el email está registrado, recibirás un enlace para restablecer tu contraseña.",
            "send_email": False
        }
    
    # Verificar que no sea usuario de Google
    if user.get('auth_provider') == 'google':
        return {
            "success": False,
            "message": "Esta cuenta usa Google para iniciar sesión. No necesitas contraseña.",
            "send_email": False
        }
    
    # Generar token único de reset
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow().timestamp() + (30 * 60)  # 30 minutos
    
    # Eliminar tokens anteriores
    await db.password_resets.delete_many({"email": request.email})
    
    # Guardar nuevo token
    await db.password_resets.insert_one({
        "email": request.email,
        "token": reset_token,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    })
    
    # Construir URL de reset (frontend)
    frontend_url = os.environ.get('FRONTEND_URL', 'https://beatstore-admin-1.preview.emergentagent.com')
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Enviar email con Resend
    email_sent = await send_password_reset_email_resend(request.email, reset_url)
    
    return {
        "success": True,
        "message": "Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu email.",
        "email_sent": email_sent
    }


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Restablecer contraseña con token"""
    # Buscar token
    reset_record = await db.password_resets.find_one({"token": request.token})
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enlace inválido o expirado"
        )
    
    # Verificar expiración
    if reset_record['expires_at'] < datetime.utcnow().timestamp():
        # Eliminar token expirado
        await db.password_resets.delete_one({"token": request.token})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace ha expirado. Solicita uno nuevo."
        )
    
    # Validar contraseña
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 6 caracteres"
        )
    
    # Actualizar contraseña
    email = reset_record['email']
    hashed_password = get_password_hash(request.new_password)
    
    await db.users.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    # Eliminar token usado
    await db.password_resets.delete_one({"token": request.token})
    
    # Crear token de acceso para login automático
    user = await get_user_by_email(email)
    access_token = create_access_token(
        data={
            "sub": email,
            "is_admin": user.is_admin if user else False
        }
    )
    
    return {
        "message": "Contraseña actualizada exitosamente",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "is_admin": user.is_admin if user else False,
            "is_verified": user.is_verified if user else True
        }
    }


@router.get("/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    """Verificar si un token de reset es válido"""
    reset_record = await db.password_resets.find_one({"token": token})
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enlace inválido"
        )
    
    if reset_record['expires_at'] < datetime.utcnow().timestamp():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace ha expirado"
        )
    
    return {"valid": True, "email": reset_record['email']}


# ========== GOOGLE OAUTH INTEGRATION ==========
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


class GoogleSessionRequest(BaseModel):
    session_id: str


class GoogleUser(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    is_verified: bool = True
    auth_provider: str = "google"


class UpdatePhoneRequest(BaseModel):
    phone: str
    phone_country_code: str


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    phone_country_code: Optional[str] = None


class CompleteProfileRequest(BaseModel):
    username: str
    phone: str
    phone_country_code: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ChangeEmailRequest(BaseModel):
    new_email: EmailStr
    password: str


@router.post("/google/session")
async def process_google_session(request: GoogleSessionRequest, response: Response):
    """
    Procesa el session_id de Google OAuth y devuelve datos del usuario.
    Este endpoint intercambia el session_id temporal por un session_token persistente.
    """
    try:
        # Llamar a Emergent Auth para obtener datos del usuario
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": request.session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session ID inválido o expirado"
                )
            
            google_data = auth_response.json()
        
        email = google_data.get("email")
        name = google_data.get("name", "Usuario")
        picture = google_data.get("picture")
        session_token = google_data.get("session_token")
        
        if not email or not session_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Datos de autenticación incompletos"
            )
        
        # Buscar o crear usuario en la base de datos
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user.get("user_id")
            # Actualizar datos si es necesario
            await db.users.update_one(
                {"email": email},
                {"$set": {
                    "name": name,
                    "picture": picture,
                    "last_login": datetime.now(timezone.utc),
                    "auth_provider": "google"
                }}
            )
            is_admin = existing_user.get("is_admin", False)
            needs_phone = not existing_user.get("phone")
            needs_profile = not existing_user.get("phone") or not existing_user.get("username")
            username = existing_user.get("username")
        else:
            # Crear nuevo usuario
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            # Verificar si es el admin
            is_admin = email == ADMIN_EMAIL
            
            new_user = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "is_admin": is_admin,
                "is_verified": True,
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
                "last_login": datetime.now(timezone.utc)
            }
            await db.users.insert_one(new_user)
            needs_phone = True
            needs_profile = True
            username = None
        
        # Crear sesión en la base de datos
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Eliminar sesiones anteriores del usuario
        await db.user_sessions.delete_many({"user_id": user_id})
        
        # Crear nueva sesión
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        # También crear un JWT token para mantener compatibilidad con el sistema existente
        access_token = create_access_token(
            data={
                "sub": email,
                "is_admin": is_admin,
                "user_id": user_id
            }
        )
        
        # Configurar cookie httpOnly
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,  # Cambiar a True en producción con HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60,  # 7 días
            path="/"
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": user_id,
                "email": email,
                "username": username,
                "name": name,
                "picture": picture,
                "is_admin": is_admin,
                "is_verified": True,
                "needs_phone": needs_phone,
                "needs_profile": needs_profile
            }
        }
        
    except httpx.RequestError as e:
        print(f"Error conectando con Emergent Auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Error al conectar con el servicio de autenticación"
        )


@router.post("/update-phone")
async def update_phone(request: UpdatePhoneRequest, current_user: User = Depends(get_current_user)):
    """
    Actualizar número de teléfono del usuario (para usuarios de Google que no lo tienen).
    """
    if not request.phone or len(request.phone) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de teléfono debe tener al menos 10 dígitos"
        )
    
    if not request.phone_country_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes seleccionar un código de país"
        )
    
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {
            "phone": request.phone,
            "phone_country_code": request.phone_country_code
        }}
    )
    
    return {"message": "Teléfono actualizado correctamente"}


@router.get("/google/me")
async def get_google_user(request: Request):
    """
    Obtener usuario autenticado via Google OAuth usando session_token de cookie.
    """
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    
    # Buscar sesión en la base de datos
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no válida"
        )
    
    # Verificar expiración
    expires_at = session.get("expires_at")
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sesión expirada"
            )
    
    # Obtener datos del usuario
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return {
        "user_id": user.get("user_id"),
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "is_admin": user.get("is_admin", False),
        "is_verified": user.get("is_verified", True)
    }


@router.post("/google/logout")
async def google_logout(request: Request, response: Response):
    """
    Cerrar sesión de Google OAuth.
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Eliminar sesión de la base de datos
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Eliminar cookie
    response.delete_cookie(
        key="session_token",
        path="/"
    )
    
    return {"message": "Sesión cerrada exitosamente"}


# ========== ENDPOINTS DE PERFIL DE USUARIO ==========

@router.post("/complete-profile")
async def complete_profile(request: CompleteProfileRequest, current_user: User = Depends(get_current_user)):
    """
    Completar perfil del usuario (username y teléfono).
    Se usa cuando un usuario nuevo o existente necesita completar su información.
    """
    # Validar username
    if not request.username or len(request.username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario debe tener al menos 3 caracteres"
        )
    
    if len(request.username) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario no puede tener más de 20 caracteres"
        )
    
    # Username puede repetirse - es solo decorativo
    # El identificador único es el email
    
    # Validar teléfono
    if not request.phone or len(request.phone) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de teléfono debe tener al menos 10 dígitos"
        )
    
    if not request.phone_country_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes seleccionar un código de país"
        )
    
    # Actualizar usuario
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {
            "username": request.username,
            "phone": request.phone,
            "phone_country_code": request.phone_country_code
        }}
    )
    
    return {
        "message": "Perfil completado exitosamente",
        "username": request.username
    }


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Obtener perfil completo del usuario actual.
    """
    user_data = await db.users.find_one({"email": current_user.email}, {"_id": 0, "hashed_password": 0})
    
    # Si no existe en la base de datos (ej: admin hardcodeado), devolver datos básicos
    if not user_data:
        return {
            "email": current_user.email,
            "username": None,
            "phone": None,
            "phone_country_code": None,
            "name": current_user.name,
            "picture": current_user.picture,
            "is_admin": current_user.is_admin,
            "is_verified": current_user.is_verified,
            "auth_provider": "email",
            "created_at": None
        }
    
    return {
        "email": user_data.get("email"),
        "username": user_data.get("username"),
        "phone": user_data.get("phone"),
        "phone_country_code": user_data.get("phone_country_code"),
        "name": user_data.get("name"),
        "picture": user_data.get("picture"),
        "is_admin": user_data.get("is_admin", False),
        "is_verified": user_data.get("is_verified", False),
        "auth_provider": user_data.get("auth_provider", "email"),
        "created_at": user_data.get("created_at")
    }


@router.put("/profile")
async def update_profile(request: UpdateProfileRequest, current_user: User = Depends(get_current_user)):
    """
    Actualizar perfil del usuario (username, teléfono).
    """
    update_data = {}
    
    if request.username is not None:
        if len(request.username) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario debe tener al menos 3 caracteres"
            )
        if len(request.username) > 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario no puede tener más de 20 caracteres"
            )
        # Verificar que no esté en uso
        existing = await db.users.find_one({
            "username": request.username,
            "email": {"$ne": current_user.email}
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este nombre de usuario ya está en uso"
            )
        update_data["username"] = request.username
    
    if request.phone is not None:
        if len(request.phone) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de teléfono debe tener al menos 10 dígitos"
            )
        update_data["phone"] = request.phone
    
    if request.phone_country_code is not None:
        update_data["phone_country_code"] = request.phone_country_code
    
    if update_data:
        # Verificar si el usuario existe en la base de datos
        existing_user = await db.users.find_one({"email": current_user.email})
        
        if existing_user:
            # Actualizar usuario existente
            await db.users.update_one(
                {"email": current_user.email},
                {"$set": update_data}
            )
        else:
            # Crear registro para el usuario (ej: admin hardcodeado)
            update_data["email"] = current_user.email
            update_data["is_admin"] = current_user.is_admin
            update_data["is_verified"] = True
            update_data["auth_provider"] = "email"
            update_data["created_at"] = datetime.now(timezone.utc)
            await db.users.insert_one(update_data)
    
    # Obtener datos actualizados
    user_data = await db.users.find_one({"email": current_user.email}, {"_id": 0, "hashed_password": 0})
    
    # Si aún no existe, devolver datos básicos
    if not user_data:
        return {
            "message": "Perfil actualizado exitosamente",
            "user": {
                "email": current_user.email,
                "username": request.username,
                "phone": request.phone,
                "phone_country_code": request.phone_country_code,
                "is_admin": current_user.is_admin
            }
        }
    
    return {
        "message": "Perfil actualizado exitosamente",
        "user": {
            "email": user_data.get("email"),
            "username": user_data.get("username"),
            "phone": user_data.get("phone"),
            "phone_country_code": user_data.get("phone_country_code"),
            "is_admin": user_data.get("is_admin", False)
        }
    }


@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user)):
    """
    Cambiar contraseña del usuario.
    """
    # Obtener usuario con password
    user_data = await db.users.find_one({"email": current_user.email})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Si el usuario es de Google y no tiene password, no puede cambiarla
    if user_data.get("auth_provider") == "google" and not user_data.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta usa Google para iniciar sesión. No tienes contraseña."
        )
    
    # Verificar contraseña actual
    if not verify_password(request.current_password, user_data.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
    
    # Validar nueva contraseña
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 6 caracteres"
        )
    
    # Actualizar contraseña
    hashed_password = get_password_hash(request.new_password)
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/change-email")
async def change_email(request: ChangeEmailRequest, current_user: User = Depends(get_current_user)):
    """
    Cambiar email del usuario.
    """
    # Verificar que el nuevo email no esté en uso
    existing = await db.users.find_one({"email": request.new_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email ya está en uso"
        )
    
    # Obtener usuario con password
    user_data = await db.users.find_one({"email": current_user.email})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Si el usuario es de Google, no puede cambiar el email
    if user_data.get("auth_provider") == "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar el email de una cuenta de Google"
        )
    
    # Verificar contraseña
    if not verify_password(request.password, user_data.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña incorrecta"
        )
    
    # Actualizar email
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"email": request.new_email}}
    )
    
    # Crear nuevo token
    access_token = create_access_token(
        data={
            "sub": request.new_email,
            "is_admin": user_data.get("is_admin", False)
        }
    )
    
    return {
        "message": "Email actualizado exitosamente",
        "access_token": access_token,
        "new_email": request.new_email
    }
