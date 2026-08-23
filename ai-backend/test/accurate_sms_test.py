import sys
from pathlib import Path

# Setup module path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.predictor import predict_sms

TESTS = [
    # =========================
    # SAFE MESSAGES
    # =========================
    ("Safe", "Hi, I will reach college at 10 AM."),
    ("Safe", "Your appointment is confirmed for tomorrow at 11 AM."),
    ("Safe", "Your train ticket booking is confirmed."),
    ("Safe", "Your electricity bill of Rs 850 is due next week."),
    ("Safe", "Thank you for shopping with us. Your order has been delivered."),
    ("Safe", "Mom asked me to call her when I reach home."),
    ("Safe", "Your exam timetable has been uploaded."),
    ("Safe", "Meeting is scheduled at 4 PM today."),
    ("Safe", "Your order has been shipped successfully."),
    ("Safe", "Happy birthday! Have a great day."),
    ("Safe", "Your college library book is due tomorrow."),
    ("Safe", "Your appointment has been successfully scheduled."),
    ("Safe", "Your train leaves at 6:30 PM from platform 2."),
    ("Safe", "Your monthly electricity bill is Rs 1250."),
    ("Safe", "Your parcel has been delivered successfully."),

    # =========================
    # SUSPICIOUS MESSAGES
    # =========================
    ("Suspicious", "Please verify your account details."),
    ("Suspicious", "Your payment requires confirmation."),
    ("Suspicious", "Please update your profile information."),
    ("Suspicious", "Your account needs verification."),
    ("Suspicious", "Click here to continue."),
    ("Suspicious", "Your delivery requires address confirmation."),
    ("Suspicious", "Please confirm your details within 24 hours."),
    ("Suspicious", "Your account verification is pending."),
    ("Suspicious", "Update your information to continue using the service."),
    ("Suspicious", "Please confirm the requested information."),

    # =========================
    # UNSAFE MESSAGES
    # =========================
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
    ("Unsafe", "Click this link immediately to receive your free cashback reward."),
    ("Unsafe", "Your ATM card will be blocked unless you verify your account now."),
    ("Unsafe", "Your PAN KYC is suspended. Click here to update your banking details."),
    ("Unsafe", "You have received a FREE cash reward. Claim immediately."),
    ("Unsafe", "Urgent! Pay the delivery fee now to receive your parcel."),
]

passed = 0
failed = 0

print("=" * 75)
print("CYBERSHIELD ACCURATE SMS CLASSIFICATION TEST")
print("=" * 75)

for i, (expected, message) in enumerate(TESTS, 1):
    result = predict_sms(message)
    status_output = result.get("status", "Safe")
    recommendation = result.get("recommendation", "")

    test_passed = (status_output.lower() == expected.lower())

    if test_passed:
        passed += 1
        verdict = "PASS"
    else:
        failed += 1
        verdict = "FAIL"

    print(f"\n[{i:02d}] {verdict}")
    print(f"Expected   : {expected}")
    print(f"Prediction : {status_output}")
    print(f"Message    : {message}")
    print(f"Guidance   : {recommendation}")

print("\n" + "=" * 75)
print("FINAL RESULT")
print("=" * 75)

total = len(TESTS)
accuracy = (passed / total) * 100

print(f"Total Tests : {total}")
print(f"Passed      : {passed}")
print(f"Failed      : {failed}")
print(f"Accuracy    : {accuracy:.2f}%")
print("=" * 75)