"""
CyberShield OCR Service Module (Explicit Windows Path)
Location: ai-backend/services/ocr_service.py
"""

import os
import re
import cv2
import pytesseract
from PIL import Image

# Direct Absolute Path for Windows Tesseract
TESSERACT_EXE = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_EXE):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE
else:
    # Alternative path if installed in x86 or user profile
    alt_path = r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
    if os.path.exists(alt_path):
        pytesseract.pytesseract.tesseract_cmd = alt_path


def clean_text(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'[\r\n\t]+', ' ', text)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    return cleaned.strip()


def extract_text_from_image(image_path: str) -> str:
    if not os.path.exists(image_path):
        return ""

    try:
        # Load image via OpenCV
        img = cv2.imread(image_path)
        if img is None:
            raw_text = pytesseract.image_to_string(Image.open(image_path))
        else:
            # Grayscale & contrast enhancement
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape[:2]
            if w < 1000:
                scale = 1000 / w
                gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

            # Direct OCR extraction
            raw_text = pytesseract.image_to_string(gray, config="--psm 6")
            
            if not raw_text.strip():
                # Fallback with adaptive thresholding
                thresh = cv2.adaptiveThreshold(
                    gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
                )
                raw_text = pytesseract.image_to_string(thresh, config="--psm 11")

        final_clean = clean_text(raw_text)
        print(f"\n[OCR EXTRACTED]: >>> {final_clean} <<<\n")
        return final_clean

    except Exception as e:
        print(f"[OCR Error]: {e}")
        try:
            return clean_text(pytesseract.image_to_string(Image.open(image_path)))
        except Exception:
            return ""