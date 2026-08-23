"""
CyberShield Risk Calculator
Synthesizes ML, Rule Engine, and Heuristic results into clean status verdicts:
- Safe
- Suspicious
- Unsafe
"""

from dataclasses import dataclass


@dataclass
class RiskResult:
    status: str
    recommendation: str


class RiskCalculator:

    def calculate(
        self,
        ml_score: float,
        ml_confidence: float,
        ml_prediction: str,
        rule_score: float,
        heuristic_score: float,
    ) -> RiskResult:

        # -------------------------------------------------
        # CASE 1: Completely clean layers
        # -------------------------------------------------
        if rule_score == 0 and heuristic_score == 0:
            if ml_prediction.upper() in ["SCAM", "UNSAFE"] and ml_score >= 80:
                status = "Unsafe"
            elif ml_prediction.upper() in ["SCAM", "UNSAFE"] and ml_score >= 50:
                status = "Suspicious"
            else:
                status = "Safe"

        # -------------------------------------------------
        # CASE 2: Rule / Heuristic indicators present
        # -------------------------------------------------
        else:
            ML_WEIGHT = 0.40
            RULE_WEIGHT = 0.45
            HEURISTIC_WEIGHT = 0.15

            composite_score = (
                (ml_score * ML_WEIGHT)
                + (rule_score * RULE_WEIGHT)
                + (heuristic_score * HEURISTIC_WEIGHT)
            )

            # High Threat Thresholds
            if rule_score >= 70 or composite_score >= 65:
                status = "Unsafe"
            elif composite_score >= 35 or rule_score >= 35 or heuristic_score >= 40:
                status = "Suspicious"
            else:
                status = "Safe"

        # -------------------------------------------------
        # Contextual Recommendations
        # -------------------------------------------------
        if status == "Unsafe":
            recommendation = (
                "High threat detected! Do NOT click links, download attachments, "
                "or share sensitive credentials like OTPs, passwords, or banking details."
            )
        elif status == "Suspicious":
            recommendation = (
                "Suspicious indicators found. Proceed with caution and verify the "
                "sender through official channels before interacting."
            )
        else:
            recommendation = "This message appears legitimate and safe to interact with."

        return RiskResult(
            status=status,
            recommendation=recommendation
        )