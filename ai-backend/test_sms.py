from services.predictor import predict_sms


TEST_MESSAGES = [
    # -------------------------
    # SAFE MESSAGES
    # -------------------------
    (
        "SAFE-01",
        "Hi, I will reach college at 10 AM."
    ),
    (
        "SAFE-02",
        "Your appointment is confirmed for tomorrow at 11 AM."
    ),
    (
        "SAFE-03",
        "Mom asked me to call her when I reach home."
    ),
    (
        "SAFE-04",
        "Your electricity bill of Rs 850 is due next week."
    ),
    (
        "SAFE-05",
        "Thank you for shopping with us. Your order has been delivered."
    ),

    # -------------------------
    # SPAM / SCAM MESSAGES
    # -------------------------
    (
        "SCAM-01",
        "Congratulations! You won a lottery prize. Claim your reward immediately."
    ),
    (
        "SCAM-02",
        "Your bank account will be blocked today. Verify your KYC immediately."
    ),
    (
        "SCAM-03",
        "URGENT! Your SIM will be suspended. Click the link to verify your details."
    ),
    (
        "SCAM-04",
        "You have been selected for a FREE reward. Click now to claim your prize."
    ),
    (
        "SCAM-05",
        "Download the APK immediately to receive your cashback reward."
    ),

    # -------------------------
    # INDIAN-STYLE SUSPICIOUS / SCAM
    # -------------------------
    (
        "INDIA-01",
        "Your UPI account requires verification. Update your details immediately."
    ),
    (
        "INDIA-02",
        "Your parcel delivery failed. Confirm your address to receive the package."
    ),
    (
        "INDIA-03",
        "Electricity connection will be disconnected tonight. Contact the officer immediately."
    ),
    (
        "INDIA-04",
        "Congratulations! You have won a cashback reward. Click the link to claim."
    ),
    (
        "INDIA-05",
        "Your KYC has expired. Update your PAN and bank details to avoid account suspension."
    ),
]


def main():
    print("=" * 80)
    print("CYBERSHIELD REAL-WORLD SMS TEST (SAFE / SUSPICIOUS / UNSAFE)")
    print("=" * 80)

    for test_id, message in TEST_MESSAGES:
        result = predict_sms(message)

        status = result.get("status", "Safe")
        recommendation = result.get("recommendation", "")

        # Format icon based on status
        if status == "Unsafe":
            badge = "🚨 UNSAFE"
        elif status == "Suspicious":
            badge = "⚠️ SUSPICIOUS"
        else:
            badge = "✅ SAFE"

        print(f"\n[{test_id}] {badge}")
        print(f"SMS            : {message}")
        print(f"Status Verdict : {status}")
        print(f"Guidance       : {recommendation}")

    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()