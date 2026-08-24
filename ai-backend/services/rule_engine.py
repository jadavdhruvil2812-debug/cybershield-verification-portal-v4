"""
CyberShield Enterprise Semantic & Intent Rule Engine (v6.1 Production)
Comprehensive Pattern Matching for Phishing, Vishing, KYC, Utility, & Banking Scams
Location: ai-backend/services/rule_engine.py
"""

import re
from dataclasses import dataclass, field
from typing import List, Optional
from urllib.parse import urlparse


@dataclass
class RuleResult:
    status: str
    score: float
    matched_rules: List[str]
    recommendation: Optional[str] = None


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
            "amazon.in", "flipkart.com", "goindigo.in", "jio.com", "airtel.in",
            "wikipedia.org", "github.com", "microsoft.com", "stackoverflow.com"
        }

    def extract_urls(self, text: str) -> List[str]:
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        return re.findall(url_pattern, text, flags=re.IGNORECASE)

    def evaluate(self, text: str, channel_multiplier: float = 1.0) -> RuleResult:
        if not text or not text.strip():
            return RuleResult(status="Safe", score=0.0, matched_rules=[])

        score = 0.0
        matched = []
        
        # Flatten whitespace and newlines for unified regex checking
        text_clean = " ".join(text.split())
        text_lower = text_clean.lower()
        urls = self.extract_urls(text)

        # ---------------------------------------------------------
        # RULE 1: UTILITY / POWER DISCONNECTION & VISHING
        # ---------------------------------------------------------
        disconnection_keywords = [
            "disconnect", "power will be", "power connection", "electricity", 
            "bses", "bijli", "light bill", "gas connection", "bill was not update", 
            "pending arrears", "arrears", "meter #", "billing mismatch"
        ]
        
        call_helpline_patterns = [
            r'call.*(?:\b[6-9]\d{9}\b)',
            r'contact.*(?:\b[6-9]\d{9}\b)',
            r'officer.*(?:\b[6-9]\d{9}\b)',
            r'helpline.*(?:\b[6-9]\d{9}\b)',
            r'call\s+(?:our\s+)?(?:helpline|officer|manager|support|desk)',
            r'contact\s+(?:our\s+)?(?:office|helpline|officer)'
        ]

        has_disconnection = any(kw in text_lower for kw in disconnection_keywords)
        has_call_trigger = any(re.search(pat, text_lower) for pat in call_helpline_patterns)
        has_urgency = any(w in text_lower for w in ["tonight", "today", "immediately", "urgent", "9.30 pm", "at once"])

        if has_disconnection and (has_call_trigger or has_urgency):
            score += 70.0
            matched.append("CRITICAL: Utility Disconnection Social Engineering with Fake Helpline (Vishing)")
        elif has_disconnection and ("suspended" in text_lower or "blocked" in text_lower):
            score += 55.0
            matched.append("HIGH: Service Suspension Panic Trigger")

        # ---------------------------------------------------------
        # RULE 2: URL INTENT, SPOOFING & TLD ANALYSIS
        # ---------------------------------------------------------
        for url in urls:
            try:
                full_url = url if url.startswith("http") else f"http://{url}"
                domain = urlparse(full_url).netloc.lower()

                if any(domain.endswith(tld) for tld in self.suspicious_tlds):
                    score += 60.0
                    matched.append(f"CRITICAL: High-Risk Phishing TLD ({domain})")

                sensitive_brands = [
                    "sbi", "hdfc", "icici", "pnb", "axis", "uidai", "aadhaar", 
                    "incometax", "indiapost", "fastag", "upi", "kyc", "epf", "uan", "cibil"
                ]
                if any(b in domain for b in sensitive_brands):
                    if not any(domain.endswith(w) for w in self.whitelisted_domains):
                        score += 65.0
                        matched.append(f"CRITICAL: Bank/Gov Brand Impersonation Domain ({domain})")

                if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
                    score += 60.0
                    matched.append("HIGH: Raw IP Address Target")

                if any(ext in url.lower() for ext in [".apk", ".exe", ".bat", ".scr"]):
                    score += 75.0
                    matched.append("CRITICAL: Direct Malware / Malicious APK Download Payload")
            except Exception:
                score += 20.0

        # ---------------------------------------------------------
        # RULE 3: BANKING KYC & ACCOUNT SUSPENSION TRAPS
        # ---------------------------------------------------------
        kyc_patterns = [
            (r'(sbi|hdfc|icici|pnb|axis|bank).*(suspended|blocked|deactivated|restricted|frozen)', 60.0, "CRITICAL: Fake Bank Freeze Notice"),
            (r'(update|verify|complete).*(kyc|pan card|aadhaar|pan).*http', 65.0, "CRITICAL: Deceptive KYC/PAN Verification Link"),
            (r'unauthorized.*transaction.*(?:cancel|reverse|call)', 50.0, "HIGH: Reverse Fraud Alert / False Debit Trap"),
            (r'sim.*(?:suspended|block|deactivate).*http', 50.0, "HIGH: Telecom SIM Deactivation Trap")
        ]
        for pattern, points, name in kyc_patterns:
            if re.search(pattern, text_lower):
                score += points
                matched.append(name)

        # ---------------------------------------------------------
        # RULE 4: LOTTERY, REWARDS & SOCIAL ENGINEERING LURES
        # ---------------------------------------------------------
        lottery_patterns = [
            (r'(won|winner|lottery|cash prize|shopping voucher|claim bonus).*(call|http|\d{10}|rs\.?\s*\d+)', 60.0, "HIGH: Lottery & Cash Reward Bait"),
            (r'(part-time job|earn rs|like youtube videos|task app).*(http|\.apk)', 60.0, "HIGH: Work-From-Home Task Fraud Scheme"),
            (r'(courier|package|delivery).*(incomplete|wrong address|on hold).*http', 50.0, "HIGH: Deceptive Package Redelivery Trap")
        ]
        for pattern, points, name in lottery_patterns:
            if re.search(pattern, text_lower):
                score += points
                matched.append(name)

        final_score = min(score * channel_multiplier, 100.0)
        status = "Unsafe" if final_score >= 40.0 else "Safe"

        rec = None
        if status == "Unsafe":
            rec = "CRITICAL THREAT: Phishing, Vishing, or Social Engineering scam detected. Do not call numbers or open links."

        return RuleResult(
            status=status,
            score=final_score,
            matched_rules=matched,
            recommendation=rec
        )

    def evaluate_sms(self, text: str) -> RuleResult:
        """Helper alias for direct SMS evaluation compatibility."""
        return self.evaluate(text, channel_multiplier=1.0)