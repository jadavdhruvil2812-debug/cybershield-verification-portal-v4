"""
CyberShield AI - SMS & QR Payload Threat Predictor (v7.0 Master)
Location: ai-backend/services/predictor.py
"""

import logging
import re
from typing import Any, Dict
import joblib

from services.rule_engine import RuleEngine
from services.heuristic_engine import HeuristicEngine
from services.risk_calculator import RiskCalculator

logger = logging.getLogger(__name__)

# Load ML artifacts safely
try:
    model = joblib.load("models/sms_model.pkl")
    vectorizer = joblib.load("models/vectorizer.pkl")
except Exception as e:
    logger.warning("ML models missing (%s). Running heuristic/rule mode.", e)
    model = None
    vectorizer = None

rule_engine = RuleEngine()
heuristic_engine = HeuristicEngine()
risk_calculator = RiskCalculator()

# -------------------------------------------------------------------------
# 1. LEGITIMATE TRANSACTION NOTIFICATION PATTERNS
# -------------------------------------------------------------------------
LEGITIMATE_NOTIFICATION_PATTERNS = [
    r"\b(used for|debited|credited|spent|txn id|ref no|avail(?:able)?\s+bal(?:ance)?|deposited|sent rs|paid rs|withdrawn from atm)\b",
    r"\b(otp for|verification otp|login otp|is your otp|do not share (?:this )?otp|valid for \d+ min)\b",
    r"\b(out for delivery|shipment|consignment|delivery pin|tracking #|package containing|delivery associate|courier executive)\b",
    r"\b(ride with driver|is confirmed for pickup|flight \w+-\d+|web check-in|boarding gate|train pnr)\b",
    r"\b(monthly statement|total due|minimum due|due date|invoice sent|recharge of rs.*successful)\b",
]

LEGITIMATE_REGEX = re.compile("|".join(LEGITIMATE_NOTIFICATION_PATTERNS), re.IGNORECASE)

# High-threat link / domain regex
SUSPICIOUS_LINK_REGEX = re.compile(
    r"(https?://|www\.)[^\s<>\"']+(\.xyz|\.top|\.site|\.link|\.online|\.live|\.info|\.me|\.club|\.click|\.apk|\.rest|\.space|\.buzz|\.icu|\.cc|\.tk|\.ml|\.ga|\.cf|\.gq|\.vercel\.app|\.pages\.dev|\.firebaseapp\.com)",
    re.IGNORECASE
)

# Social Engineering & Financial Threat Triggers
HIGH_THREAT_KEYWORDS_REGEX = re.compile(
    r"\b(unauthorized.*transaction|cancel the payment|dispute|mistakenly credited|unadjusted tds|reschedule|blacklisted|biometric.*disablement|pre-screening|shortlisted for.*role|cashback claim|reward point|lottery won|kyc verification|account freeze|pan verify|deactivation notice|call.*officer)\b",
    re.IGNORECASE
)

# Direct UPI Scam Intent Triggers
UPI_SCAM_REGEX = re.compile(
    r"(upi://pay\?.*(cashback|reward|lottery|prize|claim|kyc|bonus|refund|freeze))",
    re.IGNORECASE
)


def predict_sms(text: str) -> Dict[str, Any]:
    if not text or not str(text).strip():
        return {
            "status": "Safe",
            "recommendation": "Empty content provided.",
            "input_text": ""
        }

    text_clean = str(text).strip()
    text_lower = text_clean.lower()

    # 1. Direct Interception for UPI Deceptive Schemas & Malicious Links
    if bool(UPI_SCAM_REGEX.search(text_clean)) or (".apk" in text_lower and "http" in text_lower):
        return {
            "status": "Unsafe",
            "recommendation": "High threat detected! Deceptive payment redirect or malicious application payload found.",
            "input_text": text_clean
        }

    # 2. Rule Engine Evaluation
    if hasattr(rule_engine, "evaluate"):
        rule_res = rule_engine.evaluate(text_clean)
    elif hasattr(rule_engine, "evaluate_sms"):
        rule_res = rule_engine.evaluate_sms(text_clean)
    else:
        rule_res = None

    rule_score = getattr(rule_res, "score", 0.0) if rule_res else 0.0
    rule_status = getattr(rule_res, "status", "Safe") if rule_res else "Safe"

    # 3. Heuristic Engine Evaluation
    try:
        heuristic_res = heuristic_engine.evaluate(text_clean)
        heuristic_score = getattr(heuristic_res, "score", 0.0)
    except Exception:
        heuristic_score = 0.0

    # 4. Direct Threat Interception (Vishing / Untrusted Links / Urgency Rules)
    has_suspicious_link = bool(SUSPICIOUS_LINK_REGEX.search(text_clean))
    has_high_threat = bool(HIGH_THREAT_KEYWORDS_REGEX.search(text_clean))

    if rule_status.upper() == "UNSAFE" or rule_score >= 35.0 or (has_suspicious_link and has_high_threat) or (has_suspicious_link and "login" in text_lower):
        return {
            "status": "Unsafe",
            "recommendation": "High threat detected! Message contains deceptive phishing hooks or social engineering links.",
            "input_text": text_clean
        }

    # 5. Legitimate Notification Whitelist Guard (Strict: Only if zero links and zero threats)
    has_legit_pattern = bool(LEGITIMATE_REGEX.search(text_clean))
    has_any_url = ("http" in text_lower or "www." in text_lower or ".com/" in text_lower or ".in/" in text_lower or "upi://" in text_lower)

    if has_legit_pattern and not has_any_url and rule_score == 0 and not has_high_threat:
        return {
            "status": "Safe",
            "recommendation": "This message is a verified service or transactional alert and is safe to interact with.",
            "input_text": text_clean
        }

    # 6. ML Model Evaluation
    ml_score = 0.0
    ml_pred = "SAFE"
    ml_confidence = 50.0

    if model and vectorizer:
        try:
            vec = vectorizer.transform([text_clean])
            pred_val = model.predict(vec)[0]
            ml_pred = "SCAM" if pred_val == 1 else "SAFE"

            try:
                probs = model.predict_proba(vec)[0]
                scam_prob = probs[1]
                ml_score = float(scam_prob * 100.0)
                ml_confidence = round(float(probs[pred_val] * 100.0), 2)
            except AttributeError:
                ml_score = 100.0 if pred_val == 1 else 0.0
        except Exception as e:
            logger.error("ML prediction runtime failure: %s", e)

    # 7. Composite Decision
    try:
        risk_res = risk_calculator.calculate(
            ml_score=ml_score,
            ml_confidence=ml_confidence,
            ml_prediction=ml_pred,
            rule_score=rule_score,
            heuristic_score=heuristic_score
        )
        raw_status = getattr(risk_res, "status", "Safe")
        clean_status = "Safe" if raw_status.upper() in ["SAFE", "CLEAN", "LEGITIMATE"] else "Unsafe"
        recommendation = getattr(
            risk_res,
            "recommendation",
            "This content appears legitimate." if clean_status == "Safe" else "High threat detected! Do not interact."
        )
    except Exception:
        # Fallback Calculation (Prevents Silent Pass to Safe)
        is_threat = (ml_score >= 50.0) or (rule_score >= 30.0) or has_suspicious_link or has_high_threat
        clean_status = "Unsafe" if is_threat else "Safe"
        recommendation = (
            "High threat detected! Do not interact with links or payment requests."
            if clean_status == "Unsafe"
            else "This content appears legitimate and safe to interact with."
        )

    return {
        "status": clean_status,
        "recommendation": recommendation,
        "input_text": text_clean
    }