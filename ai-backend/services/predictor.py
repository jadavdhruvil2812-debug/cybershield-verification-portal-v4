"""
CyberShield SMS Scam Detection - Enterprise ML Predictor
Module: services/predictor.py

Thread-safe, high-performance hybrid inference engine combining
Scikit-Learn models with heuristic rule evaluation.
Returns integer-based (0-100%) confidence scores.
"""

import logging
import re
import threading
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib

from services.rule_engine import analyze_rules

# ==============================================================================
# LOGGING & CONSTANTS
# ==============================================================================

logger = logging.getLogger("cybershield.predictor")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "sms_model.pkl"
VECTORIZER_PATH = BASE_DIR / "models" / "vectorizer.pkl"

# Risk Thresholds
SCORE_SAFE_MAX = 29
SCORE_SUSPICIOUS_MAX = 59
SCORE_HIGH_MAX = 84

# Text Normalization Patterns
RE_URL_NORM = re.compile(r"https?://\S+|www\.\S+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/\S*)?", re.IGNORECASE)
RE_EMAIL_NORM = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", re.IGNORECASE)
RE_PHONE_NORM = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b")
RE_CURR_NORM = re.compile(r"[\$₹€£¥]|rs\.?|inr", re.IGNORECASE)
RE_NUM_NORM = re.compile(r"\b\d+\b")
RE_SPEC_NORM = re.compile(r"[^\w\s]")
RE_SPACE_NORM = re.compile(r"\s+")

# ==============================================================================
# THREAD-SAFE MODEL MANAGER
# ==============================================================================

class MLArtifactManager:
    """Thread-safe Singleton for loading Scikit-Learn models and vectorizers."""
    _model: Optional[Any] = None
    _vectorizer: Optional[Any] = None
    _lock: threading.Lock = threading.Lock()
    _is_loaded: bool = False

    @classmethod
    def load(cls) -> bool:
        if cls._is_loaded:
            return True

        with cls._lock:
            if cls._is_loaded:  # Double-checked locking
                return True

            try:
                logger.info("Loading ML Artifacts from disk...")
                if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
                    logger.error("ML artifacts missing. Predictor will rely on rules/fallback.")
                    return False

                cls._model = joblib.load(MODEL_PATH)
                cls._vectorizer = joblib.load(VECTORIZER_PATH)
                cls._is_loaded = True
                logger.info("ML Artifacts loaded successfully.")
                return True
            except Exception as e:
                logger.exception(f"Failed to load ML artifacts: {e}")
                return False

    @classmethod
    def get(cls) -> Tuple[Optional[Any], Optional[Any]]:
        cls.load()
        return cls._model, cls._vectorizer

# Trigger initial load on import
MLArtifactManager.load()

# ==============================================================================
# PREPROCESSING & ML INFERENCE
# ==============================================================================

@lru_cache(maxsize=4096)
def _clean_text(text: str) -> str:
    """Normalizes text for the ML vectorizer."""
    if not text:
        return ""
    txt = text.lower()
    txt = RE_URL_NORM.sub(" URL ", txt)
    txt = RE_EMAIL_NORM.sub(" EMAIL ", txt)
    txt = RE_PHONE_NORM.sub(" PHONE ", txt)
    txt = RE_CURR_NORM.sub(" CURRENCY ", txt)
    txt = RE_NUM_NORM.sub(" NUMBER ", txt)
    txt = RE_SPEC_NORM.sub(" ", txt)
    return RE_SPACE_NORM.sub(" ", txt).strip()

def _run_ml(text: str) -> Tuple[float, float]:
    """Returns (spam_probability_float, ml_confidence_float)"""
    model, vectorizer = MLArtifactManager.get()
    
    if not model or not vectorizer:
        return 0.0, 0.5  # Fallback baseline

    try:
        clean = _clean_text(text)
        features = vectorizer.transform([clean])
        
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features)[0]
            spam_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            pred = model.predict(features)[0]
            spam_prob = 1.0 if pred in (1, "1", "spam", "scam") else 0.0

        ml_confidence = float(max(spam_prob, 1.0 - spam_prob))
        return spam_prob, ml_confidence

    except Exception as e:
        logger.error(f"ML Inference failed: {e}")
        return 0.0, 0.5

# ==============================================================================
# HYBRID ENGINE SYNTHESIS
# ==============================================================================

def _synthesize_decision(ml_prob: float, rule_score: int, rule_reasons: List[str]) -> Tuple[int, str, str, str]:
    """Calculates final threat score (0-100) and maps to risk/prediction constraints."""
    ml_base = ml_prob * 100.0

    # Dynamic Weighting based on Rule Severity
    if rule_score >= 60:
        hybrid = (ml_base * 0.35) + (rule_score * 0.65)
    elif rule_score < 0:
        hybrid = (ml_base * 0.50) + (rule_score * 0.50)
    else:
        hybrid = (ml_base * 0.55) + (rule_score * 0.45)

    has_critical = any("Critical" in r or "Trojan" in r for r in rule_reasons)
    if has_critical and hybrid < 75:
        hybrid = max(hybrid, 85.0)

    threat_score = max(0, min(100, int(round(hybrid))))

    if threat_score <= SCORE_SAFE_MAX:
        return threat_score, "LOW", "SAFE", "The message appears safe. Verify the sender if unsure."
    if threat_score <= SCORE_SUSPICIOUS_MAX:
        return threat_score, "MEDIUM", "SUSPICIOUS", "Exercise caution. Verify links and sender before responding."
    if threat_score <= SCORE_HIGH_MAX:
        return threat_score, "HIGH", "SCAM", "Do not click links, share OTPs, or provide personal information."
    
    return threat_score, "CRITICAL", "SCAM", "Immediately delete the message and report it as fraud."

def _calculate_final_confidence(ml_conf: float, threat_score: int, prediction: str) -> int:
    """Calculates final confidence as a strict 0-100 integer."""
    if prediction == "SAFE":
        # High threat score reduces confidence in a 'SAFE' prediction, and vice versa
        final_conf_float = max(ml_conf, (100.0 - threat_score) / 100.0)
    else:
        # High threat score increases confidence in a 'SCAM'/'SUSPICIOUS' prediction
        final_conf_float = max(ml_conf, threat_score / 100.0)

    # Convert to strict integer percentage
    confidence_pct = int(round(final_conf_float * 100))
    return max(0, min(100, confidence_pct))

# ==============================================================================
# PUBLIC API
# ==============================================================================

def predict_sms(text: str) -> Dict[str, Any]:
    """
    Main entrypoint for SMS analysis. Returns a standardized, FastAPI-ready dictionary.
    Confidence and Threat Score are guaranteed to be integers between 0 and 100.
    """
    if not text or not text.strip():
        return {
            "prediction": "SAFE",
            "confidence": 100,
            "risk": "LOW",
            "threat_score": 0,
            "reasons": ["Empty input string provided."],
            "recommendation": "The message appears safe. Verify the sender if unsure."
        }

    try:
        # 1. Rule Engine
        rules = analyze_rules(text)
        rule_score = rules.get("score", 0)
        reasons = rules.get("reasons", [])

        # 2. ML Engine
        ml_prob, ml_conf = _run_ml(text)

        # 3. Hybrid Synthesis
        threat_score, risk, prediction, rec = _synthesize_decision(ml_prob, rule_score, reasons)

        # 4. Strict Integer Confidence Formatter
        confidence = _calculate_final_confidence(ml_conf, threat_score, prediction)

        return {
            "prediction": prediction,
            "confidence": confidence,
            "risk": risk,
            "threat_score": threat_score,
            "reasons": reasons if reasons else ["Analyzed via standard NLP baseline."],
            "recommendation": rec
        }

    except Exception as e:
        logger.exception(f"Fatal error in prediction pipeline: {e}")
        return {
            "prediction": "SAFE",
            "confidence": 50,
            "risk": "LOW",
            "threat_score": 0,
            "reasons": ["Internal processing anomaly encountered. Fallback applied."],
            "recommendation": "The message appears safe. Verify the sender if unsure."
        }