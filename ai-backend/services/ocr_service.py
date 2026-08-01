import easyocr
from PIL import Image
import numpy as np

# OCR model load only once
reader = easyocr.Reader(["en"], gpu=False)


def extract_text_from_image(image_path: str):
    """
    Extract text from an image using EasyOCR.
    """
    image = Image.open(image_path).convert("RGB")
    image_np = np.array(image)

    results = reader.readtext(image_np)

    extracted_text = " ".join([item[1] for item in results])

    return extracted_text.strip()