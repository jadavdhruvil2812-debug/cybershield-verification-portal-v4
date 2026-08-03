"""
CyberShield QR Analyzer
-----------------------
Decodes QR codes from uploaded images and analyzes any embedded URL
using the existing URL reputation analyzer.

Author: CyberShield
"""

from __future__ import annotations

from typing import Dict, Any
from io import BytesIO
from urllib.parse import urlparse

from PIL import Image
from pyzbar.pyzbar import decode

# Reuse existing URL analyzer
from services.url_analyzer import analyze_url_reputation


def is_valid_url(text: str) -> bool:
    """
    Check whether decoded text is a valid HTTP/HTTPS URL.
    """
    try:
        parsed = urlparse(text.strip())
        return (
            parsed.scheme in ("http", "https")
            and parsed.netloc != ""
        )
    except Exception:
        return False


async def analyze_qr_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Decode a QR image and analyze its contents.

    Returns:
        {
            prediction,
            confidence,
            threat_score,
            risk,
            reasons,
            recommendation,
            decoded_content,
            content_type
        }
    """

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "success": False,
            "message": "Invalid image."
        }

    decoded = decode(image)

    if not decoded:
        return {
            "success": False,
            "message": "No QR code detected."
        }

    qr_text = decoded[0].data.decode("utf-8").strip()

    # -----------------------------
    # URL QR
    # -----------------------------
    if is_valid_url(qr_text):
        result = analyze_url_reputation(qr_text)

        result["decoded_content"] = qr_text
        result["content_type"] = "url"
        result["success"] = True

        return result

    # -----------------------------
    # Plain Text QR
    # -----------------------------
    return {
        "success": True,
        "content_type": "text",
        "decoded_content": qr_text,
        "prediction": "SAFE",
        "confidence": 100,
        "threat_score": 0,
        "risk": "Low",
        "reasons": [
            "QR contains plain text.",
            "No URL detected."
        ],
        "recommendation": "No malicious URL found."
    }