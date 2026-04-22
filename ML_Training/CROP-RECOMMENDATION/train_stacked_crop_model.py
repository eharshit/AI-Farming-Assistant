import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier, StackingClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler

from sklearn.neural_network import MLPClassifier

def train_stacked_model():
    # 1: Load and preprocess the dataset
    dataset_path = 'Crop_recommendation.csv'
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found.")
        return

    # 2: Load the dataset
    df = pd.read_csv(dataset_path)

    # 3: Split into features and target
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 4: Split (80/20) with STRATIFICATION
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

    print("Layer 1: Defining Base Models (Passthrough Stack)...")
    from sklearn.naive_bayes import GaussianNB
    estimators = [
        ('rf', RandomForestClassifier(n_estimators=300, random_state=42)),
        ('et', ExtraTreesClassifier(n_estimators=300, random_state=42)),
        ('xgb', XGBClassifier(n_estimators=300, random_state=42)),
        ('gb', GradientBoostingClassifier(n_estimators=300, random_state=42)),
        ('svc', SVC(probability=True, random_state=42)),
        ('knn', KNeighborsClassifier(n_neighbors=5)),
        ('nb', GaussianNB())
    ]

    print("Layer 2: Training StackingClassifier (Passthrough + LR Meta)...")
    clf = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(max_iter=2000, random_state=42),
        passthrough=True,
        cv=5
    )
    
    clf.fit(X_train, y_train)

    print("Layer 6: Evaluating the Model...")
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy of the stacked ensemble model: {accuracy:.4f}")

    if accuracy >= 0.994:
        print("Success! Targeted accuracy achieved.")
    else:
        print(f"Current accuracy is {accuracy:.4f}. Almost there!")

    print("Layer 7: Saving the Trained Model...")
    ensemble_model = {
        'stacking_clf': clf,
        'label_encoder': le,
        'scaler': scaler,
        'is_sklearn_stack': True # New flag
    }
    
    save_path = 'stacked_crop_model.pkl'
    with open(save_path, 'wb') as f:
        pickle.dump(ensemble_model, f)
    
    print(f"Model saved to {save_path}")

if __name__ == "__main__":
    train_stacked_model()
