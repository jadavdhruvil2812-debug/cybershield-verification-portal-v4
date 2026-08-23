"""
CyberShield AI Backend Application Entry Point (v5.0 Master Build)
Location: ai-backend/app.py
Unified Direct Threat Status Architecture (Binary Verdict: Safe / Unsafe)
"""

import logging
import os
import shutil
import sys
import uuid
from pathlib import Path
from typing import Any, Dict

# Ensure local backend packages are resolvable in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# Internal Service Modules
from services.ocr_service import extract_text_from_image
from services.predictor import predict_sms
from services.rule_engine import RuleEngine
from services.url_analyzer import analyze_url_reputation
from services.qr_analyzer import analyze_qr_image

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)

logger = logging.getLogger(__name__)

# Global FastAPI Instance
app = FastAPI(
    title="CyberShield AI Backend",
    version="5.0",
    description="Enterprise AI-Powered Threat Interception Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rule_engine = RuleEngine()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class SMSRequest(BaseModel):
    sms: str = Field(...)

    @field_validator("sms", mode="before")
    @classmethod
    def sanitize_sms(cls, value: Any):
        if not isinstance(value, str):
            value = str(value)
        return value.replace("\r\n", "\n").strip()


class URLRequest(BaseModel):
    url: str


# ============================================================================
# SYSTEM HEALTH & ROOT ENDPOINTS
# ============================================================================

@app.get("/")
def home():
    return {
        "status": "running",
        "service": "CyberShield AI Backend",
        "version": "5.0",
        "verdict_mode": "Binary (Safe/Unsafe)"
    }


# ============================================================================
# 1. SMS THREAT INTERCEPTION
# ============================================================================

def analyze_sms_input(raw_text: str) -> Dict[str, Any]:
    if not raw_text or not raw_text.strip():
        raise HTTPException(
            status_code=400,
            detail="SMS text is empty."
        )

    try:
        result = predict_sms(raw_text)
        raw_status = result.get("status", "Safe")
        clean_status = "Safe" if raw_status.upper() in ["SAFE", "CLEAN", "LEGITIMATE"] else "Unsafe"
        
        return {
            "status": clean_status,
            "recommendation": result.get(
                "recommendation",
                "This message appears legitimate and safe to interact with." if clean_status == "Safe"
                else "High threat detected! Do not click links, transfer money, or share credentials."
            ),
            "input_text": raw_text
        }
    except Exception as e:
        logger.exception("Error executing SMS prediction: %s", e)
        return {
            "status": "Safe",
            "recommendation": "This message appears legitimate and safe to interact with.",
            "input_text": raw_text
        }


@app.post("/verify-sms")
def verify_sms(data: SMSRequest):
    return analyze_sms_input(data.sms)


# ============================================================================
# 2. IMAGE FORENSICS (OCR & SMS INTERCEPT INTEGRATION)
# ============================================================================

@app.post("/verify-image")
async def verify_image(file: UploadFile = File(...)):
    uploads_dir = os.path.join(BASE_DIR, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    safe_filename = f"{uuid.uuid4().hex}_{os.path.basename(file.filename or 'upload')}"
    file_path = os.path.join(uploads_dir, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. OCR Extraction
        extracted_text = extract_text_from_image(file_path)

        if not extracted_text or len(extracted_text.strip()) < 4:
            return {
                "success": False,
                "status": "Safe",
                "extracted_text": "",
                "recommendation": "No readable text detected in the uploaded image."
            }

        # 2. Pass extracted text into the unified Predictor Engine
        pred_res = predict_sms(extracted_text)
        raw_status = pred_res.get("status", "Safe")
        clean_status = "Safe" if raw_status.upper() in ["SAFE", "CLEAN", "LEGITIMATE"] else "Unsafe"

        return {
            "success": True,
            "status": clean_status,
            "extracted_text": extracted_text,
            "recommendation": pred_res.get(
                "recommendation",
                "This image appears legitimate and safe." if clean_status == "Safe"
                else "High threat detected in image content! Deceptive links or phishing indicators found."
            )
        }

    except Exception as e:
        logger.exception("Error during image verification: %s", e)
        return {
            "success": False,
            "status": "Unsafe",
            "extracted_text": "",
            "recommendation": "High risk detected due to media processing anomaly."
        }

    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass


# ============================================================================
# 3. URL RISK & MULTI-LAYER PHISHING SCANNER
# ============================================================================

@app.post("/analyze-url")
@app.post("/verify-url")
def analyze_url(data: URLRequest):
    if not data.url or not data.url.strip():
        raise HTTPException(
            status_code=400,
            detail="URL field is empty."
        )

    try:
        result = analyze_url_reputation(data.url)
        raw_status = result.get("status", "Safe")
        clean_status = "Safe" if raw_status.upper() in ["SAFE", "CLEAN", "LEGITIMATE"] else "Unsafe"

        return {
            "url": result.get("url", data.url),
            "status": clean_status,
            "recommendation": result.get(
                "recommendation",
                "This website appears clean and safe to visit." if clean_status == "Safe"
                else "High danger detected! Do not visit this website or share personal data."
            )
        }
    except Exception as e:
        logger.exception("Error executing URL analysis: %s", e)
        return {
            "url": data.url,
            "status": "Unsafe",
            "recommendation": "High risk detected due to unverified URL parsing failure."
        }


# ============================================================================
# 4. QR DECODER & UPI FRAUD ANALYZER
# ============================================================================

@app.post("/analyze-qr")
@app.post("/verify-qr")
async def analyze_qr(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        qr_result = await analyze_qr_image(image_bytes)
        
        raw_status = qr_result.get("status", "Safe")
        clean_status = "Safe" if raw_status.upper() in ["SAFE", "CLEAN", "LEGITIMATE"] else "Unsafe"
        
        return {
            "success": qr_result.get("success", True),
            "status": clean_status,
            "payload": qr_result.get("data", ""),
            "recommendation": qr_result.get(
                "recommendation",
                "Verified legitimate QR code." if clean_status == "Safe"
                else "High threat detected! Deceptive payment intent or malicious URL inside QR."
            )
        }
        
    except Exception as e:
        logger.exception("Error executing QR analysis: %s", e)
        return {
            "success": False,
            "status": "Unsafe",
            "payload": "",
            "recommendation": "High risk detected due to corrupted or unverified QR format."
        }


# ============================================================================
# APP STARTUP ENTRYPOINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)