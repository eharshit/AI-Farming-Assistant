import pandas as pd
import numpy as np
import pickle
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def test_new_model_accuracy():
    # Paths
    dataset_path = r'c:\Study Material\FiY Project\AI Farming Assistant\ML_Training\CROP-RECOMMENDATION\Crop_recommendation.csv'
    model_path = r'c:\Study Material\FiY Project\AI Farming Assistant\Backend\models\stacked_crop_model.pkl'
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return

    # Load Model
    print("Loading Stacked Ensemble Model...")
    with open(model_path, 'rb') as f:
        ensemble = pickle.load(f)
    
    le = ensemble['label_encoder']

    # Load Data
    print("Loading Dataset...")
    df = pd.read_csv(dataset_path)
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    y_encoded = le.transform(y)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

    # Evaluate
    print("Evaluating Ensemble Model...")
    is_sklearn_stack = ensemble.get('is_sklearn_stack', False)
    
    if is_sklearn_stack:
        scaler = ensemble['scaler']
        clf = ensemble['stacking_clf']
        X_test_scaled = scaler.transform(X_test)
        final_preds = clf.predict(X_test_scaled)
    else:
        # Fallback for manual stack
        model1 = ensemble['base_model1']
        model2 = ensemble['base_model2']
        meta = ensemble['meta_classifier']
        p1 = model1.predict_proba(X_test) if ensemble.get('use_proba') else model1.predict(X_test)
        p2 = model2.predict_proba(X_test) if ensemble.get('use_proba') else model2.predict(X_test)
        stacked_test = np.column_stack((p1, p2))
        final_preds = meta.predict(stacked_test)

    # Accuracy
    accuracy = accuracy_score(y_test, final_preds)
    print(f"\nOverall Accuracy: {accuracy * 100:.2f}%")

    # Classification Report
    print("\nClassification Report:")
    target_names = list(le.classes_)
    print(classification_report(y_test, final_preds, target_names=target_names))

    # Confusion Matrix
    cm = confusion_matrix(y_test, final_preds)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=target_names, yticklabels=target_names)
    plt.title('Confusion Matrix - Stacked Ensemble Model')
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    
    # Save the plot
    plot_path = 'model_accuracy_test.png'
    plt.savefig(plot_path)
    print(f"\nConfusion matrix saved to {plot_path}")

if __name__ == "__main__":
    test_new_model_accuracy()
