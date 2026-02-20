import os
import uuid
import json
import shutil
from datetime import datetime, timezone

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from hash_engine import hash_file
from detection.audio_detector import detect_audio
from detection.video_detector import detect_video
from blockchain.contract import register_evidence, verify_evidence
from liability.scorer import compute_liability
from legal.pdf_generator import generate_pdf
from database import init_db, save_evidence, get_evidence

_UPLOAD_DIR = "/tmp/trustchain_uploads"
os.makedirs(_UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="TrustChain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

_VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv"}
_AUDIO_EXTS = {".mp3", ".wav", ".flac", ".m4a", ".ogg"}


def _ext(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()


def _reshape_record(record: dict) -> dict:
    """Reshape the flat DB record into the nested format the frontend expects."""
    detection_result = record.get("detection_result", {})
    if isinstance(detection_result, str):
        try:
            detection_result = json.loads(detection_result)
        except (json.JSONDecodeError, TypeError):
            detection_result = {}

    liability_scores = record.get("liability_scores", {})
    if isinstance(liability_scores, str):
        try:
            liability_scores = json.loads(liability_scores)
        except (json.JSONDecodeError, TypeError):
            liability_scores = {}

    is_synthetic = detection_result.get("is_synthetic", False)

    return {
        "id": record.get("id", ""),
        "filename": record.get("filename", ""),
        "file_hash": record.get("file_hash", ""),
        "detection_type": record.get("detection_type", ""),
        "detection": {
            "confidence": detection_result.get("confidence", 0.0),
            "is_synthetic": is_synthetic,
            "label": "SYNTHETIC" if is_synthetic else "AUTHENTIC",
            "explanation": detection_result.get("explanation", ""),
            "flagged_frames": detection_result.get("flagged_frames", []),
            "features": detection_result.get("features", {}),
        },
        "liability_scores": liability_scores,
        "blockchain": {
            "tx_id": record.get("blockchain_tx_id", ""),
            "timestamp": record.get("timestamp", ""),
        },
        "pdf_download_url": f"/api/report/{record.get('id', '')}/pdf",
        "timestamp": record.get("timestamp", ""),
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    disclosure_stripped: bool = Form(False),
    content_distributed: bool = Form(False),
    victim_impersonated: bool = Form(False),
    repeat_offender: bool = Form(False),
    platform_name: str = Form("Other"),
    takedown_requested: bool = Form(False),
    response_hours: float = Form(999.0),
    content_removed: bool = Form(False),
    estimated_reach: int = Form(0),
    model_name: str = Form("Unknown Model"),
):
    event_id = str(uuid.uuid4())
    ext = _ext(file.filename or "")
    tmp_path = os.path.join(_UPLOAD_DIR, f"{event_id}{ext}")

    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        file_hash = hash_file(tmp_path)

        if ext in _VIDEO_EXTS:
            detection_type = "video"
            detection_result = detect_video(tmp_path)
        elif ext in _AUDIO_EXTS:
            detection_type = "audio"
            detection_result = detect_audio(tmp_path)
        else:
            detection_type = "unknown"
            detection_result = {
                "confidence": 0.0,
                "is_synthetic": False,
                "explanation": "Unsupported file type; no analysis performed.",
            }

        blockchain_tx_id = register_evidence(file_hash, event_id, "trustchain-user")

        liability_ctx = {
            "disclosure_stripped": disclosure_stripped,
            "content_distributed": content_distributed,
            "victim_impersonated": victim_impersonated,
            "repeat_offender": repeat_offender,
            "platform_name": platform_name,
            "takedown_requested": takedown_requested,
            "response_hours": response_hours,
            "content_removed": content_removed,
            "estimated_reach": estimated_reach,
            "model_name": model_name,
        }
        liability_scores = compute_liability(liability_ctx)

        timestamp = datetime.now(timezone.utc).isoformat()
        is_synthetic = detection_result.get("is_synthetic", False)

        pdf_evidence = {
            "event_id": event_id,
            "file_hash": file_hash,
            "blockchain_tx_id": blockchain_tx_id,
            "timestamp": timestamp,
            "detection": detection_result,
            "liability": liability_scores,
        }
        pdf_path = generate_pdf(pdf_evidence)

        db_record = {
            "id": event_id,
            "filename": file.filename,
            "file_hash": file_hash,
            "timestamp": timestamp,
            "detection_type": detection_type,
            "detection_confidence": detection_result.get("confidence", 0.0),
            "detection_result": detection_result,
            "is_synthetic": is_synthetic,
            "blockchain_tx_id": blockchain_tx_id,
            "liability_scores": liability_scores,
            "pdf_path": pdf_path,
            "status": "processed",
            "created_at": timestamp,
        }
        save_evidence(db_record)

        return {
            "event_id": event_id,
            "id": event_id,
            "file_hash": file_hash,
            "detection_type": detection_type,
            "detection": {
                "confidence": detection_result.get("confidence", 0.0),
                "is_synthetic": is_synthetic,
                "label": "SYNTHETIC" if is_synthetic else "AUTHENTIC",
                "explanation": detection_result.get("explanation", ""),
                "flagged_frames": detection_result.get("flagged_frames", []),
                "features": detection_result.get("features", {}),
            },
            "liability_scores": liability_scores,
            "blockchain": {
                "tx_id": blockchain_tx_id,
                "timestamp": timestamp,
            },
            "pdf_download_url": f"/api/report/{event_id}/pdf",
            "timestamp": timestamp,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/api/evidence/{id}")
def get_evidence_record(id: str):
    record = get_evidence(id)
    if record is None:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return _reshape_record(record)


@app.post("/api/verify")
async def verify_file(file: UploadFile = File(...)):
    ext = _ext(file.filename or "")
    tmp_path = os.path.join(_UPLOAD_DIR, f"verify_{uuid.uuid4()}{ext}")
    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_hash = hash_file(tmp_path)
        exists, block_timestamp, case_id = verify_evidence(file_hash)
        return {
            "file_hash": file_hash,
            "registered_on_chain": exists,
            "blockchain_timestamp": block_timestamp,
            "case_id": case_id,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/api/report/{id}/pdf")
def download_pdf(id: str):
    record = get_evidence(id)
    if record is None:
        raise HTTPException(status_code=404, detail="Evidence not found")
    pdf_path = record.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"trustchain_{id}.pdf",
    )
