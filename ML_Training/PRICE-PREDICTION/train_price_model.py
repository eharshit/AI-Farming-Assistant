import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Create model directory in Backend
MODEL_DIR = os.path.join("..", "..", "Backend", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv("price_dataset.csv")

# Clean data: drop missing target values
df = df.dropna(subset=['modal_price'])

# Extract Month from Date
# Convert date to datetime safely
df['date'] = pd.to_datetime(df['date'], errors='coerce')
df = df.dropna(subset=['date'])
df['month'] = df['date'].dt.month

# We will predict based on commodity, state, district, market, and month
features = ['commodity_name', 'state', 'district', 'market', 'month']
target = 'modal_price'

X = df[features].copy()
# Convert target from INR/Kg to INR/Quintal natively during training
y = df[target] * 100

print("Encoding categorical variables...")
encoders = {}
for col in ['commodity_name', 'state', 'district', 'market']:
    # Convert all to strings and handle NaNs
    X[col] = X[col].astype(str).fillna('Unknown')
    le = LabelEncoder()
    # Add an 'Unknown' class to handle unseen data during prediction
    le.fit(list(X[col].unique()) + ['Unknown'])
    X[col] = le.transform(X[col])
    encoders[col] = le

# Save the encoders for the backend API
encoder_path = os.path.join(MODEL_DIR, "price_encoders.pkl")
with open(encoder_path, 'wb') as f:
    pickle.dump(encoders, f)
print(f"Saved encoders to {encoder_path}")

print("Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest Regressor (this may take a moment)...")
# Using Random Forest Regressor
model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# Evaluate
score = model.score(X_test, y_test)
print(f"Model R^2 Score: {score:.4f}")

# Save the model
model_path = os.path.join(MODEL_DIR, "price_model.pkl")
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"Model saved successfully to {model_path}!")
print("Training Complete.")
