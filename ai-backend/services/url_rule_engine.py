"""
CyberShield AI - URL Rule Engine
Module: url_rule_engine.py

This module provides a robust, zero-dependency URL analysis engine for detecting
phishing, fraud, and malicious indicators within URLs. It calculates a weighted
risk score and categorizes the URL based on common threat signatures.
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

SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "gq", "tk", "cf", "ml", "zip", "work", "country"
}

FREE_HOSTING_DOMAINS = {
    "000webhost", "netlify", "vercel", "pages.dev", 
    "firebaseapp", "github.io"
}

LOGIN_KEYWORDS = {
    "login", "signin", "verify", "confirm", 
    "secure", "account", "update", "password"
}

BANKING_KEYWORDS = {
    "bank", "upi", "paytm", "gpay", "phonepe", 
    "wallet", "transaction", "payment", "refund"
}

BRANDS = {
    "amazon", "google", "microsoft", "apple", "paypal", "facebook", 
    "instagram", "whatsapp", "netflix", "flipkart", "sbi", "hdfc", 
    "icici", "axis"
}

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
    """Detect domains that look randomly generated (e.g., many digits or consonants)."""
    if not hostname:
        return False
    domain_part = hostname.split('.')[0]
    
    # Check for excessive digits
    if sum(c.isdigit() for c in domain_part) > 6:
        return True
        
    # Check for consecutive consonants
    consonants = re.compile(r"[bcdfghjklmnpqrstvwxyz]{5,}")
    if consonants.search(domain_part):
        return True
        
    return False


def _check_nested_redirects(url: str, query_string: str) -> bool:
    """Detect multiple redirects or URLs passed as parameters."""
    # Find multiple protocol schemes
    schemes = re.findall(r"https?://", url.lower())
    if len(schemes) > 1:
        return True
        
    # Check common redirect parameters
    redirect_params = {"url", "redirect", "next", "return_to", "goto"}
    parsed_query = urllib.parse.parse_qs(query_string)
    for param in redirect_params:
        if param in parsed_query:
            return True
            
    return False


def _is_brand_impersonation(url_lower: str, hostname: str) -> bool:
    """Detect if a brand is mentioned in the URL but doesn't own the root domain."""
    if not hostname:
        return False
        
    hostname_parts = hostname.split('.')
    # Simplistic root domain approximation (e.g., example.com)
    root_domain = "".join(hostname_parts[-2:]) if len(hostname_parts) >= 2 else hostname
    
    for brand in BRANDS:
        if brand in url_lower and brand not in root_domain:
            return True
            
    return False

# ============================================================================
# MAIN ENGINE
# ============================================================================

def analyze_url(url: str) -> Dict[str, Any]:
    """
    Analyzes a URL for malicious indicators and returns a risk assessment dictionary.
    
    Args:
        url (str): The URL to analyze.
        
    Returns:
        Dict[str, Any]: JSON-like dictionary containing score, risk level, 
                        reasons, category, and specific threat indicators.
    """
    # ------------------------------------------------------------------------
    # Initialization & Parsing
    # ------------------------------------------------------------------------
    score = 0
    reasons: List[str] = []
    category = "Unknown"
    
    # Ensure scheme is present for proper parsing
    parse_target = url if "://" in url else f"http://{url}"
    parsed_url = urllib.parse.urlparse(parse_target)
    
    url_lower = url.lower()
    hostname = (parsed_url.hostname or "").lower()
    path = parsed_url.path.lower()
    query = parsed_url.query.lower()
    
    # ------------------------------------------------------------------------
    # Indicators Initialization
    # ------------------------------------------------------------------------
    indicators = {
        "https": parsed_url.scheme == "https",
        "ip_address": False,
        "shortened": False,
        "suspicious_tld": False,
        "free_hosting": False,
        "punycode": False,
        "login_keyword": False,
        "banking_keyword": False,
        "brand_impersonation": False,
        "long_url": False,
        "many_subdomains": False,
        "encoded_url": False
    }

    # ------------------------------------------------------------------------
    # Rule Evaluation
    # ------------------------------------------------------------------------

    # 1. HTTPS vs HTTP
    if not indicators["https"]:
        score += 10
        reasons.append("Connection is not secured with HTTPS")

    # 2. IP Address URLs
    if _is_ip_address(hostname):
        indicators["ip_address"] = True
        score += 40
        reasons.append("URL uses an IP address instead of a domain name")
        category = "Suspicious Hosting"

    # 3. URL Shorteners
    if any(shortener in hostname for shortener in URL_SHORTENERS):
        indicators["shortened"] = True
        score += 35
        reasons.append("URL uses a known link shortener to hide the destination")

    # 4. Suspicious TLDs
    tld = hostname.split('.')[-1] if '.' in hostname else ""
    if tld in SUSPICIOUS_TLDS:
        indicators["suspicious_tld"] = True
        score += 25
        reasons.append(f"Domain uses a highly suspicious Top Level Domain (.{tld})")

    # 5. Free Hosting
    if any(free_host in hostname for free_host in FREE_HOSTING_DOMAINS):
        indicators["free_hosting"] = True
        score += 20
        reasons.append("Domain is hosted on a free platform commonly used for abuse")

    # 6. Login Keywords
    if any(kw in path or kw in query for kw in LOGIN_KEYWORDS):
        indicators["login_keyword"] = True
        score += 20
        reasons.append("URL contains login/verification keywords common in phishing")
        category = "Credential Theft"

    # 7. Banking Keywords
    if any(kw in url_lower for kw in BANKING_KEYWORDS):
        indicators["banking_keyword"] = True
        score += 30
        reasons.append("URL contains financial/banking keywords")
        category = "Financial Fraud"

    # 8. Brand Impersonation
    if _is_brand_impersonation(url_lower, hostname):
        indicators["brand_impersonation"] = True
        score += 45
        reasons.append("URL attempts to impersonate a well-known brand")
        category = "Phishing"

    # 9. Long URL
    if len(url) > 100:
        indicators["long_url"] = True
        score += 10
        reasons.append("URL length is unusually long (>100 characters)")

    # 10. Many Subdomains
    clean_hostname = hostname[4:] if hostname.startswith("www.") else hostname
    if clean_hostname.count('.') >= 3:
        indicators["many_subdomains"] = True
        score += 20
        reasons.append("Domain contains an excessive number of subdomains")

    # 11. URL Encoding
    if re.search(r"%[0-9a-fA-F]{2}", url):
        indicators["encoded_url"] = True
        score += 10
        reasons.append("URL contains encoded characters to obfuscate the path")

    # 12. Punycode
    if "xn--" in hostname:
        indicators["punycode"] = True
        score += 30
        reasons.append("Domain uses Punycode (homograph attack indicator)")

    # 13. Random-looking domains
    if _has_random_characteristics(hostname):
        score += 20
        reasons.append("Domain name appears to be randomly generated")

    # 14. Multiple Redirects
    if _check_nested_redirects(url, query):
        score += 25
        reasons.append("URL contains nested links or redirect parameters")

    # 15. Double Slash Tricks
    if "//" in path:
        score += 15
        reasons.append("URL path contains double slashes, often used for redirection bypass")

    # ------------------------------------------------------------------------
    # Score Normalization & Categorization
    # ------------------------------------------------------------------------
    
    # Cap score at 100
    score = min(score, 100)
    
    # Determine Risk Level
    if score <= 29:
        risk_level = "SAFE"
        if score == 0:
            reasons.append("No suspicious indicators found")
            category = "Legitimate"
        elif category == "Unknown":
            category = "Low Risk"
    elif score <= 69:
        risk_level = "SUSPICIOUS"
        if category == "Unknown":
            category = "Suspicious Activity"
    else:
        risk_level = "MALICIOUS"
        if category == "Unknown":
            category = "High Risk Threat"

    return {
        "score": score,
        "risk_level": risk_level,
        "reasons": reasons,
        "category": category,
        "indicators": indicators
    }