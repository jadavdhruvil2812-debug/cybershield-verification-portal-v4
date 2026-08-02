"""
CyberShield AI - URL Risk Predictor
Module: url_predictor.py

This module provides a hybrid URL risk prediction engine for CyberShield.
It validates input URLs, executes rule-based static analysis via `services.url_rule_engine`,
calculates enterprise confidence percentages, maps threat levels, and provides an extensible
interface for future machine learning model inference integration.
"""

import logging
import urllib.parse
from typing import Any, Dict, List, Optional

from services.url_rule_engine import analyze_url

# ============================================================================
# LOGGING SETUP
# ============================================================================

logger = logging.getLogger("cybershield.url_predictor")
if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )

# ============================================================================
# RECOMMENDATIONS MAPPING
# ============================================================================

RECOMMENDATIONS: Dict[str, str] = {
    "SAFE": "This URL appears safe.",
    "SUSPICIOUS": "Proceed carefully. Verify before opening.",
    "MALICIOUS": "Do NOT visit this website."
}

# ============================================================================
# ML INTEGRATION PLACEHOLDER
# ============================================================================

class MLURLClassifierPlaceholder:
    """
    Placeholder class for future Machine Learning model integration.
    Allows seamless blending of ML probability scores with rule-engine scores.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self._is_loaded = False

    def load_model(self) -> bool:
        """Simulate loading a trained ML model (e.g., Random Forest or XGBoost)."""
        logger.info("ML URL Classifier placeholder initialized (No active model loaded).")
        self._is_loaded = False
        return self._is_loaded

    def predict_probability(self, url: str) -> Optional[float]:
        """
        Predict probability of URL being malicious (0.0 to 1.0).
        Currently returns None until trained model is attached.
        """
        if not self._is_loaded:
            return None
        return 0.0


# Instantiate singleton placeholder instance
ml_classifier = MLURLClassifierPlaceholder()

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _validate_and_sanitize_url(raw_url: str) -> str:
    """
    Validates and cleans input URL strings.
    
    Raises:
        ValueError: If input is empty or invalid.
    """
    if not raw_url or not isinstance(raw_url, str):
        raise ValueError("URL input must be a non-empty string.")

    cleaned_url = raw_url.strip()
    if not cleaned_url:
        raise ValueError("URL input string cannot be blank.")

    # Validate basic parseability
    parse_target = cleaned_url if "://" in cleaned_url else f"http://{cleaned_url}"
    parsed = urllib.parse.urlparse(parse_target)
    
    if not parsed.netloc and not parsed.path:
        raise ValueError("Provided string is not a valid URL structure.")

    return cleaned_url


def _calculate_confidence(risk_level: str, threat_score: int) -> float:
    """
    Computes a percentage confidence score (never 0.xx decimals) based on risk tier and threat score.
    
    Ranges:
        SAFE: 90.00% - 99.00%
        SUSPICIOUS: 70.00% - 90.00%
        MALICIOUS: 95.00% - 99.00%
    """
    if risk_level == "SAFE":
        # Lower threat score = higher confidence in safety
        bounded_score = max(0, min(29, threat_score))
        confidence = 99.0 - (bounded_score / 29.0) * 9.0
    elif risk_level == "SUSPICIOUS":
        # Medium risk range scaling (30 - 69)
        bounded_score = max(30, min(69, threat_score))
        confidence = 70.0 + ((bounded_score - 30) / 39.0) * 20.0
    elif risk_level == "MALICIOUS":
        # High threat range scaling (70 - 100)
        bounded_score = max(70, min(100, threat_score))
        confidence = 95.0 + ((bounded_score - 70) / 30.0) * 4.0
    else:
        confidence = 85.0

    return round(confidence, 2)


# ============================================================================
# PUBLIC PREDICTION FUNCTION
# ============================================================================

def predict_url(url: str) -> Dict[str, Any]:
    """
    Analyzes a URL and generates a complete risk assessment prediction object.
    
    Args:
        url (str): Target URL string to analyze.
        
    Returns:
        Dict[str, Any]: Standardized CyberShield response JSON structure.
    """
    try:
        # 1. Validate URL
        sanitized_url = _validate_and_sanitize_url(url)

        # 2. Call Rule Engine Analysis
        rule_output = analyze_url(sanitized_url)

        # 3. Read Rule Output Attributes
        threat_score: int = rule_output.get("score", 0)
        risk_level: str = rule_output.get("risk_level", "SAFE")
        reasons: List[str] = rule_output.get("reasons", [])
        indicators: Dict[str, bool] = rule_output.get("indicators", {})
        category: str = rule_output.get("category", "Unknown")

        # 4. Future ML Blend Placeholder (If active ML model present)
        ml_prob = ml_classifier.predict_probability(sanitized_url)
        if ml_prob is not None:
            logger.debug(f"ML probability computed: {ml_prob}")
            # Potential future blending logic:
            # threat_score = int((threat_score * 0.6) + (ml_prob * 100 * 0.4))

        # 5. Generate Confidence
        confidence = _calculate_confidence(risk_level, threat_score)

        # 6. Map Recommendation
        recommendation = RECOMMENDATIONS.get(risk_level, "Exercise caution when visiting unknown links.")

        return {
            "url": sanitized_url,
            "prediction": risk_level,
            "risk_level": risk_level,
            "confidence": confidence,
            "threat_score": threat_score,
            "category": category,
            "recommendation": recommendation,
            "reasons": reasons,
            "indicators": indicators
        }

    except ValueError as val_err:
        logger.warning(f"Validation error for URL '{url}': {val_err}")
        return {
            "url": url,
            "prediction": "INVALID",
            "risk_level": "UNKNOWN",
            "confidence": 0.00,
            "threat_score": 0,
            "category": "Invalid Input",
            "recommendation": "Provide a valid, well-formed URL.",
            "reasons": [str(val_err)],
            "indicators": {}
        }
    except Exception as exc:
        logger.exception(f"Unexpected error predicting risk for URL '{url}': {exc}")
        return {
            "url": url,
            "prediction": "ERROR",
            "risk_level": "UNKNOWN",
            "confidence": 0.00,
            "threat_score": 0,
            "category": "Internal Processing Error",
            "recommendation": "Unable to process request due to an internal system error.",
            "reasons": ["An unexpected system error occurred during analysis."],
            "indicators": {}
        }