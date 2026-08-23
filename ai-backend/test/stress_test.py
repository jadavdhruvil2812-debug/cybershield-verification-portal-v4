import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.predictor import predict_sms

TEST_MESSAGES = [
    # SAFE
    ("Safe", "Hey, are you coming to college tomorrow?"),
    ("Safe", "Your appointment is confirmed for tomorrow at 11 AM."),
    ("Safe", "Your electricity bill of Rs 850 is due next week."),
    ("Safe", "Thank you for shopping with us. Your order has been delivered."),
    ("Safe", "Mom asked me to call her when I reach home."),
    ("Safe", "Your train ticket booking is confirmed."),
    ("Safe", "Your exam timetable has been uploaded."),
    ("Safe", "Meeting is scheduled at 4 PM today."),
    ("Safe", "Your order has been shipped successfully."),
    ("Safe", "Happy birthday! Have a great day."),

    # UNSAFE
    ("Unsafe", "Your bank account will be blocked today. Verify your KYC immediately."),
    ("Unsafe", "Congratulations! You won a lottery prize. Claim your reward now."),
    ("Unsafe", "URGENT! Your SIM will be suspended. Click the link to verify your details."),
    ("Unsafe", "Download the APK immediately to receive your cashback reward."),
    ("Unsafe", "Your KYC has expired. Update your PAN and bank details to avoid suspension."),
    ("Unsafe", "Your parcel delivery failed. Confirm your address and pay the delivery fee."),
    ("Unsafe", "You have won Rs 50000. Click the link to claim your reward."),
    ("Unsafe", "Electricity connection will be disconnected tonight. Contact the officer immediately."),
    ("Unsafe", "Your UPI account is blocked. Verify your details immediately."),
    ("Unsafe", "Congratulations! You are selected for a cash prize. Claim now."),

    # SUSPICIOUS
    ("Suspicious", "Please verify your account details."),
    ("Suspicious", "Your payment requires confirmation."),
    ("Suspicious", "Please update your profile information."),
    ("Suspicious", "Your account needs verification."),
    ("Suspicious", "Click here to continue."),
    ("Suspicious", "Your delivery requires address confirmation."),
    ("Suspicious", "Please confirm your details within 24 hours."),
    ("Suspicious", "Your account verification is pending."),
    ("Suspicious", "Update your information to continue using the service."),
    ("Suspicious", "Please confirm the requested information.")
]

correct = 0
total = len(TEST_MESSAGES)

print("\n" + "=" * 70)
print("CYBERSHIELD STRESS TEST (SAFE / SUSPICIOUS / UNSAFE)")
print("=" * 70)

for index, (expected, message) in enumerate(TEST_MESSAGES, 1):

    result = predict_sms(message)
    status_output = result.get("status", "Safe")
    recommendation = result.get("recommendation", "")

    if status_output.lower() == expected.lower():
        correct += 1
        verdict = "PASS"
    else:
        verdict = "FAIL"

    print(f"\n[{index:02d}] {verdict}")
    print("Expected   :", expected)
    print("Prediction :", status_output)
    print("Guidance   :", recommendation)
    print("Message    :", message)

accuracy = (correct / total) * 100

print("\n" + "=" * 70)
print("FINAL RESULT")
print("=" * 70)
print("Total Tests :", total)
print("Passed      :", correct)
print("Failed      :", total - correct)
print("Accuracy    :", f"{accuracy:.2f}%")
print("=" * 70)