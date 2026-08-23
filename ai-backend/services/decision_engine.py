"""
CyberShield Enterprise Decision Engine
Hybrid ML + Rule Engine + Heuristic Engine (Balanced Threshold Fix)
"""

from typing import Dict, Any, List
from pathlib import Path
import math
import re
import joblib

from .rule_engine import RuleEngine
from .heuristic_engine import HeuristicEngine
from .risk_calculator import RiskCalculator


class DecisionEngine:

    def __init__(self):
        self.rule_engine = RuleEngine()
        self.heuristic_engine = HeuristicEngine()
        self.risk_calculator = RiskCalculator()

        # Legitimate transaction markers
        self.safe_tx_regex = re.compile(
            r"\b(used for|debited|credited|spent|txn id|ref no|avail(?:able)?\s+bal(?:ance)?|deposited|sent rs|paid rs|order placed|payment received)\b",
            re.IGNORECASE
        )
        
        # Hard threat markers
        self.threat_action_regex = re.compile(
            r"\b(\.xyz|\.top|\.apk|\.rest|\.buzz|verify kyc|call officer|account suspended|account blocked|lottery claim|won cash)\b",
            re.IGNORECASE
        )

        model_path = Path(__file__).resolve().parent.parent / "models" / "sms_model.joblib"
        if not model_path.exists():
            alt_path = Path(__file__).resolve().parent.parent / "models" / "sms_model.pkl"
            if alt_path.exists():
                model_path = alt_path
            else:
                self.ml_model = None

        if model_path.exists():
            self.ml_model = joblib.load(model_path)
        else:
            self.ml_model = None

    def _ml_analyze(self, text: str) -> Dict[str, Any]:
        if not self.ml_model:
            return {"is_spam": False, "spam_prob": 0.0}

        try:
            prediction = self.ml_model.predict([text])[0]
        except Exception:
            prediction = 0

        try:
            margin = float(self.ml_model.decision_function([text])[0])
            spam_probability = 1.0 / (1.0 + math.exp(-margin))
        except Exception:
            spam_probability = 1.0 if prediction in [1, "spam", "SCAM"] else 0.0

        # High confidence threshold for ML to avoid False Positives
        is_spam = (prediction in [1, "spam", "SCAM"]) and (spam_probability > 0.80)

        return {
            "is_spam": is_spam,
            "spam_prob": spam_probability
        }

    def _determine_final_status(
        self,
        text: str,
        is_ml_spam: bool,
        rule_score: float,
        heuristic_score: float,
        matched_rules: list
    ) -> str:
        """Balanced determination to ensure Safe isn't suppressed."""
        has_safe_marker = bool(self.safe_tx_regex.search(text))
        has_threat_action = bool(self.threat_action_regex.search(text))

        # 1. Transaction & Safe Format Safeguard
        if has_safe_marker and not has_threat_action and rule_score == 0:
            return "Safe"

        # 2. Critical Rules check
        has_critical_rule = any(
            getattr(r, "severity", "").upper() in ["CRITICAL", "HIGH"] 
            for r in matched_rules
        )

        if has_critical_rule or rule_score >= 60:
            return "Unsafe"

        # 3. Threat action present with non-zero risk
        if has_threat_action and (rule_score > 10 or heuristic_score > 20):
            return "Unsafe"

        # 4. ML Spam trigger handling
        if is_ml_spam:
            if rule_score > 25:
                return "Unsafe"
            return "Suspicious"

        # 5. Score aggregation
        total_risk = (rule_score * 0.6) + (heuristic_score * 0.4)
        if total_risk >= 50:
            return "Unsafe"
        elif total_risk >= 20:
            return "Suspicious"

        return "Safe"

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "status": "Safe",
                "score": 0.0,
                "recommendation": "Input is empty or clean."
            }

        text_clean = text.strip()

        # 1. ML Engine
        ml_result = self._ml_analyze(text_clean)

        # 2. Rule Engine
        rule_result = self.rule_engine.evaluate_sms(text_clean)

        # 3. Heuristic Engine
        heuristic_result = self.heuristic_engine.analyze(text_clean)

        # 4. Determine Status
        final_status = self._determine_final_status(
            text=text_clean,
            is_ml_spam=ml_result["is_spam"],
            rule_score=rule_result.score,
            heuristic_score=heuristic_result.score,
            matched_rules=rule_result.matched_rules
        )

        recommendations = {
            "Safe": "This input appears legitimate and safe to interact with.",
            "Suspicious": "Caution advised. Do not share sensitive information or click untrusted links.",
            "Unsafe": "High risk detected. Do not click links, make payments, or download attachments."
        }

        custom_rec = (
            rule_result.recommendation 
            if (rule_result.matched_rules and final_status == "Unsafe") 
            else recommendations[final_status]
        )

        return {
            "status": final_status,
            "score": max(rule_result.score, heuristic_result.score),
            "recommendation": custom_rec
        }