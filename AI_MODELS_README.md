# AgriSens AI Models Documentation

This document provides a comprehensive overview of the Artificial Intelligence models used in the AgriSens project. The platform uses two main AI modules to assist farmers: **Plant Disease Identification** and **Crop Recommendation**.

---

## 1. Plant Disease Identification Model

**Context & Objective:** 
This model is designed to identify plant diseases from images of plant leaves. It helps farmers quickly diagnose issues with their crops by simply uploading an image through the web interface.

### Model Architecture
- **Type:** Convolutional Neural Network (CNN)
- **Framework:** TensorFlow / Keras (Sequential API)
- **Structure:**
  - **Input Layer:** Processes reshaped image arrays.
  - **Convolutional & Pooling Layers:** Multiple `Conv2D` layers (with ReLU activation) followed by `MaxPooling2D` layers. These extract spatial hierarchy and features from the leaf images.
  - **Flatten Layer:** Converts the 2D feature maps to a 1D feature vector.
  - **Dense Layers:** Fully connected layers to interpret features.
  - **Dropout Layers:** Used for regularization to prevent overfitting during training.
  - **Output Layer:** `Dense` layer with `softmax` activation for multi-class classification (predicting the specific disease class).

### Training Parameters & Details
- **Optimizer:** Adam Optimizer 
- **Learning Rate:** 0.0001
- **Loss Function:** Categorical Crossentropy (used for multi-class classification)
- **Epochs:** 10
- **Model File:** Saved as a `.keras` file in the `PLANT-DISEASE-IDENTIFICATION` directory.
- **Web App:** Deployed using Streamlit (`PLANT-DISEASE-IDENTIFICATION/main.py`).

---

## 2. Crop Recommendation Models

**Context & Objective:**
This module recommends the best crop to cultivate based on soil metrics and environmental parameters. It assists in precision agriculture by maximizing yield and resource efficiency.

### Dataset Features (Inputs)
The model takes the following 7 parameters to make a prediction:
1. **N:** Ratio of Nitrogen content in soil
2. **P:** Ratio of Phosphorus content in soil
3. **K:** Ratio of Potassium content in soil
4. **Temperature:** Temperature in Celsius
5. **Humidity:** Relative humidity in percentage
6. **pH:** Soil pH level
7. **Rainfall:** Rainfall in mm

### Target Variable
- **Label:** 22 unique crop types (e.g., rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean, blackgram, lentil, pomegranate, banana, mango, grapes, watermelon, muskmelon, apple, orange, papaya, coconut, cotton, jute, coffee).

### Algorithms Evaluated & Accuracies
Several machine learning classifiers were trained and evaluated on the dataset:
- Decision Tree (Criterion = 'entropy', Max Depth = 5) - Accuracy: **~90.00%**
- Support Vector Machine (SVM) (Gamma = 'auto') - Accuracy: **~10.68%**
- Logistic Regression - Accuracy: **~95.22%**
- K-Nearest Neighbors (KNN) (n_neighbors=5, metric='minkowski', p=2) - Accuracy: **~97.50%**
- Gaussian Naive Bayes - Accuracy: **~99.09%**
- XGBoost - Accuracy: **~99.09%**
- Random Forest (n_estimators=20, random_state=5) - Accuracy: **~99.54%**

### Final Selection & Deployment
- **Selected Model:** **Stacked Ensemble Model**
- **Architecture:** 
  - **Layer 1 (Base Models):** Random Forest Classifier & Gradient Boosting Classifier
  - **Layer 2 (Meta-classifier):** Random Forest Classifier trained on the predictions of the base models.
- **Reasoning:** By utilizing ensemble learning and stacking, the model effectively captures complex patterns in the data, leading to more accurate and reliable crop recommendations.
- **Performance:** Achieved an accuracy of **~98.86%** on the test set.
- **Model File:** Saved as `stacked_crop_model.pkl` in the `Backend/models` directory.
---

## 3. Fertilizer Recommendation Model

**Context & Objective:**
This model suggests the most suitable fertilizer for a specific crop and soil combination. It helps farmers optimize nutrient application, reduce costs, and prevent soil degradation.

### Model Architecture
- **Type:** Random Forest Classifier
- **Framework:** scikit-learn
- **Configuration:** 100 decision trees (`n_estimators=100`) with a fixed `random_state` for reproducibility.

### Dataset Features (Inputs)
The model uses 8 parameters to make a recommendation:
1.  **Temperature:** Ambient temperature in Celsius.
2.  **Humidity:** Relative humidity percentage.
3.  **Moisture:** Soil moisture level.
4.  **Soil Type:** Categorical (e.g., Sandy, Loamy, Black, Red, Clayey).
5.  **Crop Type:** Categorical (e.g., Maize, Sugarcane, Cotton, Tobacco, Paddy, Wheat, Millets, Oil seeds, Pulses, Ground Nuts).
6.  **Nitrogen (N):** Ratio of Nitrogen content in soil.
7.  **Potassium (K):** Ratio of Potassium content in soil.
8.  **Phosphorous (P):** Ratio of Phosphorous content in soil.

### Output
- **Fertilizer Name:** Recommends specific fertilizers such as Urea, DAP, 14-35-14, 28-28, 17-17-17, 20-20, or 10-26-26.

### Deployment
- **Model File:** Saved as `fertilizer_model.pkl` in the `Backend/models` directory.
- **Preprocessing:** Categorical inputs (Soil and Crop types) are encoded using `LabelEncoder` objects stored as pickle files.
