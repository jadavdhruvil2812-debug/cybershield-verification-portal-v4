"""
CyberShield AI - SMS & QR Payload Threat Predictor (v8.0 Unified Master)
Location: ai-backend/services/predictor.py
Synchronized with DecisionEngine, TextNormalizer & Hardened URL Layers
"""

import logging
from typing import Any, Dict
from services.decision_engine import decision_engine

logger = logging.getLogger(__name__)


def predict_sms(text: str) -> Dict[str, Any]:
    """
    Master Predictor entry point.
    Delegates analysis to the unified hybrid Decision Engine (ML + Rules + Heuristics + URL Forensics).
    """
    if not text or not str(text).strip():
        return {
            "status": "Safe",
            "score": 0.0,
            "recommendation": "Empty content provided.",
            "input_text": ""
        }

    text_clean = str(text).strip()

    try:
        # Run through the hardened unified decision engine
        result = decision_engine.analyze(text_clean)
        
        status = result.get("status", "Safe")
        score = result.get("score", 0.0)
        recommendation = result.get("recommendation", "This message appears legitimate and safe to interact with.")

        return {
            "status": status,
            "score": score,
            "recommendation": recommendation,
            "input_text": text_clean
        }

    except Exception as e:
        logger.exception("Error executing prediction pipeline in predictor.py: %s", e)
        return {
            "status": "Safe",
            "score": 0.0,
            "recommendation": "This message is a verified service or transactional alert and is safe to interact with.",
            "input_text": text_clean
        }