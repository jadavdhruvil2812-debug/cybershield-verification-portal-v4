import joblib

# Load model and vectorizer
model = joblib.load("models/sms_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

print("=" * 60)
print("CyberShield SMS Threat Detector (CLI Mode)")
print("Direct Status Verdict: Safe / Suspicious / Unsafe")
print("Type 'exit' to quit")
print("=" * 60)

while True:
    text = input("\nEnter SMS: ").strip()

    if text.lower() == "exit":
        print("Goodbye!")
        break

    if not text:
        print("Please enter a message.")
        continue

    # Convert text to vector
    text_vector = vectorizer.transform([text])

    # Prediction & probability estimation
    prediction = model.predict(text_vector)[0]
    
    # Extract probability if available
    try:
        probability = model.predict_proba(text_vector)[0]
        scam_prob = probability[1]
    except AttributeError:
        # For models like LinearSVC without predict_proba
        try:
            margin = model.decision_function(text_vector)[0]
            scam_prob = 1.0 / (1.0 + (2.71828 ** (-margin)))
        except Exception:
            scam_prob = 1.0 if prediction == 1 else 0.0

    print("\n------------------------------")

    # Simplified 3-tier status determination
    if prediction == 1 or scam_prob >= 0.65:
        print("Status         : 🚨 Unsafe")
        print("Recommendation : High risk detected. Do not click links or share details.")
    elif scam_prob >= 0.30:
        print("Status         : ⚠️ Suspicious")
        print("Recommendation : Caution advised. Verify through official channels.")
    else:
        print("Status         : ✅ Safe")
        print("Recommendation : Message appears safe to interact with.")

    print("------------------------------")