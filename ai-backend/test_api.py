import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"

def print_result(title, response):
    print(f"\n{'='*50}")
    print(f"[{title}] - Status Code: {response.status_code}")
    print('='*50)
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Response Error:", response.text)

def test_sms_text():
    # Testing a compound scam (Urgency + Bank + Link)
    payload = {
        "sms": "Urgent! Your SBI account is blocked. Do not share OTP. Click here to verify KYC immediately: http://sbi-update-kyc.xyz"
    }
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print_result("1. SMS Text Detection Test", response)

    # Testing a False-Positive scenario (Benign OTP)
    payload_benign = {
        "sms": "G-492817 is your Google verification code. Do not share this with anyone."
    }
    response_benign = requests.post(f"{BASE_URL}/predict", json=payload_benign)
    print_result("1b. SMS False-Positive (Benign) Test", response_benign)

def test_url_analyzer():
    # Testing a typosquatted, shortened domain
    payload = {
        "url": "http://bit.ly/axis-bank-rewards-claim"
    }
    response = requests.post(f"{BASE_URL}/analyze-url", json=payload)
    print_result("2. URL Analyzer Test", response)

def test_image_ocr():
    # Create a dummy text file and rename it to image just to test the endpoint connectivity 
    # (If you have a real image, change the path below to point to it)
    dummy_img = "test_dummy.png"
    with open(dummy_img, "wb") as f:
        f.write(b"dummy image data")
        
    try:
        with open(dummy_img, "rb") as f:
            files = {"file": (dummy_img, f, "image/png")}
            response = requests.post(f"{BASE_URL}/predict-image", files=files)
            print_result("3. SMS Image OCR Test", response)
    finally:
        if os.path.exists(dummy_img):
            os.remove(dummy_img)

if __name__ == "__main__":
    print("Testing CyberShield Backend...")
    
    # 1. Health check
    res = requests.get(f"{BASE_URL}/")
    print("\n[Health Check]:", res.json())
    
    # 2. Run Tests
    test_sms_text()
    test_url_analyzer()
    test_image_ocr()