"""
CyberShield Heuristic Engine Module (v3.6 - Contextual & Low False-Positive)
Evaluates behavioural spam patterns and maps directly to threat status.
"""

import re
from dataclasses import dataclass, field
from typing import List


@dataclass
class HeuristicResult:
    status: str = "Safe"          # Safe, Suspicious, or Unsafe
    score: int = 0                # Maintained internally for threshold calculation
    threats: List[str] = field(default_factory=list)


class HeuristicEngine:

    def __init__(self):
        self.safe_transaction_regex = re.compile(
            r"\b(used for|debited|credited|spent|txn id|ref no|avail(?:able)?\s+bal(?:ance)?|deposited|sent rs|paid rs)\b",
            re.IGNORECASE
        )

        self.bank_keywords = [
            "bank", "sbi", "hdfc", "icici", "axis", "kotak",
            "account", "kyc", "upi", "atm", "debit", "credit", "netbanking"
        ]

        self.prize_keywords = [
            "won", "winner", "reward", "lottery", "gift",
            "cash prize", "congratulations", "cashback", "claim"
        ]

        self.urgency_keywords = [
            "urgent", "urgently", "immediately", "act now", "expires",
            "within 24 hours", "within 2 hours", "last chance", "hurry", "limited time"
        ]

        self.fear_keywords = [
            "blocked", "locked", "disabled", "suspended", "freeze", "deactivated", "disconnected"
        ]

        self.action_keywords = [
            "verify", "login", "update", "click", "tap here", "claim now", "call officer"
        ]

    def analyze(self, text: str) -> HeuristicResult:
        if not text or not text.strip():
            return HeuristicResult(status="Safe", score=0, threats=[])

        text_clean = text.strip()
        sms = text_clean.lower()

        # 1. False-Positive Bypass for Verified Bank Transaction Alerts
        has_safe_marker = bool(self.safe_transaction_regex.search(sms))
        has_url = bool(re.search(r"https?://|www\.|\.xyz|\.top|\.apk", sms))
        has_suspension = any(w in sms for w in self.fear_keywords)

        if has_safe_marker and not has_url and not has_suspension:
            return HeuristicResult(
                status="Safe",
                score=0,
                threats=["Legitimate transaction notification verified."]
            )

        score = 0
        threats = []

        # 2. Contextual Banking Threat (Bank + Fear/Action + Link/Urgency)
        has_bank = any(word in sms for word in self.bank_keywords)
        has_urgency = any(word in sms for word in self.urgency_keywords)
        has_fear = any(word in sms for word in self.fear_keywords)
        has_action = any(word in sms for word in self.action_keywords)

        if has_bank and (has_fear or has_urgency) and (has_action or has_url):
            score += 45
            threats.append("Banking urgency & credential harvest pattern")
        elif has_bank and has_fear:
            score += 25
            threats.append("Banking account status threat")

        # 3. Prize / Lottery Scams
        if any(word in sms for word in self.prize_keywords) and (has_action or has_url):
            score += 40
            threats.append("Prize / Lottery claim pattern")

        # 4. URLs & Shortened URLs
        if has_url:
            score += 20
            threats.append("Embedded target link detected")

        if any(x in sms for x in ["bit.ly", "tinyurl", "t.co", "goo.gl", "cutt.ly", "shorturl.at", "is.gd", "rb.gy"]):
            score += 25
            threats.append("Shortened link service detected")

        # 5. Delivery Scams
        if any(w in sms for w in ["delivery", "parcel", "package", "shipment"]) and any(w in sms for w in ["failed", "held", "address", "update"]):
            score += 30
            threats.append("Delivery status impersonation")

        # 6. Formatting Anomalies
        if sms.count("!") >= 3:
            score += 10
            threats.append("Excessive exclamation marks")

        words = text_clean.split()
        caps = sum(1 for w in words if len(w) > 3 and w.isupper())
        if caps >= 3:
            score += 15
            threats.append("Excessive uppercase emphasis")

        final_score = min(score, 100)

        # 7. Clean Status Mapping
        if final_score >= 50:
            status = "Unsafe"
        elif final_score >= 25:
            status = "Suspicious"
        else:
            status = "Safe"

        return HeuristicResult(
            status=status,
            score=final_score,
            threats=list(dict.fromkeys(threats))
        )

    # Backward compatibility alias
    def evaluate(self, text: str) -> HeuristicResult:
        return self.analyze(text)