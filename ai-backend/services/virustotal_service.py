"""
CyberShield VirusTotal Service Module.
Queries VirusTotal API safely without throwing unhandled exceptions if unconfigured.
"""

import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def check_virustotal_url(url: str) -> Optional[Dict[str, Any]]:
    """Checks VirusTotal API safely. Returns None if API key is missing or request fails."""
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not api_key:
        return None

    try:
        import requests
        headers = {"x-apikey": api_key}
        params = {"url": url}
        response = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data=params,
            timeout=3.0
        )
        if response.status_code == 200:
            return response.json()
    except Exception as exc:
        logger.warning("VirusTotal API request bypassed or failed: %s", exc)

    return None