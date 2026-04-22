import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

def train_model():
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # The dataset is now in the same folder
    data_path = os.path.join(base_dir, 'Fertilizer_recommendation.csv')
    # Save the model back to the Backend/models directory
    project_root = os.path.dirname(os.path.dirname(base_dir))
    models_dir = os.path.join(project_root, 'Backend', 'models')
    
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
        
    print(f"Loading data from {data_path}")
    df = pd.read_csv(data_path)
    
    # Strip whitespace from column names just in case
    df.columns = df.columns.str.strip()
    
    # Required columns: 'Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous', 'Fertilizer Name'
    # Encode categorical features: 'Soil Type' and 'Crop Type'
    soil_encoder = LabelEncoder()
    crop_encoder = LabelEncoder()
    
    df['Soil Type'] = soil_encoder.fit_transform(df['Soil Type'])
    df['Crop Type'] = crop_encoder.fit_transform(df['Crop Type'])
    
    # Define features and target
    X = df[['Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']]
    y = df['Fertilizer Name']
    
    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    print(f"Model accuracy on test set: {score:.4f}")
    
    # Save the model and encoders
    model_path = os.path.join(models_dir, 'fertilizer_model.pkl')
    soil_enc_path = os.path.join(models_dir, 'fertilizer_soil_encoder.pkl')
    crop_enc_path = os.path.join(models_dir, 'fertilizer_crop_encoder.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {model_path}")
    
    with open(soil_enc_path, 'wb') as f:
        pickle.dump(soil_encoder, f)
    print(f"Soil encoder saved to {soil_enc_path}")
    
    with open(crop_enc_path, 'wb') as f:
        pickle.dump(crop_encoder, f)
    print(f"Crop encoder saved to {crop_enc_path}")

if __name__ == '__main__':
    train_model()
