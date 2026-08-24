"""
CyberShield Enterprise Master Decision Engine (v10.0 Production)
Hybrid ML + Rule Engine + Heuristic Engine + URL Hardened Layer
Location: ai-backend/services/decision_engine.py
"""

from typing import Dict, Any, List
from pathlib import Path
import math
import re
import joblib

from .rule_engine import RuleEngine
from .heuristic_engine import HeuristicEngine
from .risk_calculator import RiskCalculator
from .text_normalizer import text_normalizer
from .url_analyzer import url_analyzer


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

        # Unified Threat & Social Engineering Regex (Utility, Phone traps, Phishing TLDs, Suspensions)
        self.threat_action_regex = re.compile(
            r"(\.xyz|\.top|\.apk|\.rest|\.buzz|\.site|\.club|"
            r"verify kyc|call officer|call our helpline|helpline officer|call manager|"
            r"suspended|blocked|deactivated|disconnected|power connection|"
            r"lottery claim|won cash|cash prize|pending arrears|"
            r"call\s+(?:our\s+)?(?:helpline|officer|manager|support)?\s*(?:at|on|number)?\s*[:\-]?\s*[6-9]\d{9})",
            re.IGNORECASE
        )

        model_path = Path(__file__).resolve().parent.parent / "models" / "sms_model.joblib"
        if not model_path.exists():
            alt_path = Path(__file__).resolve().parent.parent / "models" / "sms_model.pkl"
            if alt_path.exists():
                model_path = alt_path
            else:
                self.ml_model = None

        if model_path and model_path.exists():
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
        is_spam = (prediction in [1, "spam", "SCAM"]) and (spam_probability > 0.75)

        return {
            "is_spam": is_spam,
            "spam_prob": spam_probability
        }

    def _extract_and_check_urls(self, text: str) -> Dict[str, Any]:
        """Extract URLs and evaluate using the Hardened URL Analyzer."""
        url_matches = re.findall(
            r'https?://[^\s<>"]+|www\.[^\s<>"]+|\b[a-zA-Z0-9.-]+\.(?:xyz|top|site|club|online|apk|rest|buzz)\b',
            text,
            re.IGNORECASE
        )
        
        for raw_url in url_matches:
            url_res = url_analyzer.analyze(raw_url)
            if url_res.get("status") == "Unsafe":
                return {
                    "is_unsafe": True,
                    "score": url_res.get("score", 90.0),
                    "reason": f"Malicious embedded link detected ({raw_url})"
                }
        return {"is_unsafe": False, "score": 0.0, "reason": ""}

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

        # 3. Direct Threat Action
        if has_threat_action:
            return "Unsafe"

        # 4. ML Spam trigger handling
        if is_ml_spam:
            if rule_score > 25:
                return "Unsafe"
            return "Suspicious"

        # 5. Score aggregation
        total_risk = (rule_score * 0.6) + (heuristic_score * 0.4)
        if total_risk >= 45:
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

        # Step 1: Normalize & Deobfuscate Text (Removes zero-width spaces, leetspeak)
        text_clean = text_normalizer.deobfuscate(text)

        # Step 2: Deep URL Interception inside Text
        url_threat = self._extract_and_check_urls(text_clean)
        if url_threat["is_unsafe"]:
            return {
                "status": "Unsafe",
                "score": max(url_threat["score"], 85.0),
                "recommendation": f"High risk detected. {url_threat['reason']}. Do not click links or enter credentials."
            }

        # Step 3: ML Engine
        ml_result = self._ml_analyze(text_clean)

        # Step 4: Rule Engine
        rule_result = self.rule_engine.evaluate_sms(text_clean)

        # Step 5: Heuristic Engine
        heuristic_result = self.heuristic_engine.analyze(text_clean)

        # Step 6: Determine Final Status
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

        final_score = max(
            rule_result.score, 
            heuristic_result.score, 
            (85.0 if final_status == "Unsafe" else 0.0)
        )

        return {
            "status": final_status,
            "score": final_score,
            "recommendation": custom_rec
        }


# Singleton instance
decision_engine = DecisionEngine()