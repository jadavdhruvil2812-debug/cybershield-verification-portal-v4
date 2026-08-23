"""
CyberShield AI - URL Rule Engine (v6.0 - Deep Phishing & Threat Analyzer)
Module: url_rule_engine.py
Location: ai-backend/services/url_rule_engine.py
"""

import re
import urllib.parse
from typing import Dict, Any, List

# ============================================================================
# THREAT INDICATOR CONSTANTS
# ============================================================================

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "rb.gy", "is.gd", 
    "cutt.ly", "goo.gl", "ow.ly", "rebrand.ly"
}

# Expanded High-Risk Phishing TLDs
SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "gq", "tk", "cf", "ml", "zip", "work", "country",
    "site", "online", "live", "info", "me", "club", "icu", "rest", "buzz",
    "monster", "vip", "cc", "space", "fit"
}

FREE_HOSTING_DOMAINS = {
    "000webhost", "netlify", "vercel", "pages.dev", 
    "firebaseapp", "github.io", "ngrok-free.app", "loca.lt"
}

LOGIN_KEYWORDS = {
    "login", "signin", "verify", "confirm", 
    "secure", "account", "update", "password", "auth"
}

BANKING_KEYWORDS = {
    "bank", "upi", "paytm", "gpay", "phonepe", 
    "wallet", "transaction", "payment", "refund", "kyc", "tds", "dispute"
}

BRANDS = {
    "amazon", "google", "microsoft", "apple", "paypal", "facebook", 
    "instagram", "whatsapp", "netflix", "flipkart", "sbi", "hdfc", 
    "icici", "axis", "kotak", "uidai", "aadhaar", "incometax", "indiapost",
    "fastag", "epfindia", "cibil", "jio", "airtel"
}

DANGEROUS_EXTENSIONS = [".apk", ".exe", ".scr", ".bat", ".vbs", ".cmd", ".msi"]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _is_ip_address(hostname: str) -> bool:
    """Check if the hostname is an IPv4 or IPv6 address."""
    if not hostname:
        return False
    ipv4_pattern = re.compile(r"^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$")
    ipv6_pattern = re.compile(r"^\[?[0-9a-fA-F:]+\]?$")
    return bool(ipv4_pattern.match(hostname) or ipv6_pattern.match(hostname))


def _has_random_characteristics(hostname: str) -> bool:
    """Detect domains that look randomly generated."""
    if not hostname:
        return False
    domain_part = hostname.split('.')[0]
    
    if sum(c.isdigit() for c in domain_part) > 6:
        return True
        
    consonants = re.compile(r"[bcdfghjklmnpqrstvwxyz]{5,}")
    if consonants.search(domain_part):
        return True
        
    return False


def _check_nested_redirects(url: str, query_string: str) -> bool:
    """Detect multiple redirects or URLs passed as parameters."""
    schemes = re.findall(r"https?://", url.lower())
    if len(schemes) > 1:
        return True
        
    redirect_params = {"url", "redirect", "next", "return_to", "goto", "target"}
    parsed_query = urllib.parse.parse_qs(query_string)
    for param in redirect_params:
        if param in parsed_query:
            return True
            
    return False


def _is_brand_impersonation(url_lower: str, hostname: str) -> bool:
    """Detect brand impersonation outside official root domain."""
    if not hostname:
        return False
        
    hostname_parts = hostname.split('.')
    root_domain = ".".join(hostname_parts[-2:]) if len(hostname_parts) >= 2 else hostname
    
    for brand in BRANDS:
        if brand in hostname:
            # Check if brand is not the legitimate registered domain
            if not root_domain.startswith(brand) and not root_domain.endswith(brand):
                return True
            if any(hostname.endswith(f".{tld}") for tld in SUSPICIOUS_TLDS):
                return True
                
    return False

# ============================================================================
# MAIN ENGINE
# ============================================================================

def analyze_url(url: str) -> Dict[str, Any]:
    score = 0
    reasons: List[str] = []
    
    parse_target = url if "://" in url else f"http://{url}"
    parsed_url = urllib.parse.urlparse(parse_target)
    
    url_lower = url.lower()
    hostname = (parsed_url.hostname or "").lower()
    path = parsed_url.path.lower()
    query = parsed_url.query.lower()
    
    # 1. Raw IP Address
    if _is_ip_address(hostname):
        score += 55
        reasons.append("URL uses a raw IP address instead of a domain name")

    # 2. Suspicious TLD
    tld = hostname.split('.')[-1] if '.' in hostname else ""
    if tld in SUSPICIOUS_TLDS:
        score += 45
        reasons.append(f"Domain uses a high-risk TLD (.{tld})")

    # 3. Direct Payload / APK Executable Link
    if any(path.endswith(ext) for ext in DANGEROUS_EXTENSIONS):
        score += 65
        reasons.append("Direct malicious executable or APK download (.apk / .exe)")

    # 4. Brand Impersonation & Typosquatting
    if _is_brand_impersonation(url_lower, hostname):
        score += 50
        reasons.append("URL attempts to impersonate a well-known financial or corporate brand")

    # 5. URL Shorteners
    if any(shortener in hostname for shortener in URL_SHORTENERS):
        score += 35
        reasons.append("URL uses a link shortener to hide destination")

    # 6. Free Hosting Services Abused for Phishing
    if any(free_host in hostname for free_host in FREE_HOSTING_DOMAINS):
        score += 30
        reasons.append("Domain is hosted on a free platform commonly used for phishing")

    # 7. Phishing / Harvesting Path Keywords
    if any(kw in path or kw in query for kw in LOGIN_KEYWORDS):
        score += 25
        reasons.append("URL path contains login or credential-harvesting keywords")

    # 8. Financial / Payment Hooks
    if any(kw in url_lower for kw in BANKING_KEYWORDS):
        score += 25
        reasons.append("URL contains financial or dispute keywords")

    # 9. Excessive Hyphens / Deceptive Subdomains
    clean_hostname = hostname[4:] if hostname.startswith("www.") else hostname
    if clean_hostname.count('-') >= 2 or clean_hostname.count('.') >= 3:
        score += 25
        reasons.append("Domain contains excessive subdomains or hyphens")

    # 10. Punycode (Homograph Attack)
    if "xn--" in hostname:
        score += 40
        reasons.append("Domain uses Punycode (homograph phishing indicator)")

    # 11. Random Domain Structure
    if _has_random_characteristics(hostname):
        score += 25
        reasons.append("Domain name appears randomly generated")

    # 12. Nested Redirect Loops
    if _check_nested_redirects(url, query):
        score += 30
        reasons.append("URL contains nested redirect parameters")

    score = min(score, 100)

    # Clean Binary Classification Status
    status = "Unsafe" if score >= 35 else "Safe"
    if not reasons:
        reasons.append("No suspicious indicators found")

    return {
        "score": score,
        "status": status,
        "risk_level": status,
        "reasons": reasons
    }