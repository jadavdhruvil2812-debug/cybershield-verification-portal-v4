"""
CyberShield Enterprise Text Normalizer & Anti-Evasion Engine
Location: ai-backend/services/text_normalizer.py
"""

import re
import unicodedata


class TextNormalizer:
    def __init__(self):
        # Character substitution map for leetspeak / symbol evasion
        self.leet_map = {
            '@': 'a', '0': 'o', '1': 'i', '!': 'i', '$': 's',
            '5': 's', '3': 'e', '7': 't', '+': 't', '|': 'l',
            '(': 'c', '{': 'c', '[': 'c'
        }

    def clean_text(self, text: str) -> str:
        """Strip invisible zero-width unicode characters and normalize NFKD form."""
        if not text:
            return ""

        # Normalize unicode decomposition
        text = unicodedata.normalize('NFKD', text)

        # Remove zero-width spaces, joiners, and control characters
        text = re.sub(r'[\u200B-\u200D\uFEFF\u00A0\u200E\u200F]', '', text)

        # Normalize multiple spaces and newlines
        return " ".join(text.split())

    def deobfuscate(self, text: str) -> str:
        """Resolve deliberately inserted punctuations in acronyms (e.g., S.B.I -> SBI)."""
        cleaned = self.clean_text(text)

        # Collapse spaced or dotted abbreviations: S.B.I / S-B-I / K.Y.C / O.T.P
        cleaned = re.sub(r'\b([A-Za-z])[\.\-\_\s]+([A-Za-z])[\.\-\_\s]+([A-Za-z])\b', r'\1\2\3', cleaned)
        cleaned = re.sub(r'\b([A-Za-z])[\.\-\_\s]+([A-Za-z])\b', r'\1\2', cleaned)

        # Convert simple leetspeak symbols to alpha characters
        normalized_chars = []
        for char in cleaned:
            normalized_chars.append(self.leet_map.get(char, char))

        return "".join(normalized_chars)


# Singleton instance
text_normalizer = TextNormalizer()