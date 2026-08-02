"""
CyberShield URL Reputation Analyzer
Analyzes URLs for malicious indicators, brand typosquatting, shorteners, and raw IP hosts.
Outputs integer threat_score (0-100) and integer confidence (0-100).
"""

import logging
import re
from typing import Any, Dict, List
from urllib.parse import urlparse

from .virustotal_service import check_virustotal_url

logger = logging.getLogger(__name__)

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "cutt.ly", "goo.gl", "t.co",
    "is.gd", "v.gd", "tiny.cc", "rb.gy", "shorturl.at", "ow.ly"
}

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".live", ".online", ".site",
    ".tech", ".vip", ".work", ".icu", ".cc", ".tk", ".ml", ".ga", ".cf", ".gq"
}

TARGET_BRANDS = [
    "sbi", "hdfc", "icici", "axis", "paytm", "gpay", "phonepe",
    "amazon", "flipkart", "income-tax", "incometax", "aadhaar",
    "aadhar", "kyc", "pan", "bescom", "mahavitaran"
]


def analyze_url_reputation(url: str) -> Dict[str, Any]:
    """Analyzes URL reputation and guarantees integer scores and non-crashing output."""
    if not url or not str(url).strip():
        return {
            "url": url,
            "status": "SAFE",
            "prediction": "SAFE",
            "threat_score": 0,
            "confidence": 100,
            "risk": "LOW",
            "details": ["URL field is empty."]
        }

    raw_url = str(url).strip()
    formatted_url = raw_url if re.match(r"^https?://", raw_url, re.IGNORECASE) else f"http://{raw_url}"

    score = 0.0
    details: List[str] = []

    try:
        parsed = urlparse(formatted_url)
        domain = parsed.netloc.lower()
        if ":" in domain:
            domain = domain.split(":")[0]
    except Exception as exc:
        logger.error("Error parsing URL %s: %s", url, exc)
        return {
            "url": url,
            "status": "SUSPICIOUS",
            "prediction": "SUSPICIOUS",
            "threat_score": 50,
            "confidence": 60,
            "risk": "MEDIUM",
            "details": ["Invalid URL structure."]
        }

    # 1. Direct IP Address Host
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
        score += 55.0
        details.append("Host points directly to an IP address instead of a domain name.")

    # 2. URL Shortener Check
    if any(shortener in domain for shortener in URL_SHORTENERS):
        score += 35.0
        details.append("Uses a URL shortening service to hide final destination.")

    # 3. Suspicious TLD Check
    if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        score += 30.0
        details.append("Domain uses a high-risk top-level domain (TLD).")

    # 4. Brand Typosquatting Check
    for brand in TARGET_BRANDS:
        if brand in domain and not (domain.endswith(f"{brand}.com") or domain.endswith(f"{brand}.in") or domain.endswith(f"{brand}.org")):
            score += 50.0
            details.append(f"Domain contains targeted brand name '{brand}' in a suspicious context.")
            break

    # 5. Subdomain Depth Check
    if domain.count(".") >= 3:
        score += 20.0
        details.append("Excessive subdomains detected.")

    # 6. Optional VirusTotal Intelligence Fallback
    vt_result = check_virustotal_url(formatted_url)
    if vt_result and vt_result.get("positives", 0) > 0:
        score += 40.0
        details.append(f"Flagged by VirusTotal threat intelligence ({vt_result['positives']} detections).")

    final_threat = int(round(max(0.0, min(100.0, score))))

    if final_threat >= 65:
        status = "MALICIOUS"
        prediction = "SCAM"
        risk = "HIGH"
        confidence = 90 + int(round(min(9.0, (final_threat - 65) / 3.88)))
    elif final_threat >= 35:
        status = "SUSPICIOUS"
        prediction = "SUSPICIOUS"
        risk = "MEDIUM"
        confidence = 65 + int(round(abs(final_threat - 50) * 0.8))
    else:
        status = "SAFE"
        prediction = "SAFE"
        risk = "LOW"
        confidence = 92 + int(round(min(7.0, (35 - final_threat) / 5.0)))
        if not details:
            details.append("No obvious malicious indicators detected in URL structure.")

      # Recommendation generator
    if prediction == "SAFE":
        recommendation = (
            "This website appears safe. Always verify the domain before entering sensitive information."
        )
    elif prediction == "SUSPICIOUS":
        recommendation = (
            "This website shows suspicious indicators. Proceed with caution and avoid entering passwords or banking details."
        )
    else:
        recommendation = (
            "This website is highly suspicious or malicious. Do NOT open it or enter any personal information."
        )

    return {
        "url": url,
        "status": status,
        "prediction": prediction,
        "threat_score": final_threat,
        "confidence": confidence,
        "risk": risk,
        "reasons": details,
        "recommendation": recommendation
    }