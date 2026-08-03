"""
CyberShield AI Backend Application Entry Point - Ultimate Production Ready
"""

import logging
import os
import shutil
from typing import Any, Dict

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from fastapi import UploadFile, File

from services.ocr_service import extract_text_from_image
from services.predictor import predict_sms
from services.url_analyzer import analyze_url_reputation
from services.qr_analyzer import analyze_qr_image

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CyberShield AI Backend",
    version="3.0",
    description="Enterprise AI Powered Cyber Security & Scam Detection API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SMSRequest(BaseModel):
    sms: str = Field(..., description="Paste your single-line or multi-line SMS text here")

    @field_validator('sms', mode='before')
    @classmethod
    def sanitize_sms(cls, v: Any) -> str:
        if not isinstance(v, str):
            return str(v)
        # Normalize line endings safely without triggering JSON decode errors
        return v.replace('\r\n', '\n').strip()


class URLRequest(BaseModel):
    url: str


@app.get("/")
def home() -> Dict[str, str]:
    return {
        "status": "running",
        "service": "CyberShield AI Backend",
        "version": "3.0",
    }


def analyze_sms_input(raw_text: str) -> Dict[str, Any]:
    if not raw_text or not raw_text.strip():
        raise HTTPException(status_code=400, detail="SMS text is empty or missing.")

    result = predict_sms(raw_text)
    threat_score = int(result["threat_score"])

    if threat_score >= 65:
        prediction = "SCAM"
        risk = "HIGH"
    elif threat_score >= 35:
        prediction = "SUSPICIOUS"
        risk = "MEDIUM"
    else:
        prediction = "SAFE"
        risk = "LOW"

    return {
        "prediction": prediction,
        "confidence": int(result["confidence"]),
        "risk": risk,
        "threat_score": threat_score,
        "reasons": result["reasons"],
        "recommendation": result["recommendation"],
        "sms": raw_text,
        "matched_rules": result.get("matched_rules", []),
        "categories": result.get("categories", []),
    }


@app.post("/verify-sms")
def verify_sms(data: SMSRequest) -> Dict[str, Any]:
    """
    Verify SMS endpoint: Supports Swagger UI, multi-line strings, and clean parsing.
    """
    raw_text = data.sms
    if not raw_text or not raw_text.strip():
        raise HTTPException(status_code=400, detail="SMS text is empty or missing.")

    return analyze_sms_input(raw_text)


@app.post("/verify-image")
async def verify_image(file: UploadFile = File(...)) -> Dict[str, Any]:
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text_from_image(file_path)

        if not extracted_text or not extracted_text.strip():
            return {
                "success": False,
                "message": "No text detected in image.",
                "extracted_text": "",
                "prediction": "SAFE",
                "confidence": 100,
                "risk": "LOW",
                "threat_score": 0,
                "reasons": ["No readable text found in image."],
                "recommendation": "Image contains no text."
            }

        result = analyze_sms_input(extracted_text)
        result["success"] = True
        result["extracted_text"] = extracted_text
        return result

    except Exception as exc:
        logger.error("Error processing image OCR: %s", exc)
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(exc)}")
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass


@app.post("/analyze-url")
def analyze_url(data: URLRequest) -> Dict[str, Any]:
    if not data.url or not data.url.strip():
        raise HTTPException(status_code=400, detail="URL field is empty or missing.")
    return analyze_url_reputation(data.url.strip())
# =====================================
# QR Code Safety Scanner
# =====================================

@app.post("/analyze-qr")
async def analyze_qr(
    file: UploadFile = File(...)
):
    """
    Upload QR image and analyze safety.
    """

    try:
        image_bytes = await file.read()

        result = await analyze_qr_image(
            image_bytes
        )

        return result

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }