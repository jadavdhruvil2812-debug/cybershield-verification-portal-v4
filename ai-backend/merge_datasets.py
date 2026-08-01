import pandas as pd
import os

datasets = []

# SMS Spam Collection
try:
    df1 = pd.read_csv("datasets/spam.csv", encoding="latin-1")
    df1 = df1[["v1", "v2"]]
    df1.columns = ["label", "message"]
    datasets.append(df1)
    print("✓ spam.csv loaded")
except Exception as e:
    print("spam.csv error:", e)

# India Spam Dataset
try:
    df2 = pd.read_csv("datasets/india_spam.csv")
    df2 = df2[["Label", "Msg"]]
    df2.columns = ["label", "message"]
    datasets.append(df2)
    print("✓ india_spam.csv loaded")
except Exception as e:
    print("india_spam.csv error:", e)

# Custom Dataset
try:
    df3 = pd.read_csv("datasets/custom_dataset.csv")
    datasets.append(df3)
    print("✓ custom_dataset.csv loaded")
except Exception as e:
    print("custom_dataset.csv skipped")

# Merge
merged = pd.concat(datasets, ignore_index=True)

merged["label"] = merged["label"].astype(str).str.lower().str.strip()
merged["message"] = merged["message"].astype(str)

merged.drop_duplicates(inplace=True)
merged.dropna(inplace=True)

os.makedirs("datasets", exist_ok=True)

merged.to_csv("datasets/master_dataset.csv", index=False)

print()
print("===================================")
print("Merged Successfully")
print("Total Samples:", len(merged))
print("Saved : datasets/master_dataset.csv")
print("===================================")