import os
import pickle
import numpy as np
import random
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
from datetime import datetime
import json
from database import database, engine, metadata
from models import farm_status, recommendation_history
import httpx

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("WARNING: TensorFlow not found. Running Disease endpoint in MOCK mode.")

app = FastAPI(title="AgriSens API", version="1.0.0")

# Enable CORS for the Vite React App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Create tables
    metadata.create_all(engine)
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Load Models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
stacked_model_path = os.path.join(MODEL_DIR, "stacked_crop_model.pkl")
keras_model_path = os.path.join(MODEL_DIR, "trained_plant_disease_model.keras")

try:
    with open(stacked_model_path, 'rb') as f:
        crop_ensemble = pickle.load(f)
    print("Stacked Crop Ensemble loaded successfully.")
except Exception as e:
    import traceback
    print(f"Warning: Failed to load Stacked Crop Model: {e}. Will run in MOCK mode.")
    print("Traceback details:")
    traceback.print_exc()
    crop_ensemble = None

# Fertilizer Models  
fertilizer_model_path = os.path.join(MODEL_DIR, "fertilizer_model.pkl")
fertilizer_soil_enc_path = os.path.join(MODEL_DIR, "fertilizer_soil_encoder.pkl")
fertilizer_crop_enc_path = os.path.join(MODEL_DIR, "fertilizer_crop_encoder.pkl")

try:
    with open(fertilizer_model_path, 'rb') as f:
        fertilizer_model = pickle.load(f)
    with open(fertilizer_soil_enc_path, 'rb') as f:
        fertilizer_soil_enc = pickle.load(f)
    with open(fertilizer_crop_enc_path, 'rb') as f:
        fertilizer_crop_enc = pickle.load(f)
except Exception as e:
    print(f"Warning: Failed to load Fertilizer Model: {e}. Will run in MOCK mode.")
    fertilizer_model = None
    fertilizer_soil_enc = None
    fertilizer_crop_enc = None

try:
    if TF_AVAILABLE:
        disease_model = tf.keras.models.load_model(keras_model_path)
    else:
        disease_model = None
except Exception as e:
    print(f"Warning: Failed to load Disease Model: {e}")
    disease_model = None


# Disease Classes
DISEASE_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Mock crop classes
MOCK_CROPS = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee']

class CropRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class FertilizerRequest(BaseModel):
    temperature: float
    humidity: float
    moisture: float
    soil_type: str
    crop_type: str
    nitrogen: float
    potassium: float
    phosphorus: float

@app.get("/")
def read_root():
    return {"message": "Welcome to AgriSens API"}

def get_crop_insights(crop, features, feature_names, base_model=None):
    # features: [N, P, K, temp, hum, ph, rain]
    n, p, k, temp, hum, ph, rain = features[0]
    
    insights = []
    # Very basic rule-based insights for common crops to simulate explainability
    if n > 70: insights.append("High nitrogen content detected, ideal for leafy growth.")
    if p > 50: insights.append("Rich phosphorous levels will support strong root development.")
    if ph < 6.0: insights.append("Soil is slightly acidic, which this crop tolerates well.")
    elif ph > 7.0: insights.append("Alkaline soil conditions are optimal for this variety.")
    
    if rain > 200: insights.append("Ample rainfall matches the high water requirements.")
    elif rain < 50: insights.append("Excellent choice for low-rainfall or arid conditions.")

    if not insights:
        insights.append(f"Environmental parameters show a high suitability score for {crop} growth.")
        insights.append("Soil and climate factors are balanced for this specific recommendation.")

    # Feature importance from the model
    importance_data = {}
    if base_model and hasattr(base_model, 'feature_importances_'):
        importances = base_model.feature_importances_
        for i, name in enumerate(feature_names):
            importance_data[name] = float(importances[i])
    else:
        # Fallback heuristic importance (total = 1.0)
        importances = [0.18, 0.12, 0.10, 0.22, 0.15, 0.08, 0.15]
        for i, name in enumerate(feature_names):
            importance_data[name] = importances[i]

    return insights, importance_data

def get_fertilizer_insights(fertilizer, features, feature_names=None, base_model=None):
    # features: [temp, hum, moist, soil, crop, n, p, k]
    n, p, k = features[0][5], features[0][6], features[0][7]
    
    insights = []
    if "Urea" in fertilizer:
        insights.append(f"Nitrogen level ({n}) is low. Urea provides highly concentrated Nitrogen for vegetative growth.")
    elif "DAP" in fertilizer:
        insights.append(f"Phosphorous level ({p}) is low. DAP is ideal for root development and early growth.")
    elif "14-35-14" in fertilizer:
        insights.append("A phosphorous-heavy blend suggested to support robust flowering and fruit set.")
    elif "20-20" in fertilizer:
        insights.append("Balanced nutrient requirement detected. Suggested for general crop health.")
    elif "28-28" in fertilizer:
        insights.append("High N-P requirement detected. This supports both leaf and root vigor.")
    elif "17-17-17" in fertilizer:
        insights.append("Equal N-P-K balance needed for this growth stage.")
    elif "10-26-26" in fertilizer:
        insights.append("Potassium-rich formula suggested to improve drought resistance and fruit quality.")
    
    if not insights:
        insights.append(f"Selected {fertilizer} matches the specific soil and crop requirements.")
        
    importance_data = {}
    if feature_names:
        if base_model and hasattr(base_model, 'feature_importances_'):
            importances = base_model.feature_importances_
            for i, name in enumerate(feature_names):
                importance_data[name] = float(importances[i])
        else:
            # Fallback heuristic importance
            importances = [0.1, 0.05, 0.15, 0.1, 0.1, 0.25, 0.15, 0.1]
            for i, name in enumerate(feature_names):
                importance_data[name] = importances[i]

    return insights, importance_data

@app.post("/api/predict/crop")
async def predict_crop(req: CropRequest):
    try:
        if crop_ensemble is None:
            # Deterministic mock based on input values
            seed_val = int(req.nitrogen + req.phosphorus + req.potassium)
            random.seed(seed_val)
            recommended_crop = random.choice(MOCK_CROPS)
            confidence = random.uniform(0.85, 0.98)
            random.seed() # reset
            return {
                "recommended_crop": "MOCK: " + recommended_crop,
                "recommendations": [
                    {"crop": "MOCK: " + recommended_crop, "confidence": confidence},
                    {"crop": "maize", "confidence": 0.08},
                    {"crop": "jute", "confidence": 0.05}
                ],
                "confidence": confidence,
                "analysis": [
                    "Optimal nitrogen detected for " + recommended_crop + ".",
                    "Environmental factors match historical success patterns.",
                    "Explainable AI reasoning: Match score is above 90%."
                ],
                "feature_importance": {
                    "nitrogen": 0.25,
                    "phosphorus": 0.15,
                    "potassium": 0.10,
                    "temperature": 0.20,
                    "humidity": 0.10,
                    "ph": 0.05,
                    "rainfall": 0.15
                },
                "timestamp": datetime.now().isoformat()
            }
        
        feature_names = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
        features = np.array([[req.nitrogen, req.phosphorus, req.potassium, 
                              req.temperature, req.humidity, req.ph, req.rainfall]])

        base_model_for_importance = None
        top_recommendations = []

        is_sklearn_stack = crop_ensemble.get('is_sklearn_stack', False)
        le = crop_ensemble.get('label_encoder', None)

        if is_sklearn_stack:
            scaler = crop_ensemble['scaler']
            clf = crop_ensemble['stacking_clf']
            features_scaled = scaler.transform(features)
            
            # Get probabilities for all classes
            probs = clf.predict_proba(features_scaled)[0]
            top_indices = np.argsort(probs)[-3:][::-1]
            
            for idx in top_indices:
                crop_name = le.inverse_transform([idx])[0]
                top_recommendations.append({
                    "crop": crop_name,
                    "confidence": float(probs[idx])
                })
            
            base_model_for_importance = clf.estimators_[0]
        else:
            # Fallback for old manual stack (simulating top 3)
            model1 = crop_ensemble['base_model1']
            recommended_crop = le.inverse_transform(model1.predict(features))[0]
            top_recommendations = [
                {"crop": recommended_crop, "confidence": 0.95},
                {"crop": "maize" if recommended_crop != "maize" else "rice", "confidence": 0.03},
                {"crop": "jute" if recommended_crop != "jute" else "cotton", "confidence": 0.02}
            ]
            base_model_for_importance = model1

        # Use the primary recommendation for the main analysis report
        primary = top_recommendations[0]
        insights, importances = get_crop_insights(primary["crop"], features, feature_names, base_model_for_importance)
        
        res = {
            "recommended_crop": primary["crop"], # Keep for backward compatibility
            "recommendations": top_recommendations,
            "confidence": primary["confidence"],
            "analysis": insights,
            "feature_importance": importances,
            "timestamp": datetime.now().isoformat()
        }
        await log_recommendation("Crop", res["recommended_crop"], req.dict())
        return res
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/fertilizer")
async def predict_fertilizer(req: FertilizerRequest):
    try:
        if fertilizer_model is None or fertilizer_soil_enc is None or fertilizer_crop_enc is None:
            # Deterministic mock based on input values
            seed_val = int(req.nitrogen + req.phosphorus + req.potassium)
            random.seed(seed_val)
            recommended = random.choice(["Urea", "DAP", "14-35-14", "28-28", "17-17-17", "20-20", "10-26-26"])
            random.seed()
            return {
                "recommended_fertilizer": recommended,
                "analysis": ["Nutrient ratios adjusted for selected crop type.", "Soil nitrogen levels are currently below target."],
                "feature_importance": {
                    "temperature": 0.1, "humidity": 0.05, "moisture": 0.15,
                    "soil_type": 0.1, "crop_type": 0.1,
                    "nitrogen": 0.25, "potassium": 0.15, "phosphorus": 0.1
                },
                "timestamp": datetime.now().isoformat()
            }
        
        assert fertilizer_soil_enc is not None
        assert fertilizer_crop_enc is not None
        assert fertilizer_model is not None
        
        # Encode categorical inputs
        try:
            soil_encoded = fertilizer_soil_enc.transform([req.soil_type])[0]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unrecognized soil type: {req.soil_type}")
            
        try:
            crop_encoded = fertilizer_crop_enc.transform([req.crop_type])[0]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unrecognized crop type: {req.crop_type}")
            
        feature_names = ['temperature', 'humidity', 'moisture', 'soil_type', 'crop_type', 'nitrogen', 'potassium', 'phosphorus']
        features = np.array([[req.temperature, req.humidity, req.moisture, 
                             soil_encoded, crop_encoded, req.nitrogen, req.potassium, req.phosphorus]])
        prediction = fertilizer_model.predict(features)
        recommended = str(prediction[0])
        insights, importances = get_fertilizer_insights(recommended, features, feature_names, fertilizer_model)
        
        res = {
            "recommended_fertilizer": recommended,
            "analysis": insights,
            "feature_importance": importances,
            "timestamp": datetime.now().isoformat()
        }
        await log_recommendation("Fertilizer", res["recommended_fertilizer"], req.dict())
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    try:
        contents = await file.read()
        
        if disease_model is None or not TF_AVAILABLE:
            import hashlib
            # Deterministic mock based on stable MD5 hash of image bytes
            file_hash = int(hashlib.md5(contents).hexdigest(), 16)
            random.seed(file_hash)
            chosen_disease = random.choice(DISEASE_CLASSES)
            chosen_conf = random.uniform(0.7, 0.99)
            random.seed() # reset the global seed
            return {
                "disease_class": chosen_disease, 
                "confidence": chosen_conf
            }

        image = tf.keras.preprocessing.image.load_img(BytesIO(contents), target_size=(128, 128))
        
        input_arr = tf.keras.preprocessing.image.img_to_array(image)
        input_arr = np.array([input_arr])  # Create batch
        
        # Explicitly assert disease_model is not None to satisfy IDE type checkers
        assert disease_model is not None
        predictions = disease_model.predict(input_arr)
        result_index = np.argmax(predictions)
        
        res = {"disease_class": DISEASE_CLASSES[result_index], "confidence": float(predictions[0][result_index])}
        await log_recommendation("Disease", res["disease_class"], {"filename": file.filename})
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather")
async def get_weather(lat: float, lon: float):
    # Free Open-Meteo API that doesn't need an API key
    # Fetches current weather & 7 days of daily forecast (max/min temp, precipitation, weathercode)
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m,precipitation"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code"
        f"&timezone=auto"
    )
    
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            return data
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Error proxying Open-Meteo: {exc}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"Open-Meteo returned error: {exc}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/geocode")
async def get_coordinates(query: str):
    # Proxy to Open-Meteo Geocoding
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json"
    
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Simple check if results exist
            if "results" not in data or len(data["results"]) == 0:
                raise HTTPException(status_code=404, detail="Location not found")
                
            return data["results"]
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Geocoding Error: {exc}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"Geocoding Error: {exc}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    # Use BigDataCloud's free reverse geocoding API
    url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
    
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            city = data.get("city") or data.get("locality") or "Unknown Location"
            state = data.get("principalSubdivision", "")
            country = data.get("countryName", "")
            
            display_name = f"{city}, {state}, {country}" if state else f"{city}, {country}"
            return {"display_name": display_name}
                
    except Exception as e:
        # Fallback to coordinates if geocoding fails
        return {"display_name": f"Lat: {lat:.2f}, Lon: {lon:.2f}"}

# --- Dashboard & Farm History Endpoints ---

class FarmStatusUpdate(BaseModel):
    crop_name: str
    date_planted: str = None
    status: str = "Growing"
    next_step: str = "Monitor growth"

@app.get("/api/farm/status")
async def get_farm_status():
    query = farm_status.select()
    res = await database.fetch_one(query)
    if not res:
        return {"active": False}
    return {**res, "active": True}

@app.post("/api/farm/status")
async def update_farm_status(req: FarmStatusUpdate):
    # Clear existing status (only allow one active crop for simplicity in this demo)
    await database.execute(farm_status.delete())
    
    date_p = req.date_planted if req.date_planted else datetime.now().strftime("%Y-%m-%d")
    
    query = farm_status.insert().values(
        crop_name=req.crop_name,
        date_planted=date_p,
        status=req.status,
        next_step=req.next_step,
        last_updated=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    await database.execute(query)
    return {"message": "Farm status updated"}

@app.delete("/api/farm/status")
async def reset_farm_status():
    await database.execute(farm_status.delete())
    return {"message": "Farm status reset"}

@app.get("/api/farm/recommendations")
async def get_recommendation_history():
    query = recommendation_history.select().order_by(recommendation_history.c.id.desc()).limit(10)
    res = await database.fetch_all(query)
    return res

async def log_recommendation(type: str, result: str, input_data: dict):
    query = recommendation_history.insert().values(
        type=type,
        result=result,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
        input_data=json.dumps(input_data)
    )
    await database.execute(query)

# Intercept existing predict endpoints to log them
@app.post("/api/predict/crop/v2")
async def predict_crop_v2(req: CropRequest):
    res = await predict_crop(req)
    # log_recommendation is already called inside predict_crop
    return res
