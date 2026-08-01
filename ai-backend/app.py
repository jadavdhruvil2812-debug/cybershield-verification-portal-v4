import os
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.ocr_service import extract_text_from_image
from services.predictor import predict_sms


app = FastAPI(
    title="CyberShield AI Backend",
    version="2.0"
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MODELS
# =========================

class SMSRequest(BaseModel):
    sms: str



# =========================
# HOME TEST
# =========================

@app.get("/")
def home():
    return {
        "status": "running",
        "service": "CyberShield AI Backend",
        "version": "2.0"
    }



# =========================
# COMMON SMS ANALYSIS
# =========================

def analyze_sms(text: str):

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="SMS text is empty"
        )


    result = predict_sms(text)


    if result["prediction"] == "SCAM":
        risk = "HIGH"

        recommendation = (
            "Do not click links, share OTP, "
            "passwords or banking details."
        )

    elif result["prediction"] == "SUSPICIOUS":

        risk = "MEDIUM"

        recommendation = (
            "Verify sender before taking any action."
        )

    else:

        risk = "LOW"

        recommendation = (
            "Message appears safe. "
            "Stay alert."
        )


    return {

        "prediction": result["prediction"],

        "confidence": result["confidence"],

        "risk": risk,

        "threat_score": result["threat_score"],

        "reasons": result["reasons"],

        "recommendation": recommendation,

        "sms": text
    }



# =========================
# SMS API
# =========================

@app.post("/predict")
def predict_sms_api(data: SMSRequest):

    return analyze_sms(data.sms)



# Compatibility route
# Supports old frontend code
@app.post("/verify-sms")
def verify_sms(data: SMSRequest):

    return analyze_sms(data.sms)




# =========================
# IMAGE SMS DETECTION
# =========================

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):

    os.makedirs(
        "uploads",
        exist_ok=True
    )


    file_path = (
        f"uploads/{file.filename}"
    )


    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        extracted_text = (
            extract_text_from_image(file_path)
        )


        if not extracted_text.strip():

            return {

                "success": False,

                "message":
                "No text detected in image."

            }


        result = analyze_sms(
            extracted_text
        )


        result["success"] = True

        result["extracted_text"] = extracted_text


        return result



    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


    finally:

        if os.path.exists(file_path):

            os.remove(file_path)