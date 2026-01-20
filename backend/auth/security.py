from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import os
import secrets

# Configuración de seguridad
SECRET_KEY = os.environ.get('JWT_SECRET', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Configuración de hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: bool = False


class UserInDB(BaseModel):
    email: EmailStr
    hashed_password: Optional[str] = None  # Opcional para usuarios de Google
    is_admin: bool = False
    is_verified: bool = False
    created_at: datetime = datetime.utcnow()
    auth_provider: Optional[str] = "email"  # "email" o "google"
    name: Optional[str] = None
    picture: Optional[str] = None
    user_id: Optional[str] = None
    phone: Optional[str] = None
    phone_country_code: Optional[str] = None


class User(BaseModel):
    email: EmailStr
    is_admin: bool = False
    is_verified: bool = False
    name: Optional[str] = None
    picture: Optional[str] = None
    user_id: Optional[str] = None
    needs_phone: bool = False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenData]:
    """Decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin", False)
        
        if email is None:
            return None
        
        return TokenData(email=email, is_admin=is_admin)
    except JWTError:
        return None


def generate_verification_code() -> str:
    """Generar código de verificación de 6 dígitos"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
