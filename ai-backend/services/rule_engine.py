"""
CyberShield SMS Scam Detection - Enterprise Rule Engine
Module: services/rule_engine.py

Provides robust, regex-based threat detection with compound risk scoring.
Optimized for high-throughput FastAPI environments.
"""

import re
from typing import Dict, List, Set, Tuple, Any

# ==============================================================================
# CONFIGURATION & THREAT INDICATORS
# ==============================================================================

TRUSTED_DOMAINS: Set[str] = frozenset({
    "amazon.in", "amazon.com", "flipkart.com", "google.com", "google.co.in",
    "microsoft.com", "apple.com", "sbi.co.in", "onlinesbi.sbi", "icicibank.com",
    "hdfcbank.com", "axisbank.com", "kotak.com", "paytm.com", "phonepe.com",
    "npci.org.in", "uidai.gov.in", "gst.gov.in", "incometax.gov.in",
})

SHORT_URL_DOMAINS: Set[str] = frozenset({
    "bit.ly", "tinyurl.com", "tinyurl", "t.co", "rb.gy", "cutt.ly", 
    "tiny.cc", "rebrand.ly", "is.gd",
})

# Compiled Regular Expressions for maximum performance
RE_URL = re.compile(r"https?://[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*", re.IGNORECASE)
RE_DOMAIN = re.compile(r"(?:https?://)?(?:www\.)?([^/\s:]+)", re.IGNORECASE)

# High-Risk Vectors
RE_REMOTE_APP = re.compile(r"\b(anydesk|teamviewer|quicksupport|rustdesk)\b", re.IGNORECASE)
RE_APK_MALWARE = re.compile(r"\b(\.apk|install\s+app|download\s+app|unknown\s+app|side\s*load)\b", re.IGNORECASE)
RE_URGENCY = re.compile(r"\b(urgent|immediately|verify\s+now|limited\s+time|blocked|suspended|expires\s+today|last\s+warning)\b", re.IGNORECASE)
RE_INCENTIVE = re.compile(r"\b(congratulations|winner|lottery|claim|prize|reward|gift|cashback|lucky\s+draw|free\s+money)\b", re.IGNORECASE)
RE_QR_SCAM = re.compile(r"\b(scan\s+qr|receive\s+money|collect\s+request)\b", re.IGNORECASE)

# Phishing & Fraud Combinations
RE_BANK_VERIFY = re.compile(r"\b(bank|account|sbi|hdfc|icici|axis|kotak)\b.*\b(verify|update|blocked|suspended|kyc)\b", re.IGNORECASE)
RE_BANK_OTP = re.compile(r"\b(bank|account|sbi|hdfc|icici|axis)\b.*\b(otp|code|one\s+time\s+password)\b", re.IGNORECASE)
RE_UPI_COLLECT = re.compile(r"\b(upi|paytm|phonepe|gpay)\b.*\b(collect|request|pending|send\s+money)\b", re.IGNORECASE)
RE_PAYMENT_PENDING = re.compile(r"\b(payment\s+pending|pending\s+payment)\b", re.IGNORECASE)
RE_OTP_THEFT = re.compile(r"\b(share\s+otp|tell\s+otp|forward\s+otp|enter\s+otp)\b", re.IGNORECASE)
RE_KYC_SCAM = re.compile(r"\b(kyc)\b.*\b(update|verify|expire|mandatory|suspend)\b", re.IGNORECASE)

# Categorical Threat Rules: (Pattern, Reason, Risk Weight)
THREAT_RULES = [
    (re.compile(r"\b(crypto|bitcoin|btc|eth|usdt|binance)\b", re.IGNORECASE), "Crypto Investment Scam Vector", 25),
    (re.compile(r"\b(part\s*time\s*job|work\s*from\s*home|daily\s*income)\b", re.IGNORECASE), "Fake Job Opportunity Vector", 30),
    (re.compile(r"\b(parcel|package|courier|delivery).*(incorrect|failed|reschedule)\b", re.IGNORECASE), "Postal/Parcel Delivery Phishing", 25),
    (re.compile(r"\b(customs|customs\s+duty|customs\s+clearance|unpaid\s+duty)\b", re.IGNORECASE), "Customs/Duty Fraud Scheme", 30),
    (re.compile(r"\b(sim\s+card|sim\s+swap|upgrade\s+sim|5g\s+sim)\b", re.IGNORECASE), "SIM Swap Fraud Vector", 35),
    (re.compile(r"\b(pre\s*approved\s*loan|instant\040loan|0%\s*interest)\b", re.IGNORECASE), "Unsolicited Loan Fraud", 25),
    (re.compile(r"\b(rbi|reserve\s+bank|rbi\s+notice)\b", re.IGNORECASE), "RBI Impersonation", 35),
    (re.compile(r"\b(pan\s+card|pan\s+update|link\s+pan)\b", re.IGNORECASE), "PAN Card Fraud Vector", 30),
    (re.compile(r"\b(aadhaar|aadhar|uidai|link\s+aadhaar)\b", re.IGNORECASE), "Aadhaar Identity Fraud Vector", 30),
    (re.compile(r"\b(income\s+tax|tax\s+refund|it\s+refund)\b", re.IGNORECASE), "Income Tax Fraud Scheme", 35),
    (re.compile(r"\b(electricity\s+bill|power\s+cut|disconnection)\b", re.IGNORECASE), "Utility Disconnection Fraud", 35),
    (re.compile(r"\b(whatsapp\s+group|join\s+whatsapp|telegram\s+channel)\b", re.IGNORECASE), "Suspicious Social Redirection", 20),
]

# Benign Trust Rules: (Pattern, Reason, Risk Reduction)
BENIGN_RULES = [
    (re.compile(r"\b(amazon\s+order.*delivered)\b", re.IGNORECASE), "Verified Amazon Delivery", 40),
    (re.compile(r"\b(flipkart\s+order.*shipped)\b", re.IGNORECASE), "Verified Flipkart Status", 40),
    (re.compile(r"\b(google\s+verification\s+code)\b", re.IGNORECASE), "Standard Google 2FA", 45),
    (re.compile(r"\b(meeting\s+tomorrow)\b", re.IGNORECASE), "Benign Personal Context", 30),
    (re.compile(r"\b(electricity\s+bill\s+paid)\b", re.IGNORECASE), "Utility Payment Confirmation", 35),
    (re.compile(r"\b(train\s+ticket\s+confirmed)\b", re.IGNORECASE), "IRCTC Booking Confirmation", 40),
    (re.compile(r"\b(package\s+delivered)\b", re.IGNORECASE), "Standard Delivery Context", 25),
    (re.compile(r"\b(thank\s+you\s+for\s+shopping|invoice\s+generated)\b", re.IGNORECASE), "Commercial Transaction Proof", 30),
]

RE_TRUSTED_BRANDS = re.compile(r"\b(Amazon|Flipkart|Google|Microsoft|Apple|Netflix|Swiggy|Zomato|Blinkit|Myntra|Airtel|Jio|Vi|IRCTC)\b", re.IGNORECASE)

# ==============================================================================
# EVALUATION LOGIC
# ==============================================================================

def _extract_domain(url: str) -> str:
    match = RE_DOMAIN.search(url)
    return match.group(1).lower() if match else ""

def _analyze_urls(text: str) -> Tuple[int, List[str], bool, bool]:
    urls = RE_URL.findall(text)
    if not urls:
        return 0, [], False, False

    score = 15
    reasons = ["Contains Embedded Web Link (URL)"]
    has_trusted = False
    has_short = False

    for url in urls:
        domain = _extract_domain(url)
        if any(short in domain for short in SHORT_URL_DOMAINS):
            has_short = True
            score += 35
            reasons.append(f"Obfuscated Short URL Detected ({domain})")
        
        if any(domain == trusted or domain.endswith(f".{trusted}") for trusted in TRUSTED_DOMAINS):
            has_trusted = True
            score -= 25
            reasons.append(f"Verified Trusted Domain ({domain})")

    return score, reasons, has_trusted, has_short

def _analyze_heuristics(text: str) -> Tuple[int, List[str], Dict[str, bool]]:
    score = 0
    reasons = []
    flags = {k: False for k in ["remote", "apk", "urgency", "incentive", "qr", "banking", "kyc", "otp", "upi"]}

    if RE_REMOTE_APP.search(text):
        flags["remote"] = True
        score += 45
        reasons.append("Remote Access Trojan Request")

    if RE_APK_MALWARE.search(text):
        flags["apk"] = True
        score += 40
        reasons.append("Unsafe APK/App Download")

    if RE_URGENCY.search(text):
        flags["urgency"] = True
        score += 20
        reasons.append("High-Pressure Urgency Tactics")

    if RE_INCENTIVE.search(text):
        flags["incentive"] = True
        score += 20
        reasons.append("Unsolicited Financial Reward/Lottery")

    if RE_QR_SCAM.search(text):
        flags["qr"] = True
        score += 25
        reasons.append("QR Code Money Collection Vector")

    if RE_BANK_VERIFY.search(text):
        flags["banking"] = True
        score += 30
        reasons.append("Bank Credential Phishing")

    if RE_KYC_SCAM.search(text):
        flags["kyc"] = True
        score += 35
        reasons.append("Fake KYC Verification Trigger")

    if RE_OTP_THEFT.search(text) or RE_BANK_OTP.search(text):
        flags["otp"] = True
        score += 40
        reasons.append("OTP Interception Request")

    if RE_UPI_COLLECT.search(text) or RE_PAYMENT_PENDING.search(text):
        flags["upi"] = True
        score += 30
        reasons.append("Fake UPI Collect Request")

    for pattern, reason, weight in THREAT_RULES:
        if pattern.search(text):
            score += weight
            reasons.append(reason)

    return score, reasons, flags

def _evaluate_compounds(flags: Dict[str, bool], has_url: bool, has_short_url: bool) -> Tuple[int, List[str]]:
    score = 0
    reasons = []

    if flags["apk"] and has_url:
        score += 40
        reasons.append("Critical Compound: APK Download via Direct URL")
    
    if flags["banking"] and has_url:
        score += 35
        reasons.append("Critical Compound: Bank Phishing Link")
    
    if flags["incentive"] and has_url:
        score += 30
        reasons.append("Critical Compound: Lottery/Prize External Link")
    
    if flags["kyc"] and has_url:
        score += 35
        reasons.append("Critical Compound: KYC Phishing Link")

    if has_short_url and flags["urgency"]:
        score += 25
        reasons.append("Critical Compound: Short URL with Coercive Urgency")

    return score, reasons

def _evaluate_benign(text: str, has_trusted: bool) -> Tuple[int, List[str]]:
    reduction = 0
    reasons = []

    for pattern, reason, weight in BENIGN_RULES:
        if pattern.search(text):
            reduction += weight
            reasons.append(reason)

    brand_matches = list(set(RE_TRUSTED_BRANDS.findall(text)))
    if brand_matches and has_trusted:
        reduction += 15
        reasons.append(f"Legitimate Brand Identity ({', '.join(brand_matches[:2])})")

    return reduction, reasons

# ==============================================================================
# PUBLIC API
# ==============================================================================

def analyze_rules(text: str) -> Dict[str, Any]:
    """
    Executes a comprehensive, regex-based heuristic analysis on an SMS text.
    Returns bounded score (0-100) and deduplicated explanation reasons.
    """
    if not text or not text.strip():
        return {"score": 0, "reasons": []}

    total_score = 0
    all_reasons = []

    # 1. URLs
    url_score, url_reasons, has_trusted, has_short = _analyze_urls(text)
    has_url = bool(url_reasons)
    total_score += url_score
    all_reasons.extend(url_reasons)

    # 2. Base Heuristics
    heur_score, heur_reasons, flags = _analyze_heuristics(text)
    total_score += heur_score
    all_reasons.extend(heur_reasons)

    # 3. Compound Threats
    comp_score, comp_reasons = _evaluate_compounds(flags, has_url, has_short)
    total_score += comp_score
    all_reasons.extend(comp_reasons)

    # 4. False Positive / Benign Deductions
    benign_reduction, benign_reasons = _evaluate_benign(text, has_trusted)
    total_score -= benign_reduction
    all_reasons.extend(benign_reasons)

    # Clean & Bound
    final_score = max(0, min(100, int(total_score)))
    
    # Deduplicate preserving order
    seen = set()
    unique_reasons = [r for r in all_reasons if not (r in seen or seen.add(r))]

    if not unique_reasons and final_score > 0:
        unique_reasons.append("General Suspicious Indicators Found")

    return {
        "score": final_score,
        "reasons": unique_reasons
    }      