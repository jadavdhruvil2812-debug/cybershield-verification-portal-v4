"""
CyberShield Robust OCR Service.
Extracts text from images using PyTesseract. Includes safety checks for
Windows Tesseract installations and handles .webp / .png formats perfectly.
"""

import logging
import os
import sys

logger = logging.getLogger(__name__)

try:
    from PIL import Image, ImageEnhance
    import pytesseract
    _OCR_AVAILABLE = True

    # Hardcode the exact Windows path where Tesseract installs by default
    if sys.platform.startswith("win"):
        tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.exists(tesseract_path):
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        else:
            logger.warning("TESSERACT.EXE NOT FOUND AT: %s", tesseract_path)
            logger.warning("Please install Tesseract OCR for Windows!")

except ImportError:
    _OCR_AVAILABLE = False
    logger.error("PIL or pytesseract Python packages are missing. Run: pip install Pillow pytesseract")


def extract_text_from_image(image_path: str) -> str:
    """Reads text from a saved image file using Tesseract."""
    if not image_path or not os.path.exists(image_path):
        logger.error("Image file not found: %s", image_path)
        return ""

    if not _OCR_AVAILABLE:
        return ""

    try:
        # Quick test to see if the Tesseract engine is actually installed and reachable
        try:
            pytesseract.get_tesseract_version()
        except Exception:
            logger.error("CRITICAL: Tesseract OCR Engine is NOT installed on your Windows system!")
            return ""

        # Open Image
        with Image.open(image_path) as img:
            # Convert WebP/PNG with alpha channels to solid RGB
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # Basic Preprocessing: 2x Upscale and Contrast Boost for better accuracy
            width, height = img.size
            img = img.resize((width * 2, height * 2), Image.Resampling.LANCZOS)
            
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(2.0)

            # Run OCR
            text = pytesseract.image_to_string(img)
            
            extracted = text.strip()
            if extracted:
                logger.info("Successfully extracted %d characters from image.", len(extracted))
            else:
                logger.warning("OCR ran successfully but found NO text in the image.")
                
            return extracted

    except Exception as exc:
        logger.error("OCR Extraction Failed: %s", exc)
        return ""