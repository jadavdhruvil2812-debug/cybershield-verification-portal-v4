"""
CyberShield SMS Scam Detection - Model Training Pipeline
"""

import os
import re
import sys
import time
import json
import logging
import datetime
from pathlib import Path
from typing import Tuple, Dict, Any, List

import pandas as pd
import numpy as np
import joblib
try:
    import matplotlib.pyplot as plt  # type: ignore
    import matplotlib  # type: ignore
    matplotlib.use('Agg')
except ImportError:
    plt = None
try:
    import seaborn as sns  # type: ignore
except ImportError:
    sns = None

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix, roc_curve
)

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

logging.basicConfig(
    level=logging.INFO,
    format=f"{Colors.OKCYAN}[%(asctime)s]{Colors.ENDC} %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"
DATA_PATH = DATA_DIR / "master_dataset.csv"

def setup_directories():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', ' URL ', text)
    text = re.sub(r'\b\d+\b', ' NUMBER ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def load_and_clean_data() -> pd.DataFrame:
    logger.info("Loading dataset from %s", DATA_PATH)
    if not DATA_PATH.exists():
        logger.error(f"{Colors.FAIL}Dataset not found at {DATA_PATH}{Colors.ENDC}")
        sys.exit(1)
        
    df = pd.read_csv(DATA_PATH)
    initial_len = len(df)
    
    df.dropna(subset=['label', 'message'], inplace=True)
    df.drop_duplicates(subset=['message'], inplace=True)
    
    df['label'] = df['label'].astype(str).str.lower().str.strip()
    
    label_map = {
        'ham': 0, 'safe': 0, '0': 0, '0.0': 0,
        'spam': 1, 'fraud': 1, '1': 1, '1.0': 1
    }
    
    df['label'] = df['label'].map(label_map)
    df.dropna(subset=['label'], inplace=True)
    df['label'] = df['label'].astype(int)
    
    df['message'] = df['message'].apply(clean_text)
    df = df[df['message'].str.len() > 0]
    
    safe_count = (df['label'] == 0).sum()
    scam_count = (df['label'] == 1).sum()
    
    print(f"\n{Colors.HEADER}=== DATASET STATISTICS ==={Colors.ENDC}")
    print(f"Original size: {initial_len}")
    print(f"Cleaned size:  {len(df)}")
    print(f"Safe count:    {Colors.OKGREEN}{safe_count}{Colors.ENDC}")
    print(f"Scam count:    {Colors.FAIL}{scam_count}{Colors.ENDC}")
    print(f"{Colors.HEADER}=========================={Colors.ENDC}\n")
    
    return df

def extract_feature_importance(model, vectorizer, output_path):
    try:
        feature_names = vectorizer.get_feature_names_out()
        coef = None
        
        if hasattr(model, 'coef_'):
            if isinstance(model.coef_, np.ndarray):
                coef = model.coef_[0]
            else:
                coef = model.coef_.toarray()[0]
        elif hasattr(model, 'feature_importances_'):
            coef = model.feature_importances_
        elif hasattr(model, 'feature_log_prob_'):
            coef = model.feature_log_prob_[1] - model.feature_log_prob_[0]
            
        if coef is not None:
            top_indices = np.argsort(coef)[-100:][::-1]
            top_features = feature_names[top_indices]
            top_scores = coef[top_indices]
            
            df_imp = pd.DataFrame({
                'keyword': top_features,
                'importance_score': top_scores
            })
            df_imp.to_csv(output_path, index=False)
            logger.info("Saved top keywords to %s", output_path)
    except Exception as e:
        logger.warning(f"Could not extract feature importance: {e}")

def plot_confusion_matrix(y_true, y_pred, output_path):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=['Safe', 'Scam'], yticklabels=['Safe', 'Scam'])
    plt.title('Confusion Matrix')
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

def plot_roc_curve(y_true, y_scores, output_path):
    fpr, tpr, _ = roc_curve(y_true, y_scores)
    roc_auc = roc_auc_score(y_true, y_scores)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic')
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

def train_models():
    setup_directories()
    df = load_and_clean_data()
    
    X = df['message']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    logger.info("Vectorizing text data (TF-IDF)...")
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    vocab_size = len(vectorizer.get_feature_names_out())
    logger.info("Vocabulary size: %d", vocab_size)
    
    models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "LinearSVC": LinearSVC(random_state=42, dual=False),
        "MultinomialNB": MultinomialNB(),
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    }
    
    best_model_name = ""
    best_model = None
    best_f1 = -1
    best_metrics = {}
    best_y_pred = None
    best_y_score = None
    
    print(f"\n{Colors.BOLD}Training Models...{Colors.ENDC}\n")
    
    for name, model in models.items():
        start_time = time.time()
        model.fit(X_train_vec, y_train)
        train_time = time.time() - start_time
        
        y_pred = model.predict(X_test_vec)
        
        if hasattr(model, "predict_proba"):
            y_score = model.predict_proba(X_test_vec)[:, 1]
        elif hasattr(model, "decision_function"):
            y_score = model.decision_function(X_test_vec)
        else:
            y_score = y_pred
            
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc = roc_auc_score(y_test, y_score)
        
        print(f"{Colors.HEADER}--- {name} ---{Colors.ENDC}")
        print(f"Training Time : {train_time:.3f}s")
        print(f"Accuracy      : {acc:.4f}")
        print(f"Precision     : {prec:.4f}")
        print(f"Recall        : {rec:.4f}")
        print(f"F1 Score      : {f1:.4f}")
        print(f"ROC AUC       : {roc:.4f}")
        print("Classification Report:")
        print(classification_report(y_test, y_pred, digits=4))
        print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}\n")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = model
            best_metrics = {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1": f1,
                "roc_auc": roc
            }
            best_y_pred = y_pred
            best_y_score = y_score

    print(f"{Colors.OKGREEN}{Colors.BOLD}=== BEST MODEL SELECTED ==={Colors.ENDC}")
    print(f"Model:     {best_model_name}")
    print(f"Accuracy:  {best_metrics['accuracy']:.4f}")
    print(f"Precision: {best_metrics['precision']:.4f}")
    print(f"Recall:    {best_metrics['recall']:.4f}")
    print(f"F1 Score:  {best_metrics['f1']:.4f}")
    print(f"ROC AUC:   {best_metrics['roc_auc']:.4f}")
    print(f"{Colors.OKGREEN}==========================={Colors.ENDC}\n")
    
    logger.info("Saving best model and vectorizer...")
    joblib.dump(best_model, MODELS_DIR / "sms_model.pkl")
    joblib.dump(vectorizer, MODELS_DIR / "vectorizer.pkl")
    
    logger.info("Saving evaluation visualizations...")
    plot_confusion_matrix(y_test, best_y_pred, MODELS_DIR / "confusion_matrix.png")
    plot_roc_curve(y_test, best_y_score, MODELS_DIR / "roc_curve.png")
    
    logger.info("Extracting feature importances...")
    extract_feature_importance(best_model, vectorizer, MODELS_DIR / "top_keywords.csv")
    
    model_info = {
        "training_date": datetime.datetime.now().isoformat(),
        "dataset_size": len(df),
        "model_name": best_model_name,
        "vocabulary_size": int(vocab_size),
        "metrics": best_metrics
    }
    
    with open(MODELS_DIR / "model_info.json", "w") as f:
        json.dump(model_info, f, indent=4)
        
    logger.info(f"{Colors.OKBLUE}Training pipeline completed successfully.{Colors.ENDC}")

if __name__ == "__main__":
    start_total = time.time()
    try:
        train_models()
    except KeyboardInterrupt:
        logger.warning("Training interrupted by user.")
        sys.exit(0)
    except Exception as e:
        logger.exception(f"{Colors.FAIL}An error occurred during training: {e}{Colors.ENDC}")
        sys.exit(1)
    finally:
        total_time = time.time() - start_total
        logger.info(f"Total execution time: {total_time:.2f} seconds")