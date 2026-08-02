"""
CyberShield Rule Engine Module - Enhanced Scam & Threat Detection
"""

import re
from dataclasses import dataclass, field
from typing import List


@dataclass
class RuleMatch:
    rule_id: str
    name: str
    category: str
    severity: str
    reason: str
    weight: int


@dataclass
class RuleEngineResult:
    score: float
    confidence_modifier: float
    reasons: List[str] = field(default_factory=list)
    recommendation: str = "Message appears safe."
    matched_rules: List[RuleMatch] = field(default_factory=list)
    categories: List[str] = field(default_factory=list)


class RuleEngine:
    def __init__(self):
        # Enhanced & High-Weight Scam Detection Patterns
        self.rules = [
            {
                "id": "SCAM001",
                "name": "Urgent Account Blocking / Suspension",
                "category": "Social Engineering",
                "severity": "HIGH",
                "weight": 45,
                "pattern": r"(account|debit card|credit card|pan|kyc|upi|wallet).*(block|suspend|expire|terminate|hold|verify|update)",
                "reason": "Threatens account suspension or blocking to induce panic and force immediate action."
            },
            {
                "id": "SCAM002",
                "name": "Financial Lottery / Prize Fraud",
                "category": "Financial Fraud",
                "severity": "HIGH",
                "weight": 40,
                "pattern": r"(won|winner|congratulations|prize|lottery|lucky draw|reward|cashback).*(claim|transfer|bank|rupees|rs|lakh|crore)",
                "reason": "Claims fake lottery winnings or cash prizes to steal personal or financial details."
            },
            {
                "id": "LNK001",
                "name": "Suspicious / Shortened URL",
                "category": "Malicious URL",
                "severity": "MEDIUM",
                "weight": 35,
                "pattern": r"(bit\.ly|tinyurl|goo\.gl|t\.me|wa\.me|is\.gd|ow\.ly|buff\.ly|shorturl|lnkd\.in|-\w+\.xyz|\.top|\.click|\.loan)",
                "reason": "Uses URL shortening or suspicious TLD services to hide the actual phishing destination."
            },
            {
                "id": "SOC001",
                "name": "Artificial Urgency & Time Pressure",
                "category": "Social Engineering",
                "severity": "MEDIUM",
                "weight": 25,
                "pattern": r"(immediately|urgent|within \d+ hours|today itself|expires today|last chance|hurry|now)",
                "reason": "Creates artificial time pressure to prevent victims from verifying the claim."
            },
            {
                "id": "FIN001",
                "name": "Unauthorized Bank Transaction / Credit Alert",
                "category": "Financial Fraud",
                "severity": "HIGH",
                "weight": 40,
                "pattern": r"(debited|credited|withdrawn|transferred|spent).*(rs\.?|inr|\$|\u20b9)?\s*[\d,]+(\.\d+)?",
                "reason": "Mimics official bank transaction alerts to lure users into clicking malicious verification links."
            },
            {
                "id": "SOC003",
                "name": "Excessive Capitalization (All Caps Spam)",
                "category": "Spam",
                "severity": "LOW",
                "weight": 15,
                "pattern": r"\b[A-Z\s]{10,}\b",
                "reason": "Excessive capitalization typical of mass scam and spam distribution."
            }
        ]

    def evaluate(self, text: str) -> RuleEngineResult:
        if not text:
            return RuleEngineResult(score=0.0, confidence_modifier=0.0)

        matched_rules: List[RuleMatch] = []
        total_weight = 0.0
        reasons_set = set()
        categories_set = set()

        text_lower = text.lower()

        for rule in self.rules:
            if re.search(rule["pattern"], text_lower, re.IGNORECASE):
                match = RuleMatch(
                    rule_id=rule["id"],
                    name=rule["name"],
                    category=rule["category"],
                    severity=rule["severity"],
                    reason=rule["reason"],
                    weight=rule["weight"]
                )
                matched_rules.append(match)
                total_weight += rule["weight"]
                reasons_set.add(rule["reason"])
                categories_set.add(rule["category"])

        # Cap the raw rule score to 100 max
        score = min(100.0, total_weight)

        # Determine recommendation based on score
        if score >= 65:
            recommendation = "HIGH THREAT! Do not click links or share personal info."
        elif score >= 35:
            recommendation = "MEDIUM THREAT. Verify details through official channels before proceeding."
        else:
            recommendation = "Low risk detected. Always remain cautious."

        confidence_modifier = 0.05 if len(matched_rules) > 1 else 0.0

        return RuleEngineResult(
            score=score,
            confidence_modifier=confidence_modifier,
            reasons=list(reasons_set),
            recommendation=recommendation,
            matched_rules=matched_rules,
            categories=list(categories_set)
        )