import json
import os
import requests

BASE_URL = "http://127.0.0.1:8000"


def print_result(title: str, response: requests.Response):
    print(f"\n{'='*60}")
    print(f"[{title}] - Status Code: {response.status_code}")
    print('='*60)
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        # Display the normalized verdict clearly
        status = data.get("status")
        if status:
            print(f"\n>>> VERDICT: [{status.upper()}]")
    except Exception:
        print("Response Text:", response.text)


def test_sms_text():
    # 1. High Critical Scam -> Expected: Unsafe
    payload_scam = {
        "sms": "Urgent! Your SBI account is blocked. Do not share OTP. Click here to verify KYC immediately: http://sbi-update-kyc.xyz"
    }
    response = requests.post(f"{BASE_URL}/verify-sms", json=payload_scam)
    print_result("1a. High Risk SMS Test (Expected: Unsafe)", response)

    # 2. Benign Notification -> Expected: Safe
    payload_benign = {
        "sms": "G-492817 is your Google verification code. Do not share this with anyone."
    }
    response_benign = requests.post(f"{BASE_URL}/verify-sms", json=payload_benign)
    print_result("1b. Benign SMS Test (Expected: Safe)", response_benign)

    # 3. Borderline Urgent -> Expected: Suspicious
    payload_suspicious = {
        "sms": "Please confirm your account profile verification details within 24 hours."
    }
    response_suspicious = requests.post(f"{BASE_URL}/verify-sms", json=payload_suspicious)
    print_result("1c. Borderline SMS Test (Expected: Suspicious)", response_suspicious)


def test_url_analyzer():
    # Typosquatted / Shortened Link -> Expected: Unsafe
    payload = {
        "url": "http://bit.ly/axis-bank-rewards-claim"
    }
    response = requests.post(f"{BASE_URL}/analyze-url", json=payload)
    print_result("2. URL Analyzer Test", response)


def test_image_ocr():
    # Real image path check or sample dummy test
    sample_img = "test_sample.png"

    # Agar local directory me test file nahi hai toh safe dummy generate karke test karein
    cleanup_needed = False
    if not os.path.exists(sample_img):
        cleanup_needed = True
        with open(sample_img, "wb") as f:
            f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

    try:
        with open(sample_img, "rb") as f:
            files = {"file": (sample_img, f, "image/png")}
            response = requests.post(f"{BASE_URL}/verify-image", files=files)
            print_result("3. Image Verification Test", response)
    finally:
        if cleanup_needed and os.path.exists(sample_img):
            os.remove(sample_img)


if __name__ == "__main__":
    print("Connecting to CyberShield AI Backend on localhost:8000...")
    
    # 1. Health Check
    try:
        res = requests.get(f"{BASE_URL}/")
        print("\n[Health Check]:", res.json())
        
        # 2. Run Test Suites
        test_sms_text()
        test_url_analyzer()
        test_image_ocr()

    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Backend server is not running on http://127.0.0.1:8000")
        print("Please start Uvicorn first using: uvicorn main:app --reload")