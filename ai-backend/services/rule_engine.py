"""
CyberShield Advanced Semantic & Intent Rule Engine (v6.0)
Includes Phone-Call Vishing & Utility Disconnection Threat Interception
Location: ai-backend/services/rule_engine.py
"""

import re
from dataclasses import dataclass
from typing import List
from urllib.parse import urlparse


@dataclass
class RuleResult:
    status: str
    score: float
    matched_rules: List[str]


class RuleEngine:
    def __init__(self):
        self.suspicious_tlds = {
            ".xyz", ".top", ".site", ".link", ".online", ".live", ".info",
            ".me", ".club", ".click", ".work", ".buzz", ".icu", ".rest",
            ".monster", ".vip", ".cc", ".to", ".space"
        }

        self.whitelisted_domains = {
            "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com",
            "axisbank.com", "incometax.gov.in", "uidai.gov.in", "indiapost.gov.in",
            "amazon.in", "flipkart.com", "goindigo.in", "jio.com", "airtel.in"
        }

    def extract_urls(self, text: str) -> List[str]:
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        return re.findall(url_pattern, text, flags=re.IGNORECASE)

    def evaluate(self, text: str, channel_multiplier: float = 1.0) -> RuleResult:
        score = 0.0
        matched = []
        text_lower = text.lower()
        urls = self.extract_urls(text)

        # ---------------------------------------------------------
        # RULE 1: UTILITY / BILLING DISCONNECTION & VISHING (Test 7 Fix)
        # ---------------------------------------------------------
        disconnection_keywords = ["disconnect", "power will be", "electricity office", "gas connection", "bill was not update", "meter #", "billing mismatch"]
        call_helpline_patterns = [
            r'call.*(\b[6-9]\d{9}\b)',
            r'contact.*(\b[6-9]\d{9}\b)',
            r'officer.*(\b[6-9]\d{9}\b)',
            r'desk at\s+(\b[6-9]\d{9}\b)',
            r'call.*officer',
            r'contact.*office'
        ]

        has_disconnection = any(kw in text_lower for kw in disconnection_keywords)
        has_call_trigger = any(re.search(pat, text_lower) for pat in call_helpline_patterns)

        if has_disconnection and has_call_trigger:
            score += 55.0
            matched.append("Utility Disconnection with Unofficial Contact Number (Vishing)")
        elif has_disconnection and ("tonight" in text_lower or "immediately" in text_lower or "urgent" in text_lower):
            score += 45.0
            matched.append("Urgent Service Disconnection Panic Hook")

        # ---------------------------------------------------------
        # RULE 2: URL INTENT & TLD ANALYSIS
        # ---------------------------------------------------------
        for url in urls:
            try:
                full_url = url if url.startswith("http") else f"http://{url}"
                domain = urlparse(full_url).netloc.lower()

                if any(domain.endswith(tld) for tld in self.suspicious_tlds):
                    score += 45.0
                    matched.append(f"High-Risk TLD Detected ({domain})")

                sensitive_brands = ["sbi", "hdfc", "icici", "uidai", "aadhaar", "incometax", "indiapost", "fastag", "upi", "dispute", "refund", "kyc", "epf", "uan", "cibil", "flipkart", "telecom"]
                if any(b in domain for b in sensitive_brands):
                    if domain not in self.whitelisted_domains:
                        score += 50.0
                        matched.append(f"Domain Brand Impersonation ({domain})")

                if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
                    score += 60.0
                    matched.append("Raw IP Address as Link")
            except Exception:
                score += 20.0

        # ---------------------------------------------------------
        # RULE 3: REVERSE PSYCHOLOGY & CANCELLATION TRAPS
        # ---------------------------------------------------------
        reverse_traps = [
            (r'unauthorized.*transaction.*cancel', 40.0, "Reverse Fraud Alert Trap"),
            (r'if not done by you.*http', 45.0, "Fake Cancellation Link Trap"),
            (r'prevent fund deduction.*http', 45.0, "Urgent Fund Deduction Link"),
            (r'mistakenly credited.*return', 40.0, "Erroneous Credit / UPI Reversal Scam"),
            (r'unadjusted tds refund.*direct credit', 40.0, "Fake Income Tax Direct Credit"),
            (r'uan passbook.*freeze.*http', 45.0, "EPFO UAN Freeze Trap"),
            (r'cibil.*drop.*dispute.*http', 45.0, "CIBIL Score Dispute Hook"),
            (r'sim.*suspended.*document.*http', 45.0, "SIM Deactivation Panic Hook"),
        ]
        for pattern, points, name in reverse_traps:
            if re.search(pattern, text_lower):
                score += points
                matched.append(name)

        # ---------------------------------------------------------
        # RULE 4: LOGISTICS & ACTIONABLE UNVERIFIED LINKS
        # ---------------------------------------------------------
        logistics_traps = [
            (r'cannot be delivered.*incomplete', 40.0, "Fake Delivery Address Notice"),
            (r'consignment.*return to sender.*http', 45.0, "Postal Consignment Return Trap"),
            (r'fastag.*blacklisted.*kyc', 40.0, "FASTag Toll Blacklist Scam"),
            (r'biometric.*disablement.*verify', 40.0, "Aadhaar Biometric Disablement Threat"),
            (r'exclusive vip.*gift.*before midnight', 40.0, "E-Commerce Urgent Voucher Trap"),
        ]
        for pattern, points, name in logistics_traps:
            if re.search(pattern, text_lower):
                score += points
                matched.append(name)

        if urls and any(w in text_lower for w in ["verify", "update", "cancel", "settle", "resume", "dispute", "screening", "form", "claim"]):
            score += 25.0
            matched.append("Actionable Link in Unsolicited SMS")

        final_score = score * channel_multiplier
        status = "Unsafe" if final_score >= 35.0 else "Safe"

        return RuleResult(
            status=status,
            score=final_score,
            matched_rules=matched
        )