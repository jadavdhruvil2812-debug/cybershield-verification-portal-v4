import joblib

# Load model and vectorizer
model = joblib.load("models/sms_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

print("=" * 60)
print("CyberShield SMS Scam Detector")
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

    # Convert text
    text_vector = vectorizer.transform([text])

    # Prediction
    prediction = model.predict(text_vector)[0]

    # Probability (Confidence)
    probability = model.predict_proba(text_vector)[0]

    safe_confidence = probability[0] * 100
    scam_confidence = probability[1] * 100

    print("\n------------------------------")

    if prediction == 1:
        print("Prediction : 🚨 SCAM")
        print(f"Confidence : {scam_confidence:.2f}%")
    else:
        print("Prediction : ✅ SAFE")
        print(f"Confidence : {safe_confidence:.2f}%")

    print("------------------------------")