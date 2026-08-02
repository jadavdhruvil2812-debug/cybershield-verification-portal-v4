"""
CyberShield Predictor Module - Pure Rule Engine Driven (Zero ML Override Issues)
"""

import logging
from typing import Any, Dict

from .rule_engine import RuleEngine, RuleEngineResult

logger = logging.getLogger(__name__)


def predict_sms(text: str) -> Dict[str, Any]:
    if not text or not str(text).strip():
        return {
            "prediction": "SAFE",
            "confidence": 100,
            "threat_score": 0,
            "risk": "LOW",
            "reasons": ["Empty message."],
            "recommendation": "Message appears safe.",
            "sms": text,
            "matched_rules": [],
            "categories": []
        }

    # Direct Rule Engine Evaluation (No ML Model interference)
    engine = RuleEngine()
    rule_res: RuleEngineResult = engine.evaluate(text)

    threat_score = float(rule_res.score)
    final_threat = int(round(max(0.0, min(100.0, threat_score))))

    # Accurate Classification Thresholds
    if final_threat >= 65:
        prediction = "SCAM"
        risk = "HIGH"
    elif final_threat >= 35:
        prediction = "SUSPICIOUS"
        risk = "MEDIUM"
    else:
        prediction = "SAFE"
        risk = "LOW"

    # Dynamic Confidence Calculation based on threat severity
    if risk == "SAFE":
        final_confidence = int(round(88 + (35 - final_threat) * 0.3))
        final_confidence = max(80, min(98, final_confidence))
    elif risk == "HIGH":
        final_confidence = int(round(82 + (final_threat - 65) * 0.5))
        final_confidence = max(80, min(98, final_confidence))
    else:
        final_confidence = int(round(60 + abs(final_threat - 50) * 0.6))
        final_confidence = max(60, min(80, final_confidence))

    matched_rules_data = [
        {
            "rule_id": r.rule_id,
            "name": r.name,
            "category": r.category,
            "severity": r.severity,
            "reason": r.reason,
            "weight": r.weight
        }
        for r in rule_res.matched_rules
    ]

    return {
        "prediction": prediction,
        "confidence": final_confidence,
        "risk": risk,
        "threat_score": final_threat,
        "reasons": rule_res.reasons,
        "recommendation": rule_res.recommendation,
        "sms": text,
        "matched_rules": matched_rules_data,
        "categories": rule_res.categories
    }