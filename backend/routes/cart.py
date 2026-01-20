from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/cart", tags=["cart"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


class CartItem(BaseModel):
    beat_id: str
    beat_name: str
    cover_image: str
    license_type: str  # basica, premium, exclusiva
    price: float


class CartData(BaseModel):
    items: List[CartItem]


class SaveCartRequest(BaseModel):
    user_email: str
    items: List[CartItem]


@router.post("/save")
async def save_cart(request: SaveCartRequest):
    """Guardar carrito del usuario en la base de datos"""
    
    # Actualizar o crear el carrito del usuario
    await db.carts.update_one(
        {"user_email": request.user_email},
        {
            "$set": {
                "items": [item.dict() for item in request.items],
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"message": "Carrito guardado", "items_count": len(request.items)}


@router.get("/{user_email}")
async def get_cart(user_email: str):
    """Obtener carrito del usuario"""
    
    cart = await db.carts.find_one(
        {"user_email": user_email},
        {"_id": 0}
    )
    
    if not cart:
        return {"items": [], "items_count": 0}
    
    # Verificar que los beats aún existen en el catálogo y no están ocultos
    valid_items = []
    for item in cart.get("items", []):
        beat = await db.beats.find_one(
            {
                "beat_id": item["beat_id"], 
                "is_available": True,
                "$or": [
                    {"is_hidden": {"$exists": False}},
                    {"is_hidden": False}
                ]
            },
            {"_id": 0, "beat_id": 1}
        )
        if beat:
            valid_items.append(item)
    
    # Si hay items inválidos, actualizar el carrito
    if len(valid_items) != len(cart.get("items", [])):
        await db.carts.update_one(
            {"user_email": user_email},
            {"$set": {"items": valid_items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"items": valid_items, "items_count": len(valid_items)}


@router.delete("/{user_email}")
async def clear_cart(user_email: str):
    """Vaciar carrito del usuario"""
    
    await db.carts.delete_one({"user_email": user_email})
    
    return {"message": "Carrito vaciado"}


@router.delete("/{user_email}/item/{beat_id}/{license_type}")
async def remove_item(user_email: str, beat_id: str, license_type: str):
    """Eliminar un item específico del carrito"""
    
    await db.carts.update_one(
        {"user_email": user_email},
        {
            "$pull": {
                "items": {"beat_id": beat_id, "license_type": license_type}
            },
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"message": "Item eliminado"}
