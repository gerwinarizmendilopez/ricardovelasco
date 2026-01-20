from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import payment routes
from routes.payment import router as payment_router
from routes.auth import router as auth_router
from routes.beats import router as beats_router
from routes.cart import router as cart_router
from services.email_service import send_custom_beat_request


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class CustomBeatRequest(BaseModel):
    nombre: str
    email: str
    propuesta: str
    genero: str
    detalles: str
    referencias: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/contact/custom-beat")
async def submit_custom_beat_request(request: CustomBeatRequest):
    """
    Recibe solicitud de beat personalizado y envía email a home.recordsinfo@gmail.com
    """
    try:
        # Guardar en la base de datos
        doc = {
            "id": str(uuid.uuid4()),
            "nombre": request.nombre,
            "email": request.email,
            "propuesta": request.propuesta,
            "genero": request.genero,
            "detalles": request.detalles,
            "referencias": request.referencias,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "pending"
        }
        await db.custom_beat_requests.insert_one(doc)
        
        # Enviar email
        email_sent = await send_custom_beat_request(
            nombre=request.nombre,
            email=request.email,
            propuesta=request.propuesta,
            genero=request.genero,
            detalles=request.detalles,
            referencias=request.referencias
        )
        
        return {
            "success": True,
            "message": "Solicitud enviada correctamente",
            "email_sent": email_sent
        }
    except Exception as e:
        logger.error(f"Error procesando solicitud de beat: {str(e)}")
        return {
            "success": False,
            "message": "Error al procesar la solicitud"
        }

# Include the router in the main app
app.include_router(api_router)

# Include payment routes
app.include_router(payment_router)

# Include auth routes
app.include_router(auth_router)

# Include beats routes
app.include_router(beats_router)

# Include cart routes
app.include_router(cart_router)

# Configure CORS - orígenes específicos para credentials
cors_origins = os.environ.get('CORS_ORIGINS', '').split(',')
# Filtrar strings vacíos y agregar orígenes comunes
if not cors_origins or cors_origins == ['*'] or cors_origins == ['']:
    cors_origins = [
        "http://localhost:3000",
        "https://localhost:3000",
    ]

# Agregar el dominio de preview si está disponible
preview_url = os.environ.get('PREVIEW_URL', '')
if preview_url:
    cors_origins.append(preview_url)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()