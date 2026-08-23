"""
CyberShield AI - URL Risk Predictor (v6.0 - Direct Binary Verdict Engine)
Module: url_predictor.py
Location: ai-backend/services/url_predictor.py
"""

import logging
import importlib
import urllib.parse
from typing import Any, Dict, Optional

# Dynamic Import support for both url_rule_engine and url_ruleengine
analyze_url = None
for _module_name in ("services.url_rule_engine", "services.url_ruleengine"):
    try:
        _rule_module = importlib.import_module(_module_name)
        analyze_url = getattr(_rule_module, "analyze_url", None)
        if callable(analyze_url):
            break

        _engine_class = getattr(_rule_module, "URLRuleEngine", None)
        if _engine_class is not None:
            analyze_url = _engine_class().evaluate
            break
    except (ImportError, AttributeError, TypeError):
        continue

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
# VERIFIED CLEAN DOMAINS WHITELIST (Zero False-Positive Guard)
# ============================================================================

SAFE_DOMAINS = {
    "google.com", "youtube.com", "github.com", "microsoft.com", "apple.com",
    "amazon.com", "amazon.in", "flipkart.com", "netflix.com", "linkedin.com",
    "twitter.com", "x.com", "instagram.com", "facebook.com", "wikipedia.org",
    "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "axisbank.com",
    "incometax.gov.in", "uidai.gov.in", "indiapost.gov.in", "jio.com", "airtel.in",
    "cloudflare.com", "fastapi.tiangolo.com", "nextjs.org", "python.org"
}

# ============================================================================
# DIRECT BINARY RECOMMENDATIONS MAPPING
# ============================================================================

RECOMMENDATIONS: Dict[str, str] = {
    "Safe": "This website is verified and appears safe to visit.",
    "Unsafe": "High threat detected! Do not visit this website or enter personal information."
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _validate_and_sanitize_url(raw_url: str) -> str:
    """Validates and cleans input URL strings."""
    if not raw_url or not isinstance(raw_url, str):
        raise ValueError("URL input must be a non-empty string.")

    cleaned_url = raw_url.strip()
    if not cleaned_url:
        raise ValueError("URL input string cannot be blank.")

    parse_target = cleaned_url if "://" in cleaned_url else f"http://{cleaned_url}"
    parsed = urllib.parse.urlparse(parse_target)
    
    if not parsed.netloc and not parsed.path:
        raise ValueError("Provided string is not a valid URL structure.")

    return cleaned_url


def _normalize_status(risk_level: str, threat_score: float) -> str:
    """Strict Binary Classification: Safe or Unsafe."""
    risk_upper = str(risk_level).strip().upper()

    if risk_upper in ["MALICIOUS", "SCAM", "UNSAFE", "HIGH", "CRITICAL", "SUSPICIOUS", "MEDIUM"] or threat_score >= 35.0:
        return "Unsafe"
    return "Safe"


# ============================================================================
# PUBLIC PREDICTION FUNCTION
# ============================================================================

def predict_url(url: str) -> Dict[str, Any]:
    """
    Analyzes a URL and returns clean binary status (Safe / Unsafe) and recommendation.
    """
    try:
        # 1. Validate & Sanitize URL
        sanitized_url = _validate_and_sanitize_url(url)

        # 2. Extract Hostname for Whitelist Evaluation
        parse_target = sanitized_url if "://" in sanitized_url else f"http://{sanitized_url}"
        parsed = urllib.parse.urlparse(parse_target)
        hostname = (parsed.hostname or "").lower()

        # 3. Whitelist Guard (Instant Safe)
        for safe_d in SAFE_DOMAINS:
            if hostname == safe_d or hostname.endswith("." + safe_d):
                return {
                    "url": sanitized_url,
                    "status": "Safe",
                    "recommendation": RECOMMENDATIONS["Safe"]
                }

        # 4. Call Rule Engine Analysis
        threat_score = 0.0
        raw_risk_level = "SAFE"

        if callable(analyze_url):
            rule_output = analyze_url(sanitized_url)
            threat_score = float(rule_output.get("score", 0.0))
            raw_risk_level = str(rule_output.get("status", rule_output.get("risk_level", "SAFE")))

        # 5. Determine Binary Status (Safe vs Unsafe)
        status = _normalize_status(raw_risk_level, threat_score)
        recommendation = RECOMMENDATIONS.get(status, RECOMMENDATIONS["Safe"])

        return {
            "url": sanitized_url,
            "status": status,
            "recommendation": recommendation
        }

    except ValueError as val_err:
        logger.warning(f"Validation error for URL '{url}': {val_err}")
        return {
            "url": url,
            "status": "Unsafe",
            "recommendation": "Invalid URL format provided. Treat with caution."
        }
    except Exception as exc:
        logger.exception(f"Unexpected error predicting risk for URL '{url}': {exc}")
        return {
            "url": url,
            "status": "Unsafe",
            "recommendation": "High risk detected due to unverified URL processing."
        }