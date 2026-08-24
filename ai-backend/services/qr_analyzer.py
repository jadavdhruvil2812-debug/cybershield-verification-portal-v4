"""
CyberShield Enterprise Bulletproof QR Analyzer (v20.0 Unified Production)
Location: ai-backend/services/qr_analyzer.py
"""

import io
import logging
import re
from typing import Any, Dict, Optional
from urllib.parse import parse_qs, unquote

import cv2
import numpy as np
from PIL import Image, ImageOps

# 1. ZXing C++ Engine
try:
    import zxingcpp
except Exception:
    zxingcpp = None

# 2. QReader AI Engine
try:
    from qreader import QReader
    qreader_engine = QReader()
except Exception:
    qreader_engine = None

from services.url_analyzer import analyze_url_reputation
from services.predictor import predict_sms
from services.text_normalizer import text_normalizer

logger = logging.getLogger("cybershield.qr_analyzer")

# Suspicious Phishing TLDs
SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".site", ".link", ".online", ".live", ".info",
    ".me", ".club", ".click", ".work", ".buzz", ".icu", ".rest",
    ".monster", ".vip", ".cc", ".to", ".space", ".apk"
}

# Deceptive UPI Scam Keywords
DECEPTIVE_UPI_KEYWORDS = [
    "cashback", "reward", "lottery", "prize", "claim", "won",
    "bonus", "gift", "unfreeze", "dispute", "cancel", "refund"
]


def _decode_qr_robust(image_bytes: bytes) -> str:
    """Multi-Engine QR decoder with Quiet Zone Padding for Stylized QRs."""
    try:
        pil_raw = Image.open(io.BytesIO(image_bytes))

        # Flatten transparency
        if pil_raw.mode in ("RGBA", "LA") or (pil_raw.mode == "P" and "transparency" in pil_raw.info):
            canvas = Image.new("RGB", pil_raw.size, (255, 255, 255))
            if pil_raw.mode == "P":
                pil_raw = pil_raw.convert("RGBA")
            canvas.paste(pil_raw, mask=pil_raw.split()[3])
            pil_raw = canvas
        else:
            pil_raw = pil_raw.convert("RGB")

        # White Border Padding (Quiet Zone Recovery)
        padded_pil = ImageOps.expand(pil_raw, border=60, fill="white")

        img_rgb = np.array(padded_pil)
        img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

        # PASS 1: ZXing C++
        if zxingcpp is not None:
            try:
                res = zxingcpp.read_barcode(img_gray)
                if res and res.valid and res.text:
                    logger.info(f"[QR Engine] ZXing-CPP Decoded: {res.text}")
                    return str(res.text).strip()
            except Exception as e:
                logger.debug(f"ZXing pass note: {e}")

        # PASS 2: QReader (AI Model)
        if qreader_engine is not None:
            try:
                q_res = qreader_engine.detect_and_decode(image=img_rgb)
                if q_res and len(q_res) > 0 and q_res[0]:
                    logger.info(f"[QR Engine] QReader Decoded: {q_res[0]}")
                    return str(q_res[0]).strip()
            except Exception as e:
                logger.debug(f"QReader pass note: {e}")

        # PASS 3: OpenCV + Otsu Threshold
        detector = cv2.QRCodeDetector()
        _, otsu = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        data, _, _ = detector.detectAndDecode(otsu)
        if data and data.strip():
            logger.info(f"[QR Engine] OpenCV Otsu Decoded: {data.strip()}")
            return data.strip()

    except Exception as e:
        logger.exception(f"[QR Engine] Decoding failure: {e}")

    return ""


def _evaluate_upi_intent(payload: str) -> Dict[str, Any]:
    clean = unquote(payload.strip())
    query_str = clean.split("?", 1)[-1] if "?" in clean else clean
    raw_params = parse_qs(query_str)
    params = {k.lower(): v for k, v in raw_params.items()}

    payee_name = params.get("pn", [""])[0].strip()
    payee_vpa = params.get("pa", [""])[0].strip()
    transaction_note = params.get("tn", [""])[0].strip()

    combined_text = f"{payee_name} {transaction_note}".lower()

    # Threat 1: Deceptive Cashback Hooks
    matched_hooks = [kw for kw in DECEPTIVE_UPI_KEYWORDS if kw in combined_text]
    if matched_hooks:
        return {
            "status": "Unsafe",
            "score": 85.0,
            "recommendation": f"High threat detected! Deceptive payment intent ('{matched_hooks[0]}') designed to fraudulently debit your account."
        }

    # Threat 2: Brand Impersonation using Personal Mobile VPA
    if any(b in payee_name.lower() for b in ["googlepay", "gpay", "phonepe", "paytm", "sbi", "hdfc", "electricity"]):
        vpa_user = payee_vpa.split("@")[0] if "@" in payee_vpa else payee_vpa
        if re.match(r"^\d{10}$", vpa_user):
            return {
                "status": "Unsafe",
                "score": 90.0,
                "recommendation": f"High threat detected! Brand '{payee_name}' spoofed with personal mobile VPA '{payee_vpa}'."
            }

    # Clean Verified Genuine UPI Payment
    return {
        "status": "Safe",
        "score": 0.0,
        "recommendation": "Verified legitimate UPI merchant or payment destination."
    }


def analyze_qr_sync(image_bytes: bytes) -> Dict[str, Any]:
    """Synchronous QR analysis engine core."""
    if not image_bytes:
        return {
            "success": False,
            "status": "Unsafe",
            "score": 0.0,
            "data": "",
            "recommendation": "Empty image provided."
        }

    decoded_payload = _decode_qr_robust(image_bytes)

    if not decoded_payload:
        logger.warning("[QR Engine] No readable QR matrix detected.")
        return {
            "success": False,
            "status": "Unverifiable",
            "score": 0.0,
            "data": "",
            "recommendation": "QR code unreadable or decorative artwork. Matrix alignment patterns could not be resolved."
        }

    payload_clean = text_normalizer.clean_text(decoded_payload.strip())
    payload_lower = payload_clean.lower()

    # Route 1: UPI Scheme
    if payload_lower.startswith("upi://pay") or ("pa=" in payload_lower and "pn=" in payload_lower):
        upi_res = _evaluate_upi_intent(payload_clean)
        return {
            "success": True,
            "type": "UPI_PAYMENT",
            "status": upi_res["status"],
            "data": payload_clean,
            "score": upi_res["score"],
            "recommendation": upi_res["recommendation"]
        }

    # Route 2: URL Scheme
    if payload_lower.startswith(("http://", "https://", "www.")) or bool(
        re.match(r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$", payload_clean)
    ):
        url_res = analyze_url_reputation(payload_clean)
        raw_status = str(url_res.get("status", "Safe")).strip().upper()
        score = float(url_res.get("score", 0.0))
        is_unsafe = (raw_status == "UNSAFE") or (score >= 35.0) or any(tld in payload_lower for tld in SUSPICIOUS_TLDS)

        return {
            "success": True,
            "type": "URL",
            "status": "Unsafe" if is_unsafe else "Safe",
            "data": payload_clean,
            "score": score,
            "recommendation": url_res.get(
                "recommendation",
                "Embedded QR web link is verified and safe." if not is_unsafe
                else "High danger detected! Phishing link embedded inside QR code."
            )
        }

    # Route 3: Plain Text (SMS ML + Heuristics)
    text_res = predict_sms(payload_clean)
    raw_status = str(text_res.get("status", "Safe")).strip().upper()
    is_unsafe = raw_status == "UNSAFE"

    return {
        "success": True,
        "type": "PLAIN_TEXT",
        "status": "Unsafe" if is_unsafe else "Safe",
        "data": payload_clean,
        "score": 80.0 if is_unsafe else 0.0,
        "recommendation": text_res.get(
            "recommendation",
            "This QR contains standard safe text." if not is_unsafe
            else "High threat detected in QR payload."
        )
    }


class QRAnalyzer:
    """Class wrapper for OOP modular architecture."""
    def analyze_image_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        return analyze_qr_sync(image_bytes)


# Standard async helper for FastAPI endpoint routes
async def analyze_qr_image(image_bytes: bytes) -> Dict[str, Any]:
    return analyze_qr_sync(image_bytes)


# Singleton instance
qr_analyzer = QRAnalyzer()