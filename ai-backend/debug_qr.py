# debug_qr.py
import cv2
from PIL import Image
import numpy as np

# Apni kisi bhi test QR image ka exact path yahan likhein:
IMAGE_PATH = "test_qr.png" 

img = cv2.imread(IMAGE_PATH)
if img is None:
    print("❌ Error: Image file nahi mili!")
    exit()

detector = cv2.QRCodeDetector()
data, bbox, _ = detector.detectAndDecode(img)

print("\n------------------------------------")
print(f"Decoded Data: '{data}'")
print(f"Bounding Box Detected: {bbox is not None}")
print("------------------------------------\n")