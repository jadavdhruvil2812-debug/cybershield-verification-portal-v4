"""
CyberShield Enterprise Multi-Layer URL Analyzer (v9.1 - Unified Bulletproof Defense)
Includes URL Unshortening, Homograph, Brand Spoofing, Cloud Subdomains & Punctuation Stripping
Location: ai-backend/services/url_analyzer.py
"""

import logging
import re
import socket
from typing import Any, Dict, List, Optional
from urllib.parse import parse_qs, unquote, urlparse
import requests

logger = logging.getLogger(__name__)

# Optional VirusTotal integration
try:
    from services.virustotal_service import check_virustotal_url
except ImportError:
    try:
        from .virustotal_service import check_virustotal_url
    except ImportError:
        def check_virustotal_url(u: str) -> Optional[Dict[str, Any]]:
            return None


# ============================================================================
# 1. THREAT SIGNATURES & REPUTATION DATASETS
# ============================================================================

# Strictly Verified Root Domains (Safe Haven)
VERIFIED_CLEAN_ROOTS = {
    # Tech & Infrastructure
    "google.com", "google.co.in", "youtube.com", "github.com", "githubusercontent.com",
    "microsoft.com", "apple.com", "cloudflare.com", "amazonaws.com",
    "fastapi.tiangolo.com", "nextjs.org", "python.org", "wikipedia.org",
    "meta.com", "instagram.com", "linkedin.com", "x.com", "twitter.com",
    "stackoverflow.com", "mozilla.org",
    # Indian Banking & Enterprise
    "sbi.co.in", "onlinesbi.sbi", "statebankofindia.com", "hdfcbank.com", "hdfc.com",
    "icicibank.com", "axisbank.com", "pnbindia.in", "kotak.com", "rbi.org.in", 
    "npci.org.in", "paytm.com", "phonepe.com",
    # Government Portals
    "incometax.gov.in", "uidai.gov.in", "indiapost.gov.in", "epfindia.gov.in",
    "parivahan.gov.in", "cbic.gov.in", "digilocker.gov.in", "india.gov.in",
    # Utilities & Telecommunications
    "jio.com", "airtel.in", "vi.in", "bsnl.co.in",
    # Major E-Commerce & OTT
    "amazon.in", "amazon.com", "flipkart.com", "netflix.com", "hotstar.com", "swiggy.com", "zomato.com"
}

# Free Hosting & Staging Platforms (Heavily abused for instant phishing)
ABUSABLE_CLOUD_PLATFORMS = {
    "vercel.app", "netlify.app", "pages.dev", "firebaseapp.com",
    "github.io", "000webhostapp.com", "ngrok-free.app", "loca.lt",
    "glitch.me", "render.com", "appspot.com", "weeblysite.com", "webflow.io"
}

# Suspicious Top-Level Domains (High spam-to-legit ratio)
HIGH_RISK_TLDS = {
    ".xyz", ".top", ".club", ".live", ".online", ".site", ".tech",
    ".vip", ".work", ".icu", ".cc", ".tk", ".ml", ".ga", ".cf", ".gq",
    ".me", ".info", ".buzz", ".rest", ".monster", ".space", ".fit",
    ".click", ".link", ".to", ".party", ".bid", ".loan", ".racing", ".kim"
}

# Sensitive Target Brands frequently spoofed
CRITICAL_BRANDS = [
    "sbi", "onlinesbi", "hdfc", "icici", "axis", "kotak", "pnb", "paytm", "phonepe", "gpay",
    "amazon", "flipkart", "incometax", "uidai", "aadhaar", "indiapost", "fastag",
    "epfo", "uan", "cibil", "netflix", "apple", "microsoft", "google", "meta"
]

# High-Threat Executable / Script Extensions
DANGEROUS_PAYLOAD_EXTENSIONS = [
    ".apk", ".exe", ".scr", ".bat", ".vbs", ".cmd", ".msi", ".ps1", ".hta", ".pif", ".jar", ".iso"
]

# Sensitive Actionable Phishing Keywords
PHISHING_INTENT_KEYWORDS = [
    "kyc-update", "claim-reward", "dispute-case", "unfreeze", "bank-login",
    "verify-pan", "customer-pan-verify", "refund-process", "bill-payment",
    "urgent-verify", "biometric-lock", "account-suspended", "redeem-points",
    "winner", "lottery", "cashback-claim"
]

# Common URL Shorteners
SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "cutt.ly", "rb.gy", "shorturl.at"
}


# ============================================================================
# 2. HEURISTIC & FUZZY DETECTION HELPERS
# ============================================================================

def _calculate_levenshtein(s1: str, s2: str) -> int:
    """Calculates edit distance to detect typosquatting."""
    if len(s1) < len(s2):
        return _calculate_levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def _check_typosquatting(domain_segment: str) -> Optional[str]:
    """Detects visual lookalike brand spoofing (Levenshtein distance of 1 or 2)."""
    normalized = domain_segment.replace("0", "o").replace("1", "l").replace("vv", "w")
    for brand in CRITICAL_BRANDS:
        if len(brand) >= 4:
            dist = _calculate_levenshtein(normalized, brand)
            if dist in [1, 2] and normalized != brand:
                return f"Typosquatting variant of brand '{brand}'"
    return None


def _is_ip_literal(hostname: str) -> bool:
    """Detects raw IPv4, IPv6, or obfuscated decimal/hex IP addresses."""
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
        return True
    if re.match(r"^0x[0-9a-fA-F]+$", hostname) or re.match(r"^\d{8,11}$", hostname):
        return True
    if ":" in hostname and re.match(r"^[0-9a-fA-F:]+$", hostname):
        return True
    return False


def _unshorten_url(raw_url: str) -> str:
    """Resolve shortened URL to destination if a shortener is used."""
    try:
        target = raw_url if raw_url.startswith(("http://", "https://")) else f"http://{raw_url}"
        domain = urlparse(target).netloc.lower().split(":")[0]
        if any(shortener in domain for shortener in SHORTENERS):
            resp = requests.head(target, allow_redirects=True, timeout=2.5)
            return resp.url
    except Exception:
        pass
    return raw_url


# ============================================================================
# 3. MASTER URL EVALUATION PIPELINE
# ============================================================================

class URLAnalyzer:
    """Unified Class Interface for URL Reputation & Deep Threat Intelligence."""

    def analyze(self, url: str) -> Dict[str, Any]:
        return analyze_url_reputation(url)


def analyze_url_reputation(url: str) -> Dict[str, Any]:
    if not url or not str(url).strip():
        return {
            "url": "",
            "status": "Safe",
            "score": 0.0,
            "threat_factors": [],
            "recommendation": "Empty URL input provided."
        }

    # Sanitize surrounding whitespaces and trailing sentence punctuations
    raw_url = str(url).strip().rstrip(".,;!?:")
    
    # Resolve Shortener if present
    expanded_url = _unshorten_url(raw_url)
    decoded_url = unquote(expanded_url)
    formatted_url = decoded_url if re.match(r"^https?://", decoded_url, re.IGNORECASE) else f"http://{decoded_url}"

    score = 0.0
    threat_factors: List[str] = []

    try:
        parsed = urlparse(formatted_url)
        hostname = (parsed.hostname or "").lower().rstrip(".")
        path = parsed.path.lower()
        full_lower = formatted_url.lower()

        # -------------------------------------------------------------
        # LAYER 1: HOMOGRAPH & PUNYCODE EXPLOITATION
        # -------------------------------------------------------------
        if "xn--" in hostname or "xn--" in full_lower:
            score += 85.0
            threat_factors.append("Punycode / IDN Homograph visual brand impersonation")

        # -------------------------------------------------------------
        # LAYER 2: OPEN REDIRECT / TRAMPOLINE PAYLOAD DETECTION
        # -------------------------------------------------------------
        redirect_params = {"q", "url", "redirect", "dest", "target", "link", "next", "continue", "return_to", "goto"}
        parsed_query = parse_qs(parsed.query)
        
        for param, values in parsed_query.items():
            if param.lower() in redirect_params:
                for val in values:
                    if re.match(r"^https?://", val, re.IGNORECASE):
                        target_netloc = urlparse(val).netloc.lower().rstrip(".")
                        if not any(target_netloc == v or target_netloc.endswith("." + v) for v in VERIFIED_CLEAN_ROOTS):
                            score += 75.0
                            threat_factors.append(f"Malicious open-redirect trampoline pointing to '{target_netloc}'")

        # -------------------------------------------------------------
        # LAYER 3: FREE CLOUD STAGING SUBDOMAIN PHISHING
        # -------------------------------------------------------------
        for platform in ABUSABLE_CLOUD_PLATFORMS:
            if hostname.endswith(platform):
                subdomain = hostname.replace(platform, "").strip(".")
                if any(brand in subdomain for brand in CRITICAL_BRANDS):
                    score += 70.0
                    threat_factors.append(f"Brand impersonation phishing hosted on cloud staging platform ({hostname})")
                elif any(kw in subdomain for kw in ["login", "verify", "secure", "auth", "portal", "update"]):
                    score += 45.0
                    threat_factors.append("Deceptive credential-harvesting subdomain on free cloud host")

        # -------------------------------------------------------------
        # LAYER 4: TRUSTED ROOT DOMAIN VERIFICATION (Whitelist Guard)
        # -------------------------------------------------------------
        if score == 0.0:
            for clean_root in VERIFIED_CLEAN_ROOTS:
                if hostname == clean_root or hostname.endswith("." + clean_root):
                    return {
                        "url": raw_url,
                        "status": "Safe",
                        "score": 0.0,
                        "threat_factors": [],
                        "recommendation": "This website is an officially verified legitimate domain and safe to visit."
                    }

        # -------------------------------------------------------------
        # LAYER 5: MALICIOUS FILE & DIRECT PAYLOAD DELIVERY
        # -------------------------------------------------------------
        if any(path.endswith(ext) for ext in DANGEROUS_PAYLOAD_EXTENSIONS):
            score += 85.0
            threat_factors.append("Direct downloadable executable or malicious script payload detected")

        # -------------------------------------------------------------
        # LAYER 6: RAW IP ADDRESS HOSTS
        # -------------------------------------------------------------
        if _is_ip_literal(hostname):
            score += 65.0
            threat_factors.append("Host points directly to an IP address instead of a domain name")

        # -------------------------------------------------------------
        # LAYER 7: HIGH-RISK / PHISHING TLDS
        # -------------------------------------------------------------
        if any(hostname.endswith(tld) for tld in HIGH_RISK_TLDS):
            score += 55.0
            threat_factors.append("Domain utilizes a high-risk / phishing-abused TLD extension")

        # -------------------------------------------------------------
        # LAYER 8: BRAND IMPERSONATION & TYPOSQUATTING
        # -------------------------------------------------------------
        matched_brands = [b for b in CRITICAL_BRANDS if b in hostname]
        if matched_brands:
            score += 60.0
            threat_factors.append(f"Domain spoofing brand identity ({', '.join(matched_brands[:2])})")
        
        domain_parts = hostname.split(".")
        for part in domain_parts:
            typo_finding = _check_typosquatting(part)
            if typo_finding:
                score += 50.0
                threat_factors.append(typo_finding)

        # -------------------------------------------------------------
        # LAYER 9: DECEPTIVE SUBDOMAIN STACKING & PHISHING PATHS
        # -------------------------------------------------------------
        clean_host = hostname[4:] if hostname.startswith("www.") else hostname
        if clean_host.count(".") >= 3 or clean_host.count("-") >= 2:
            score += 25.0
            threat_factors.append("Deceptive URL structure with excessive subdomains/hyphens")

        if any(trigger in full_lower for trigger in PHISHING_INTENT_KEYWORDS):
            score += 40.0
            threat_factors.append("Credential-harvesting or scam intent path detected in URL")

        # -------------------------------------------------------------
        # LAYER 10: VIRUSTOTAL THREAT INTELLIGENCE (Optional Fallback)
        # -------------------------------------------------------------
        vt_data = check_virustotal_url(formatted_url)
        if vt_data and vt_data.get("positives", 0) > 0:
            score += 60.0
            threat_factors.append(f"Flagged by VirusTotal threat intelligence ({vt_data['positives']} detections)")

    except Exception as exc:
        logger.error("Error executing deep URL analysis for %s: %s", url, exc)
        return {
            "url": raw_url,
            "status": "Unsafe",
            "score": 100.0,
            "threat_factors": ["Malformed or unparseable URL structure"],
            "recommendation": "Unable to verify URL safely. Treat with high caution."
        }

    # =========================================================================
    # FINAL CLASSIFICATION DECISION
    # =========================================================================
    final_score = min(score, 100.0)
    is_unsafe = final_score >= 35.0
    status = "Unsafe" if is_unsafe else "Safe"
    
    recommendation = (
        "High threat detected! This link appears to be malicious, deceptive, or a phishing clone."
        if is_unsafe
        else "This URL appears clean and safe to visit."
    )

    return {
        "url": raw_url,
        "status": status,
        "score": final_score,
        "threat_factors": threat_factors,
        "recommendation": recommendation
    }


# Singleton instance for modular imports across engines
url_analyzer = URLAnalyzer()