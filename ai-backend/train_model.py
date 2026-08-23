import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)


DATASET_PATH = "./datasets/raw/master_dataset.csv"


def load_dataset():
    df = pd.read_csv(DATASET_PATH)

    df = df[["label", "message"]].copy()

    df["message"] = df["message"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()

    # Keep only valid labels
    df = df[df["label"].isin(["ham", "spam"])]

    # Remove exact duplicate messages if any
    df = df.drop_duplicates(subset=["message"])

    print("=" * 60)
    print("DATASET INFORMATION")
    print("=" * 60)
    print(f"Total messages : {len(df)}")
    print(f"Ham messages   : {(df['label'] == 'ham').sum()}")
    print(f"Spam messages  : {(df['label'] == 'spam').sum()}")
    print()

    return df


def evaluate_model(name, model, X_train, X_test, y_train, y_test):
    print("=" * 60)
    print(f"MODEL: {name}")
    print("=" * 60)

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, pos_label="spam")
    recall = recall_score(y_test, predictions, pos_label="spam")
    f1 = f1_score(y_test, predictions, pos_label="spam")

    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=["ham", "spam"],
        )
    )

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    print()

    return {
        "name": name,
        "model": model,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


def main():
    df = load_dataset()

    X = df["message"]
    y = df["label"]

    # 80% training, 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print("=" * 60)
    print("TRAIN / TEST SPLIT")
    print("=" * 60)
    print(f"Training messages : {len(X_train)}")
    print(f"Testing messages  : {len(X_test)}")
    print()

    models = [
        (
            "Logistic Regression",
            Pipeline(
                [
                    (
                        "tfidf",
                        TfidfVectorizer(
                            lowercase=True,
                            ngram_range=(1, 2),
                            min_df=1,
                            sublinear_tf=True,
                        ),
                    ),
                    (
                        "classifier",
                        LogisticRegression(
                            max_iter=2000,
                            class_weight="balanced",
                        ),
                    ),
                ]
            ),
        ),
        (
            "Linear SVM",
            Pipeline(
                [
                    (
                        "tfidf",
                        TfidfVectorizer(
                            lowercase=True,
                            ngram_range=(1, 2),
                            min_df=1,
                            sublinear_tf=True,
                        ),
                    ),
                    (
                        "classifier",
                        LinearSVC(
                            class_weight="balanced",
                        ),
                    ),
                ]
            ),
        ),
        (
            "Multinomial Naive Bayes",
            Pipeline(
                [
                    (
                        "tfidf",
                        TfidfVectorizer(
                            lowercase=True,
                            ngram_range=(1, 2),
                            min_df=1,
                            sublinear_tf=True,
                        ),
                    ),
                    (
                        "classifier",
                        MultinomialNB(),
                    ),
                ]
            ),
        ),
    ]

    results = []

    for name, model in models:
        result = evaluate_model(
            name,
            model,
            X_train,
            X_test,
            y_train,
            y_test,
        )
        results.append(result)

    # Select best model based on F1 score
    best = max(results, key=lambda x: x["f1"])

    print("=" * 60)
    print("BEST MODEL")
    print("=" * 60)
    print(f"Model     : {best['name']}")
    print(f"Accuracy  : {best['accuracy']:.4f}")
    print(f"Precision : {best['precision']:.4f}")
    print(f"Recall    : {best['recall']:.4f}")
    print(f"F1 Score  : {best['f1']:.4f}")
    print()

    # Save the best model
    output_path = "./models/sms_model.joblib"

    import os

    os.makedirs("./models", exist_ok=True)

    joblib.dump(best["model"], output_path)

    print(f"Model saved to: {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()