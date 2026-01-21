from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import shutil
from datetime import datetime, timezone
from pathlib import Path

router = APIRouter(prefix="/api/beats", tags=["beats"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Directorio para almacenar archivos
UPLOAD_DIR = Path("/app/uploads")
AUDIO_DIR = UPLOAD_DIR / "audio"
COVERS_DIR = UPLOAD_DIR / "covers"
WAV_DIR = UPLOAD_DIR / "wav"
STEMS_DIR = UPLOAD_DIR / "stems"

# Crear directorios si no existen
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
COVERS_DIR.mkdir(parents=True, exist_ok=True)
WAV_DIR.mkdir(parents=True, exist_ok=True)
STEMS_DIR.mkdir(parents=True, exist_ok=True)


class BeatResponse(BaseModel):
    beat_id: str
    name: str
    genre: str
    bpm: int
    key: str
    mood: str
    price_basica: float
    price_premium: float
    price_exclusiva: float
    audio_url: str
    cover_url: str
    cover_filename: Optional[str] = None
    audio_filename: Optional[str] = None
    audio_preview_filename: Optional[str] = None
    wav_filename: Optional[str] = None
    stems_filename: Optional[str] = None
    wav_url: Optional[str] = None
    stems_url: Optional[str] = None
    plays: int = 0
    sales: int = 0
    created_at: str
    updated_at: Optional[str] = None
    is_available: bool = True
    # Nuevos campos para promociones
    discount_percentage: Optional[int] = None  # Porcentaje de descuento (ej: 20 para 20%)
    is_leaving_soon: bool = False  # "Se va pronto"
    is_hidden: bool = False  # Oculto del catálogo


class BeatListResponse(BaseModel):
    beats: List[BeatResponse]
    total: int


class DiscountRequest(BaseModel):
    discount_percentage: int  # 0-100


class LeavingSoonRequest(BaseModel):
    is_leaving_soon: bool


class HiddenRequest(BaseModel):
    is_hidden: bool


@router.post("/upload")
async def upload_beat(
    name: str = Form(...),
    genre: str = Form(...),
    bpm: int = Form(...),
    key: str = Form(...),
    mood: str = Form(...),
    price_basica: float = Form(...),
    price_premium: float = Form(...),
    price_exclusiva: float = Form(...),
    audio_file: UploadFile = File(...),
    cover_file: UploadFile = File(...),
    wav_file: Optional[UploadFile] = File(None),
    stems_file: Optional[UploadFile] = File(None)
):
    """Subir un nuevo beat con archivo de audio, WAV, stems e imagen de portada"""
    
    # Validar tipos de archivo
    audio_extensions = ['.mp3']
    wav_extensions = ['.wav']
    stems_extensions = ['.rar', '.zip']
    image_extensions = ['.png', '.jpg', '.jpeg', '.webp']
    
    audio_ext = Path(audio_file.filename).suffix.lower()
    cover_ext = Path(cover_file.filename).suffix.lower()
    
    if audio_ext not in audio_extensions:
        raise HTTPException(status_code=400, detail="Formato de audio no válido. Use MP3 para el archivo de exhibición.")
    
    if cover_ext not in image_extensions:
        raise HTTPException(status_code=400, detail="Formato de imagen no válido. Use PNG, JPG o WEBP.")
    
    # Generar ID único para el beat
    beat_id = f"beat_{uuid.uuid4().hex[:12]}"
    
    # Guardar archivo de audio MP3 (exhibición y básica)
    audio_filename = f"{beat_id}{audio_ext}"
    audio_path = AUDIO_DIR / audio_filename
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Guardar imagen de portada
    cover_filename = f"{beat_id}{cover_ext}"
    cover_path = COVERS_DIR / cover_filename
    
    with open(cover_path, "wb") as buffer:
        shutil.copyfileobj(cover_file.file, buffer)
    
    # Guardar archivo WAV si existe (premium y exclusiva)
    wav_filename = None
    if wav_file and wav_file.filename:
        wav_ext = Path(wav_file.filename).suffix.lower()
        if wav_ext not in wav_extensions:
            raise HTTPException(status_code=400, detail="Formato WAV no válido.")
        wav_filename = f"{beat_id}{wav_ext}"
        wav_path = WAV_DIR / wav_filename
        with open(wav_path, "wb") as buffer:
            shutil.copyfileobj(wav_file.file, buffer)
    
    # Guardar archivo de stems si existe (solo exclusiva)
    stems_filename = None
    if stems_file and stems_file.filename:
        stems_ext = Path(stems_file.filename).suffix.lower()
        if stems_ext not in stems_extensions:
            raise HTTPException(status_code=400, detail="Formato de stems no válido. Use RAR o ZIP.")
        stems_filename = f"{beat_id}_stems{stems_ext}"
        stems_path = STEMS_DIR / stems_filename
        with open(stems_path, "wb") as buffer:
            shutil.copyfileobj(stems_file.file, buffer)
    
    # Crear documento del beat
    beat_doc = {
        "beat_id": beat_id,
        "name": name,
        "genre": genre,
        "bpm": bpm,
        "key": key,
        "mood": mood,
        "price_basica": price_basica,
        "price_premium": price_premium,
        "price_exclusiva": price_exclusiva,
        "audio_filename": audio_filename,
        "cover_filename": cover_filename,
        "wav_filename": wav_filename,
        "stems_filename": stems_filename,
        "plays": 0,
        "sales": 0,
        "is_available": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Guardar en MongoDB
    await db.beats.insert_one(beat_doc)
    
    return {
        "message": "Beat subido exitosamente",
        "beat_id": beat_id,
        "name": name
    }


@router.get("", response_model=BeatListResponse)
async def get_beats(
    genre: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "recent",
    limit: int = 50,
    skip: int = 0,
    include_hidden: bool = False  # Para el admin
):
    """Obtener lista de beats con filtros opcionales"""
    
    # Construir query
    # Para admin, mostrar todos los beats; para catálogo público, solo los disponibles
    query = {}
    if not include_hidden:
        query["is_available"] = True
    
    # Filtrar beats ocultos (a menos que sea admin)
    if not include_hidden:
        query["$or"] = [
            {"is_hidden": {"$exists": False}},
            {"is_hidden": False}
        ]
    
    if genre and genre != "all":
        query["genre"] = genre
    
    if search:
        query["$and"] = [
            query.get("$or", {}),
            {"$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"genre": {"$regex": search, "$options": "i"}},
                {"mood": {"$regex": search, "$options": "i"}}
            ]}
        ]
        if "$or" in query:
            del query["$or"]
    
    # Determinar ordenamiento
    sort_field = "created_at"
    sort_order = -1  # Descendente por defecto
    
    if sort == "popular":
        sort_field = "plays"
    elif sort == "price-low":
        sort_field = "price_basica"
        sort_order = 1
    elif sort == "price-high":
        sort_field = "price_basica"
        sort_order = -1
    
    # Obtener beats
    cursor = db.beats.find(query, {"_id": 0}).sort(sort_field, sort_order).skip(skip).limit(limit)
    beats_raw = await cursor.to_list(length=limit)
    
    # Obtener total
    total = await db.beats.count_documents(query)
    
    # Construir URLs para archivos
    backend_url = os.environ.get('BACKEND_URL', '')
    
    beats = []
    for beat in beats_raw:
        beats.append(BeatResponse(
            beat_id=beat["beat_id"],
            name=beat["name"],
            genre=beat["genre"],
            bpm=beat["bpm"],
            key=beat["key"],
            mood=beat["mood"],
            price_basica=beat["price_basica"],
            price_premium=beat["price_premium"],
            price_exclusiva=beat["price_exclusiva"],
            audio_url=f"/api/beats/audio/{beat['audio_filename']}",
            cover_url=f"/api/beats/cover/{beat['cover_filename']}",
            cover_filename=beat.get("cover_filename"),
            plays=beat.get("plays", 0),
            sales=beat.get("sales", 0),
            created_at=beat["created_at"],
            updated_at=beat.get("updated_at"),
            is_available=beat.get("is_available", True),
            # Campos de promoción
            discount_percentage=beat.get("discount_percentage"),
            is_leaving_soon=beat.get("is_leaving_soon", False),
            is_hidden=beat.get("is_hidden", False)
        ))
    
    return BeatListResponse(beats=beats, total=total)


@router.get("/{beat_id}")
async def get_beat(beat_id: str):
    """Obtener un beat específico por ID"""
    
    beat = await db.beats.find_one({"beat_id": beat_id}, {"_id": 0})
    
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    wav_url = None
    stems_url = None
    if beat.get("wav_filename"):
        wav_url = f"/api/beats/wav/{beat['wav_filename']}"
    if beat.get("stems_filename"):
        stems_url = f"/api/beats/stems/{beat['stems_filename']}"
    
    return BeatResponse(
        beat_id=beat["beat_id"],
        name=beat["name"],
        genre=beat["genre"],
        bpm=beat["bpm"],
        key=beat["key"],
        mood=beat["mood"],
        price_basica=beat["price_basica"],
        price_premium=beat["price_premium"],
        price_exclusiva=beat["price_exclusiva"],
        audio_url=f"/api/beats/audio/{beat['audio_filename']}",
        cover_url=f"/api/beats/cover/{beat['cover_filename']}",
        wav_url=wav_url,
        stems_url=stems_url,
        plays=beat.get("plays", 0),
        sales=beat.get("sales", 0),
        created_at=beat["created_at"],
        is_available=beat.get("is_available", True),
        # Campos de promoción
        discount_percentage=beat.get("discount_percentage"),
        is_leaving_soon=beat.get("is_leaving_soon", False),
        is_hidden=beat.get("is_hidden", False)
    )


@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """Servir archivo de audio"""
    file_path = AUDIO_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo de audio no encontrado")
    
    # Determinar tipo de contenido
    content_type = "audio/mpeg" if filename.endswith(".mp3") else "audio/wav"
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )


@router.get("/cover/{filename}")
async def get_cover(filename: str):
    """Servir imagen de portada"""
    file_path = COVERS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Determinar tipo de contenido
    ext = Path(filename).suffix.lower()
    content_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp"
    }
    content_type = content_types.get(ext, "image/jpeg")
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )


@router.get("/wav/{filename}")
async def get_wav(filename: str):
    """Servir archivo WAV (para premium y exclusiva)"""
    file_path = WAV_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo WAV no encontrado")
    
    return FileResponse(
        path=file_path,
        media_type="audio/wav",
        filename=filename
    )


@router.get("/stems/{filename}")
async def get_stems(filename: str):
    """Servir archivo de stems (para exclusiva)"""
    file_path = STEMS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo de stems no encontrado")
    
    # Determinar tipo de contenido
    ext = Path(filename).suffix.lower()
    content_type = "application/x-rar-compressed" if ext == ".rar" else "application/zip"
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )


@router.post("/{beat_id}/play")
async def increment_plays(beat_id: str):
    """Incrementar contador de reproducciones"""
    
    result = await db.beats.update_one(
        {"beat_id": beat_id},
        {"$inc": {"plays": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    return {"message": "Play registrado"}


@router.delete("/{beat_id}")
async def delete_beat(beat_id: str):
    """Eliminar un beat"""
    
    # Obtener beat para eliminar archivos
    beat = await db.beats.find_one({"beat_id": beat_id})
    
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    # Eliminar archivos
    audio_path = AUDIO_DIR / beat["audio_filename"]
    cover_path = COVERS_DIR / beat["cover_filename"]
    
    if audio_path.exists():
        audio_path.unlink()
    if cover_path.exists():
        cover_path.unlink()
    
    # Eliminar WAV si existe
    if beat.get("wav_filename"):
        wav_path = WAV_DIR / beat["wav_filename"]
        if wav_path.exists():
            wav_path.unlink()
    
    # Eliminar stems si existe
    if beat.get("stems_filename"):
        stems_path = STEMS_DIR / beat["stems_filename"]
        if stems_path.exists():
            stems_path.unlink()
    
    # Eliminar de la base de datos
    await db.beats.delete_one({"beat_id": beat_id})
    
    return {"message": "Beat eliminado exitosamente"}


@router.put("/{beat_id}")
async def update_beat(
    beat_id: str,
    name: str = Form(...),
    genre: str = Form(...),
    bpm: int = Form(...),
    key: str = Form(...),
    mood: str = Form(...),
    price_basica: float = Form(...),
    price_premium: float = Form(...),
    price_exclusiva: float = Form(...),
    audio_file: Optional[UploadFile] = File(None),
    cover_file: Optional[UploadFile] = File(None),
    wav_file: Optional[UploadFile] = File(None),
    stems_file: Optional[UploadFile] = File(None)
):
    """Actualizar un beat existente"""
    
    print(f"=== UPDATE BEAT {beat_id} ===")
    print(f"cover_file: {cover_file}")
    if cover_file:
        print(f"cover_file.filename: {cover_file.filename}")
        print(f"cover_file.content_type: {cover_file.content_type}")
        print(f"cover_file.size: {cover_file.size}")
    
    # Verificar que el beat existe
    beat = await db.beats.find_one({"beat_id": beat_id})
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    print(f"Beat found: {beat.get('name')}, current cover: {beat.get('cover_filename')}")
    
    # Preparar datos de actualización
    update_data = {
        "name": name,
        "genre": genre,
        "bpm": bpm,
        "key": key,
        "mood": mood,
        "price_basica": price_basica,
        "price_premium": price_premium,
        "price_exclusiva": price_exclusiva
    }
    
    # Actualizar archivo de audio si se proporcionó uno nuevo
    if audio_file and audio_file.filename:
        print(f"Updating audio file: {audio_file.filename}")
        # Eliminar archivo anterior
        old_audio = AUDIO_DIR / beat["audio_filename"]
        if old_audio.exists():
            old_audio.unlink()
        
        # Guardar nuevo archivo
        audio_ext = Path(audio_file.filename).suffix
        audio_filename = f"{beat_id}{audio_ext}"
        audio_path = AUDIO_DIR / audio_filename
        
        with open(audio_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        update_data["audio_filename"] = audio_filename
        print(f"Audio saved as: {audio_filename}")
    
    # Actualizar portada si se proporcionó una nueva
    if cover_file and cover_file.filename:
        print(f"Updating cover file: {cover_file.filename}")
        # Eliminar archivo anterior
        old_cover = COVERS_DIR / beat["cover_filename"]
        if old_cover.exists():
            old_cover.unlink()
            print(f"Deleted old cover: {old_cover}")
        
        # Guardar nuevo archivo
        cover_ext = Path(cover_file.filename).suffix
        cover_filename = f"{beat_id}{cover_ext}"
        cover_path = COVERS_DIR / cover_filename
        
        content = await cover_file.read()
        print(f"Read {len(content)} bytes from cover file")
        
        with open(cover_path, "wb") as f:
            f.write(content)
        
        update_data["cover_filename"] = cover_filename
        print(f"Cover saved as: {cover_filename} at {cover_path}")
    else:
        print(f"No cover file to update (cover_file={cover_file}, filename={cover_file.filename if cover_file else 'N/A'})")
    
    # Actualizar WAV si se proporcionó uno nuevo
    if wav_file and wav_file.filename:
        # Eliminar archivo anterior si existe
        if beat.get("wav_filename"):
            old_wav = WAV_DIR / beat["wav_filename"]
            if old_wav.exists():
                old_wav.unlink()
        
        # Guardar nuevo archivo
        wav_filename = f"{beat_id}.wav"
        wav_path = WAV_DIR / wav_filename
        
        with open(wav_path, "wb") as f:
            content = await wav_file.read()
            f.write(content)
        
        update_data["wav_filename"] = wav_filename
    
    # Actualizar stems si se proporcionó uno nuevo
    if stems_file and stems_file.filename:
        # Eliminar archivo anterior si existe
        if beat.get("stems_filename"):
            old_stems = STEMS_DIR / beat["stems_filename"]
            if old_stems.exists():
                old_stems.unlink()
        
        # Guardar nuevo archivo
        stems_ext = Path(stems_file.filename).suffix
        stems_filename = f"{beat_id}_stems{stems_ext}"
        stems_path = STEMS_DIR / stems_filename
        
        with open(stems_path, "wb") as f:
            content = await stems_file.read()
            f.write(content)
        
        update_data["stems_filename"] = stems_filename
    
    # Agregar timestamp de actualización
    from datetime import datetime, timezone
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Actualizar en la base de datos
    await db.beats.update_one(
        {"beat_id": beat_id},
        {"$set": update_data}
    )
    
    print(f"Beat updated successfully: {beat_id}")
    
    return {
        "message": "Beat actualizado exitosamente",
        "beat_id": beat_id,
        "name": name,
        "updated_at": update_data["updated_at"]
    }


# ============ GÉNEROS ============

@router.get("/genres/list")
async def get_genres():
    """Obtener lista de géneros"""
    genres = await db.genres.find({}, {"_id": 0}).sort("name", 1).to_list(100)
    return {"genres": genres}


@router.post("/genres/add")
async def add_genre(name: str = Form(...)):
    """Agregar un nuevo género (evita duplicados case-insensitive)"""
    
    # Normalizar el nombre (primera letra mayúscula, resto minúscula)
    normalized_name = name.strip().title()
    
    # Verificar si ya existe (case-insensitive)
    existing = await db.genres.find_one({
        "name": {"$regex": f"^{normalized_name}$", "$options": "i"}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail=f"El género '{existing['name']}' ya existe")
    
    # Crear el género
    genre_doc = {
        "genre_id": f"genre_{uuid.uuid4().hex[:8]}",
        "name": normalized_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.genres.insert_one(genre_doc)
    
    # Retornar sin _id
    return {
        "message": f"Género '{normalized_name}' agregado", 
        "genre": {
            "genre_id": genre_doc["genre_id"],
            "name": genre_doc["name"],
            "created_at": genre_doc["created_at"]
        }
    }


@router.delete("/genres/{genre_id}")
async def delete_genre(genre_id: str):
    """Eliminar un género"""
    
    result = await db.genres.delete_one({"genre_id": genre_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Género no encontrado")
    
    return {"message": "Género eliminado"}



# ============ PROMOCIONES Y VISIBILIDAD ============

@router.post("/{beat_id}/discount")
async def set_discount(beat_id: str, request: DiscountRequest):
    """Establecer o quitar descuento de un beat"""
    
    # Validar porcentaje
    if request.discount_percentage < 0 or request.discount_percentage > 100:
        raise HTTPException(status_code=400, detail="El porcentaje debe estar entre 0 y 100")
    
    # Si es 0, quitar el descuento
    discount_value = request.discount_percentage if request.discount_percentage > 0 else None
    
    result = await db.beats.update_one(
        {"beat_id": beat_id},
        {
            "$set": {
                "discount_percentage": discount_value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    if discount_value:
        return {"message": f"Descuento del {discount_value}% aplicado", "discount_percentage": discount_value}
    else:
        return {"message": "Descuento eliminado", "discount_percentage": None}


@router.post("/{beat_id}/toggle-leaving-soon")
async def toggle_leaving_soon(beat_id: str):
    """Activar/desactivar etiqueta 'Se va pronto'"""
    
    # Obtener estado actual
    beat = await db.beats.find_one({"beat_id": beat_id})
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    new_status = not beat.get("is_leaving_soon", False)
    
    await db.beats.update_one(
        {"beat_id": beat_id},
        {
            "$set": {
                "is_leaving_soon": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "message": f"Etiqueta 'Se va pronto' {'activada' if new_status else 'desactivada'}",
        "is_leaving_soon": new_status
    }


@router.post("/{beat_id}/toggle-visibility")
async def toggle_visibility(beat_id: str):
    """Ocultar/mostrar un beat del catálogo público"""
    
    # Obtener estado actual
    beat = await db.beats.find_one({"beat_id": beat_id})
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    new_status = not beat.get("is_hidden", False)
    
    await db.beats.update_one(
        {"beat_id": beat_id},
        {
            "$set": {
                "is_hidden": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "message": f"Beat {'oculto' if new_status else 'visible'} en el catálogo",
        "is_hidden": new_status
    }
