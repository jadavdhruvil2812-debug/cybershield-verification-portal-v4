"""
CyberShield AI Dataset Preparation Engine
Professional Dataset Cleaner & Merger

Version: 1.2
"""

import os
import re
import unicodedata
from pathlib import Path

import pandas as pd
import numpy as np
from tqdm import tqdm


# ===========================
# PATH CONFIGURATION
# ===========================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "datasets" / "raw"

CLEAN_DIR = BASE_DIR / "datasets" / "cleaned"

PROCESSED_DIR = BASE_DIR / "datasets" / "processed"

RAW_FILES = [
    "master_dataset.csv",
    "india_spam.csv",
    "custom_dataset.csv",
]

OUTPUT_FILE = PROCESSED_DIR / "master_sms_dataset.csv"

REPORT_FILE = PROCESSED_DIR / "dataset_report.txt"


# ===========================
# CREATE FOLDERS
# ===========================

CLEAN_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ===========================
# LABEL NORMALIZATION
# ===========================

LABEL_MAP = {
    "spam": "spam",
    "Spam": "spam",
    "SPAM": "spam",

    "ham": "ham",
    "Ham": "ham",
    "HAM": "ham",

    "safe": "ham",
    "legitimate": "ham",

    "scam": "spam",
    "fraud": "spam",
}


# ===========================
# COLUMN STANDARDIZATION
# ===========================

COLUMN_MAP = {
    "label": "label",
    "Label": "label",
    "LABEL": "label",
    "v1": "label",

    "message": "message",
    "Message": "message",
    "MSG": "message",
    "Msg": "message",
    "sms": "message",
    "text": "message",
    "v2": "message",
}


# ===========================
# CLEAN TEXT
# ===========================

def clean_text(text):

    if pd.isna(text):
        return ""

    text = str(text)

    text = unicodedata.normalize("NFKC", text)

    text = text.replace("\n", " ")

    text = text.replace("\r", " ")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ===========================
# LOAD DATASET
# ===========================

def load_dataset(file_path):

    print(f"Loading : {file_path.name}")

    df = pd.read_csv(file_path)

    df.columns = [
        COLUMN_MAP.get(col.strip(), col.strip())
        for col in df.columns
    ]

    if "label" not in df.columns:
        raise Exception(f"{file_path.name} : label column missing")

    if "message" not in df.columns:
        raise Exception(f"{file_path.name} : message column missing")

    df = df[["label", "message"]]

    df["label"] = (
        df["label"]
        .astype(str)
        .str.strip()
        .map(lambda x: LABEL_MAP.get(x, x.lower()))
    )

    df["message"] = df["message"].apply(clean_text)

    df = df.dropna()

    df = df.drop_duplicates()

    df = df[df["message"].str.len() > 3]

    print(f"Loaded {len(df)} rows")

    return df


# ===========================
# FEATURE EXTRACTION
# ===========================

URL_REGEX = re.compile(
    r"(https?://\S+|www\.\S+|bit\.ly/\S+|tinyurl\.com/\S+)",
    re.IGNORECASE,
)

PHONE_REGEX = re.compile(
    r"(\+91[\-\s]?)?[6-9]\d{9}"
)

EMAIL_REGEX = re.compile(
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
)

OTP_REGEX = re.compile(
    r"\b\d{4,8}\b"
)

SCAM_KEYWORDS = [
    "kyc",
    "verify",
    "verification",
    "urgent",
    "blocked",
    "suspended",
    "reward",
    "winner",
    "won",
    "free",
    "claim",
    "lottery",
    "gift",
    "upi",
    "bank",
    "account",
    "debit",
    "credit",
    "payment",
    "refund",
    "cashback",
    "click",
    "link",
    "limited offer",
    "offer",
    "electricity",
    "courier",
    "delivery",
    "apk",
    "update",
    "password",
    "login",
    "security",
    "income tax",
    "aadhaar",
    "pan",
]


def extract_features(df):

    print("\nExtracting Features...")

    tqdm.pandas()

    df["message"] = df["message"].astype(str)

    df["length"] = df["message"].str.len()

    df["word_count"] = df["message"].str.split().str.len()

    df["uppercase_count"] = df["message"].apply(
        lambda x: sum(c.isupper() for c in x)
    )

    df["digit_count"] = df["message"].apply(
        lambda x: sum(c.isdigit() for c in x)
    )

    df["special_count"] = df["message"].apply(
        lambda x: len(re.findall(r"[!@#$%^&*()_+=<>?/]", x))
    )

    df["has_url"] = df["message"].apply(
        lambda x: int(bool(URL_REGEX.search(x)))
    )

    df["has_phone"] = df["message"].apply(
        lambda x: int(bool(PHONE_REGEX.search(x)))
    )

    df["has_email"] = df["message"].apply(
        lambda x: int(bool(EMAIL_REGEX.search(x)))
    )

    df["has_otp"] = df["message"].apply(
        lambda x: int(bool(OTP_REGEX.search(x)))
    )

    df["scam_keyword_count"] = df["message"].apply(
        lambda x: sum(
            keyword.lower() in x.lower()
            for keyword in SCAM_KEYWORDS
        )
    )

    print("Feature Extraction Complete")

    return df


# ===========================
# MERGE DATASETS
# ===========================

def merge_datasets():

    print("\nReading Datasets...\n")

    all_frames = []

    for file_name in RAW_FILES:

        file_path = RAW_DIR / file_name

        if not file_path.exists():
            print(f"Skipped : {file_name}")
            continue

        df = load_dataset(file_path)

        all_frames.append(df)

    if len(all_frames) == 0:
        raise Exception("No datasets found.")

    merged = pd.concat(
        all_frames,
        ignore_index=True,
    )

    before = len(merged)

    merged = merged.drop_duplicates(
        subset=["message"]
    )

    after = len(merged)

    print(f"\nDuplicates Removed : {before-after}")

    merged = extract_features(merged)

    return merged


# ===========================
# SAVE DATASET
# ===========================

def save_dataset(df):

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8",
    )

    print("\nDataset Saved")
    print(OUTPUT_FILE)


# ===========================
# DATASET REPORT
# ===========================

def generate_report(df):

    spam_count = len(
        df[df["label"] == "spam"]
    )

    ham_count = len(
        df[df["label"] == "ham"]
    )

    total = len(df)

    report = f"""
CyberShield Dataset Report
==========================

Total Messages : {total}

Spam Messages : {spam_count}

Ham Messages : {ham_count}

Spam Percentage :
{round(spam_count/total*100,2)} %

Ham Percentage :
{round(ham_count/total*100,2)} %

Average Length :
{round(df['length'].mean(),2)}

Average Words :
{round(df['word_count'].mean(),2)}

Messages With URL :
{df['has_url'].sum()}

Messages With OTP :
{df['has_otp'].sum()}

Messages With Phone :
{df['has_phone'].sum()}

Messages With Email :
{df['has_email'].sum()}

Average Scam Keywords :
{round(df['scam_keyword_count'].mean(),2)}
"""

    with open(
        REPORT_FILE,
        "w",
        encoding="utf-8",
    ) as f:

        f.write(report)

    print("\nReport Generated")
    print(REPORT_FILE)


# ===========================
# MAIN FUNCTION
# ===========================

def main():

    print("=" * 60)
    print("CyberShield Dataset Preparation Engine")
    print("=" * 60)

    try:

        dataset = merge_datasets()

        save_dataset(dataset)

        generate_report(dataset)

        print("\n" + "=" * 60)
        print("DATASET PREPARATION COMPLETED SUCCESSFULLY")
        print("=" * 60)

        print(f"\nFinal Dataset Size : {len(dataset)}")

        print("\nClass Distribution:")
        print(dataset["label"].value_counts())

        print("\nPreview:")
        print(dataset.head())

    except Exception as e:

        print("\nERROR:")
        print(e)


# ===========================
# ENTRY POINT
# ===========================

if __name__ == "__main__":
    main()