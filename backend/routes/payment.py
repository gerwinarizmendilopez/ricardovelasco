from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import stripe
import os
from dotenv import load_dotenv

# PayPal SDK v2
try:
    from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment
    from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
    PAYPAL_AVAILABLE = True
except ImportError:
    try:
        from paypalserversdk.core import PayPalHttpClient, SandboxEnvironment
        from paypalserversdk.orders import OrdersCreateRequest, OrdersCaptureRequest
        PAYPAL_AVAILABLE = True
    except ImportError:
        PAYPAL_AVAILABLE = False
        PayPalHttpClient = None
        SandboxEnvironment = None

load_dotenv()

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Configure PayPal v2 (optional - only if PayPal SDK is available and credentials are set)
paypal_client = None
if PAYPAL_AVAILABLE and SandboxEnvironment is not None:
    paypal_client_id = os.environ.get('PAYPAL_CLIENT_ID')
    paypal_client_secret = os.environ.get('PAYPAL_CLIENT_SECRET')
    if paypal_client_id and paypal_client_secret:
        paypal_environment = SandboxEnvironment(client_id=paypal_client_id, client_secret=paypal_client_secret)
        paypal_client = PayPalHttpClient(paypal_environment)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

router = APIRouter(prefix="/api/payment", tags=["payment"])


class CreatePaymentIntentRequest(BaseModel):
    beat_id: str
    beat_name: str
    license_type: str
    amount: float
    buyer_email: EmailStr
    buyer_name: Optional[str] = None


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float
    currency: str


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """
    Crea un Payment Intent de Stripe para procesar el pago
    """
    try:
        # Verificar si el beat existe y está disponible
        beat = await db.beats.find_one({"beat_id": request.beat_id}, {"_id": 0})
        
        if not beat:
            raise HTTPException(status_code=404, detail="Beat no encontrado")
        
        if not beat.get("is_available", True):
            raise HTTPException(status_code=400, detail="Este beat ya no está disponible (vendido en exclusiva)")
        
        # Calcular precio con descuento si existe
        final_amount = request.amount
        discount_percentage = beat.get("discount_percentage")
        
        if discount_percentage and discount_percentage > 0:
            discount_multiplier = (100 - discount_percentage) / 100
            final_amount = round(request.amount * discount_multiplier, 2)
        
        # Convertir el monto a centavos (Stripe usa centavos)
        amount_cents = int(final_amount * 100)
        
        # Crear el Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={
                "beat_id": request.beat_id,
                "beat_name": request.beat_name,
                "license_type": request.license_type,
                "buyer_email": request.buyer_email,
                "buyer_name": request.buyer_name or "N/A",
                "original_amount": str(request.amount),
                "discount_percentage": str(discount_percentage) if discount_percentage else "0",
                "final_amount": str(final_amount)
            },
            description=f"Beat: {request.beat_name} - Licencia {request.license_type}" + (f" (Descuento {discount_percentage}%)" if discount_percentage else "")
        )
        
        return PaymentIntentResponse(
            client_secret=payment_intent.client_secret,
            payment_intent_id=payment_intent.id,
            amount=final_amount,
            currency="usd"
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear payment intent: {str(e)}")


@router.get("/config")
async def get_stripe_config():
    """
    Devuelve la Publishable Key de Stripe para el frontend
    """
    publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY')
    
    if not publishable_key:
        raise HTTPException(status_code=500, detail="Stripe publishable key no configurada")
    
    return {
        "publishable_key": publishable_key
    }


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    beat_id: str
    license_type: str
    buyer_email: EmailStr
    buyer_name: str = ""
    buyer_phone: str = ""
    account_type: str = "individual"
    accept_promos: bool = False


@router.post("/confirm-payment")
async def confirm_payment(request: ConfirmPaymentRequest):
    """
    Confirma que el pago se procesó correctamente.
    Si es licencia exclusiva, retira el beat del catálogo.
    """
    try:
        # Verificar el estado del payment intent
        payment_intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if payment_intent.status == "succeeded":
            # Obtener info del beat
            beat = await db.beats.find_one({"beat_id": request.beat_id}, {"_id": 0})
            
            if not beat:
                raise HTTPException(status_code=404, detail="Beat no encontrado")
            
            # Generar un ID único para la venta
            import uuid
            sale_id = f"sale_{uuid.uuid4().hex[:12]}"
            
            # Registrar la venta
            sale = {
                "sale_id": sale_id,
                "payment_intent_id": request.payment_intent_id,
                "beat_id": request.beat_id,
                "beat_name": beat.get("name"),
                "license_type": request.license_type,
                "buyer_email": request.buyer_email,
                "buyer_name": request.buyer_name,
                "buyer_phone": request.buyer_phone,
                "account_type": request.account_type,
                "accept_promos": request.accept_promos,
                "amount": payment_intent.amount / 100,
                "currency": "usd",
                "status": "succeeded",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sales.insert_one(sale)
            
            # Incrementar contador de ventas del beat
            await db.beats.update_one(
                {"beat_id": request.beat_id},
                {"$inc": {"sales": 1}}
            )
            
            # ⭐ Si es licencia EXCLUSIVA, retirar el beat del catálogo
            if request.license_type.lower() == "exclusiva":
                await db.beats.update_one(
                    {"beat_id": request.beat_id},
                    {
                        "$set": {
                            "is_available": False,
                            "sold_exclusive_to": request.buyer_email,
                            "sold_exclusive_date": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                return {
                    "status": "success",
                    "message": "¡Felicidades! Has adquirido los derechos exclusivos de este beat. El beat ha sido retirado del catálogo.",
                    "exclusive": True,
                    "sale_id": sale_id,
                    "payment_intent_id": request.payment_intent_id,
                    "amount": payment_intent.amount / 100,
                    "beat_id": request.beat_id,
                    "license_type": request.license_type
                }
            
            return {
                "status": "success",
                "message": "Pago confirmado exitosamente",
                "exclusive": False,
                "sale_id": sale_id,
                "payment_intent_id": request.payment_intent_id,
                "amount": payment_intent.amount / 100,
                "beat_id": request.beat_id,
                "license_type": request.license_type
            }
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"El pago no se ha completado. Estado: {payment_intent.status}"
            )
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al confirmar pago: {str(e)}")


@router.get("/sales")
async def get_sales():
    """
    Obtener historial de ventas (para admin)
    """
    cursor = db.sales.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
    sales = await cursor.to_list(length=100)
    
    return {
        "sales": sales,
        "total": len(sales)
    }


@router.get("/purchase/{sale_id}")
async def get_purchase(sale_id: str):
    """
    Obtener detalles de una compra específica
    """
    sale = await db.sales.find_one({"sale_id": sale_id}, {"_id": 0})
    
    if not sale:
        # Intentar buscar por payment_intent_id
        sale = await db.sales.find_one({"payment_intent_id": sale_id}, {"_id": 0})
    
    if not sale:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    
    return sale


@router.get("/purchases/{buyer_email}")
async def get_user_purchases(buyer_email: str):
    """
    Obtener historial de compras de un usuario específico
    """
    cursor = db.sales.find(
        {
            "buyer_email": buyer_email,
            "$or": [
                {"status": "succeeded"},
                {"status": {"$exists": False}}  # Incluir ventas antiguas sin status
            ]
        },
        {"_id": 0}
    ).sort("created_at", -1)
    
    purchases = await cursor.to_list(length=100)
    
    # Agregar información del beat (cover) a cada compra
    for purchase in purchases:
        beat = await db.beats.find_one(
            {"beat_id": purchase.get("beat_id")},
            {"_id": 0, "cover_filename": 1}
        )
        if beat:
            purchase["cover_url"] = f"/api/beats/cover/{beat.get('cover_filename', '')}"
    
    return {
        "purchases": purchases,
        "total": len(purchases)
    }


@router.get("/download/{beat_id}/{file_type}")
async def download_purchase_file(beat_id: str, file_type: str, license_type: str, buyer_email: str):
    """
    Descargar archivos de una compra verificada
    """
    from fastapi.responses import FileResponse
    import os as os_module
    
    # Verificar que el usuario tiene una compra válida de este beat
    # Buscar todas las compras del usuario para este beat
    sales = await db.sales.find({
        "beat_id": beat_id,
        "buyer_email": buyer_email,
        "$or": [
            {"status": "succeeded"},
            {"status": {"$exists": False}}
        ]
    }).to_list(100)
    
    if not sales:
        raise HTTPException(status_code=403, detail="No tienes acceso a este archivo")
    
    # Determinar la mejor licencia que tiene el usuario
    license_priority = {"exclusiva": 3, "premium": 2, "basica": 1}
    best_license = "basica"
    for sale in sales:
        sale_license = sale.get("license_type", "").lower()
        if license_priority.get(sale_license, 0) > license_priority.get(best_license, 0):
            best_license = sale_license
    
    purchased_license = best_license
    
    # Verificar permisos según licencia
    if file_type == "wav" and purchased_license == "basica":
        raise HTTPException(status_code=403, detail="Tu licencia no incluye archivo WAV")
    
    if file_type == "stems" and purchased_license != "exclusiva":
        raise HTTPException(status_code=403, detail="Solo la licencia exclusiva incluye stems")
    
    # Obtener beat para los nombres de archivo
    beat = await db.beats.find_one({"beat_id": beat_id}, {"_id": 0})
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    # Determinar archivo a enviar
    uploads_dir = "/app/uploads"
    filepath = None
    filename = None
    
    if file_type == "mp3":
        # Buscar MP3 primero, luego WAV si no existe
        audio_filename = beat.get("audio_filename", f"{beat_id}.mp3")
        filepath = os_module.path.join(uploads_dir, "audio", audio_filename)
        
        # Si el archivo de audio es WAV o no existe el MP3, buscar alternativas
        if not os_module.path.exists(filepath) or audio_filename.endswith('.wav'):
            # Intentar buscar un .mp3 con el mismo nombre
            mp3_name = audio_filename.replace('.wav', '.mp3')
            mp3_path = os_module.path.join(uploads_dir, "audio", mp3_name)
            if os_module.path.exists(mp3_path):
                filepath = mp3_path
                filename = mp3_name
            else:
                # Usar el archivo que existe (puede ser WAV)
                filename = audio_filename
        else:
            filename = audio_filename
            
    elif file_type == "wav":
        # Buscar en carpeta wav primero, luego en audio
        wav_filename = beat.get("wav_filename", f"{beat_id}.wav")
        filepath = os_module.path.join(uploads_dir, "wav", wav_filename)
        
        if not os_module.path.exists(filepath):
            # Buscar en carpeta de audio
            audio_filename = beat.get("audio_filename", "")
            if audio_filename.endswith('.wav'):
                filepath = os_module.path.join(uploads_dir, "audio", audio_filename)
                filename = audio_filename
            else:
                filename = wav_filename
        else:
            filename = wav_filename
            
    elif file_type == "stems":
        filename = beat.get("stems_filename", f"{beat_id}.zip")
        filepath = os_module.path.join(uploads_dir, "stems", filename)
        
    elif file_type == "license":
        # Redirigir a endpoint de contratos
        raise HTTPException(status_code=400, detail="Usa el endpoint /api/payment/contract/{license_type}/{language}")
    else:
        raise HTTPException(status_code=400, detail="Tipo de archivo no válido")
    
    if not filepath or not os_module.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {filename}")
    
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/octet-stream"
    )



# ============== PAYPAL ENDPOINTS ==============

class PayPalItemRequest(BaseModel):
    beat_id: str
    beat_name: str
    license_type: str
    price: float

class PayPalCreateOrderRequest(BaseModel):
    items: List[PayPalItemRequest]
    total_amount: float
    buyer_email: EmailStr
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    account_type: Optional[str] = "personal"
    accept_promos: Optional[bool] = False


@router.post("/paypal/create-order")
async def paypal_create_order(request: PayPalCreateOrderRequest):
    """
    Crear orden de PayPal v2 con múltiples items
    """
    if not PAYPAL_AVAILABLE or paypal_client is None:
        raise HTTPException(status_code=503, detail="PayPal no está configurado")
    
    try:
        # Crear lista de items para PayPal
        paypal_items = []
        for item in request.items:
            paypal_items.append({
                "name": f"{item.beat_name} - Licencia {item.license_type.capitalize()}"[:127],
                "unit_amount": {
                    "currency_code": "USD",
                    "value": f"{item.price:.2f}"
                },
                "quantity": "1",
                "sku": item.beat_id[:127]
            })
        
        # Crear request de orden
        order_request = OrdersCreateRequest()
        order_request.prefer("return=representation")
        order_request.request_body({
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": f"{request.total_amount:.2f}",
                    "breakdown": {
                        "item_total": {
                            "currency_code": "USD",
                            "value": f"{request.total_amount:.2f}"
                        }
                    }
                },
                "items": paypal_items
            }]
        })
        
        # Ejecutar request
        response = paypal_client.execute(order_request)
        order_id = response.result.id
        
        # Guardar orden pendiente en MongoDB
        await db.paypal_orders.insert_one({
            "order_id": order_id,
            "items": [item.dict() for item in request.items],
            "total_amount": request.total_amount,
            "buyer_email": request.buyer_email,
            "buyer_name": request.buyer_name,
            "buyer_phone": request.buyer_phone,
            "account_type": request.account_type,
            "accept_promos": request.accept_promos,
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "order_id": order_id
        }
            
    except Exception as e:
        print(f"PayPal Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/paypal/capture-order")
async def paypal_capture_order(order_id: str):
    """
    Capturar/ejecutar pago de PayPal v2 después de aprobación del usuario
    """
    if not PAYPAL_AVAILABLE or paypal_client is None:
        raise HTTPException(status_code=503, detail="PayPal no está configurado")
    
    try:
        # Capturar la orden
        capture_request = OrdersCaptureRequest(order_id)
        response = paypal_client.execute(capture_request)
        
        if response.result.status == "COMPLETED":
            # Buscar orden en MongoDB
            order = await db.paypal_orders.find_one({"order_id": order_id})
            
            if order:
                import uuid
                sale_id = f"sale_{uuid.uuid4().hex[:12]}"
                
                # Registrar venta para cada item
                items = order.get("items", [])
                
                for item in items:
                    sale = {
                        "sale_id": f"sale_{uuid.uuid4().hex[:12]}",
                        "payment_intent_id": order_id,
                        "payment_method": "paypal",
                        "beat_id": item["beat_id"],
                        "beat_name": item["beat_name"],
                        "license_type": item["license_type"],
                        "buyer_email": order["buyer_email"],
                        "buyer_name": order.get("buyer_name"),
                        "buyer_phone": order.get("buyer_phone"),
                        "account_type": order.get("account_type"),
                        "accept_promos": order.get("accept_promos"),
                        "amount": item["price"],
                        "currency": "usd",
                        "status": "succeeded",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    await db.sales.insert_one(sale)
                    
                    # Si es licencia exclusiva, marcar beat como no disponible
                    if item["license_type"].lower() == "exclusiva":
                        await db.beats.update_one(
                            {"beat_id": item["beat_id"]},
                            {"$set": {"is_available": False}}
                        )
                    
                    # Incrementar ventas del beat
                    await db.beats.update_one(
                        {"beat_id": item["beat_id"]},
                        {"$inc": {"sales": 1}}
                    )
                
                # Actualizar orden
                await db.paypal_orders.update_one(
                    {"order_id": order_id},
                    {"$set": {"status": "completed"}}
                )
                
                return {
                    "success": True,
                    "message": "Pago completado exitosamente",
                    "sale_id": sale_id
                }
        
        raise HTTPException(status_code=400, detail="No se pudo completar el pago")
            
    except Exception as e:
        print(f"PayPal Capture Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/paypal/config")
async def get_paypal_config():
    """
    Devolver el Client ID de PayPal para el frontend
    """
    return {
        "client_id": os.environ.get('PAYPAL_CLIENT_ID')
    }


# ============== CONTRATOS DE LICENCIA ==============

@router.get("/contracts/list")
async def list_contracts():
    """
    Listar contratos disponibles por tipo de licencia
    """
    import os as os_module
    
    contracts_dir = "/app/uploads/contracts"
    result = {
        "basica": {"es": None, "en": None},
        "premium": {"es": None, "en": None},
        "exclusiva": {"es": None, "en": None}
    }
    
    for license_type in ["basica", "premium", "exclusiva"]:
        license_dir = os_module.path.join(contracts_dir, license_type)
        if os_module.path.exists(license_dir):
            files = os_module.listdir(license_dir)
            for f in files:
                if f.endswith('.pdf'):
                    # Detectar idioma por nombre de archivo
                    f_lower = f.lower()
                    if '_es' in f_lower or 'español' in f_lower or 'spanish' in f_lower:
                        result[license_type]["es"] = f
                    elif '_en' in f_lower or 'english' in f_lower or 'ingles' in f_lower:
                        result[license_type]["en"] = f
                    else:
                        # Si no tiene sufijo de idioma, asignar a español por defecto
                        if not result[license_type]["es"]:
                            result[license_type]["es"] = f
    
    return result


@router.get("/contract/{license_type}/{language}")
async def download_contract(license_type: str, language: str, buyer_email: str, beat_id: str):
    """
    Descargar contrato de licencia según tipo e idioma.
    Verifica que el usuario haya comprado esa licencia.
    
    - license_type: basica, premium, exclusiva
    - language: es (español), en (inglés)
    """
    from fastapi.responses import FileResponse
    import os as os_module
    
    # Validar tipo de licencia
    license_type = license_type.lower()
    if license_type not in ["basica", "premium", "exclusiva"]:
        raise HTTPException(status_code=400, detail="Tipo de licencia no válido")
    
    # Validar idioma
    language = language.lower()
    if language not in ["es", "en"]:
        raise HTTPException(status_code=400, detail="Idioma no válido. Usa 'es' o 'en'")
    
    # Verificar que el usuario tiene una compra de este beat con esta licencia o superior
    license_priority = {"basica": 1, "premium": 2, "exclusiva": 3}
    
    sales = await db.sales.find({
        "beat_id": beat_id,
        "buyer_email": buyer_email,
        "$or": [
            {"status": "succeeded"},
            {"status": {"$exists": False}}
        ]
    }).to_list(100)
    
    if not sales:
        raise HTTPException(status_code=403, detail="No tienes acceso a este contrato")
    
    # Verificar que tiene la licencia correcta
    best_license = "basica"
    for sale in sales:
        sale_license = sale.get("license_type", "").lower()
        if license_priority.get(sale_license, 0) > license_priority.get(best_license, 0):
            best_license = sale_license
    
    # Verificar que la licencia solicitada es igual o menor a la comprada
    if license_priority.get(license_type, 0) > license_priority.get(best_license, 0):
        raise HTTPException(
            status_code=403, 
            detail=f"Solo tienes acceso al contrato de licencia {best_license}"
        )
    
    # Buscar archivo del contrato
    contracts_dir = f"/app/uploads/contracts/{license_type}"
    
    if not os_module.path.exists(contracts_dir):
        raise HTTPException(status_code=404, detail="Directorio de contratos no encontrado")
    
    # Buscar archivo por idioma
    files = os_module.listdir(contracts_dir)
    contract_file = None
    
    for f in files:
        if not f.endswith('.pdf'):
            continue
        f_lower = f.lower()
        
        if language == "es":
            if '_es' in f_lower or 'español' in f_lower or 'spanish' in f_lower:
                contract_file = f
                break
        elif language == "en":
            if '_en' in f_lower or 'english' in f_lower or 'ingles' in f_lower:
                contract_file = f
                break
    
    # Si no encuentra con sufijo, buscar cualquier PDF
    if not contract_file:
        for f in files:
            if f.endswith('.pdf'):
                contract_file = f
                break
    
    if not contract_file:
        raise HTTPException(
            status_code=404, 
            detail=f"Contrato de licencia {license_type} en {language.upper()} no disponible"
        )
    
    filepath = os_module.path.join(contracts_dir, contract_file)
    
    # Obtener nombre del beat para el nombre del archivo descargado
    beat = await db.beats.find_one({"beat_id": beat_id}, {"_id": 0, "name": 1})
    beat_name = beat.get("name", beat_id) if beat else beat_id
    
    # Nombre descriptivo para descarga
    lang_name = "ESP" if language == "es" else "ENG"
    download_name = f"Contrato_Licencia_{license_type.capitalize()}_{beat_name}_{lang_name}.pdf"
    
    return FileResponse(
        path=filepath,
        filename=download_name,
        media_type="application/pdf"
    )


@router.post("/contracts/upload")
async def upload_contract(
    license_type: str,
    language: str,
    file: bytes
):
    """
    Endpoint para subir contratos desde admin (futuro)
    """
    raise HTTPException(status_code=501, detail="Usar panel de admin para subir contratos")

