# 🌾 Krishi Mitra: AI-Powered Farm Management Assistant

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)

Krishi Mitra is an end-to-end, AI-backed farm management application built to empower farmers with data-driven insights. It combines predictive machine learning models with a modern, LLM-orchestrated web platform to optimize crop yield, resource utilization, and market profitability.

## ✨ Key Features

- **🚜 Live Farm Management Dashboard:** Track your crop's lifecycle (Soil Preparation to Market) with interactive milestones and contextual "Next Step" advice.
- **🌱 Crop & Fertilizer Recommendation:** Machine learning models analyze soil nutrients (N, P, K), pH, and weather conditions to suggest the optimal crop and fertilizer for maximum yield.
- **🔍 Plant Disease Identification:** Upload images of diseased leaves to our CNN model for instant diagnosis and treatment suggestions. Now includes robust Out-of-Distribution (OOD) rejection to identify and reject non-plant images and uncertain predictions.
- **📈 Market Price Prediction:** Forecast commodity modal prices up to 6 months in advance using historical APMC market data to time your market entry perfectly.
- **💬 Conversational AI Assistant:** A floating chatbot powered by Google Gemini that can orchestrate all platform tools, parse intent, read images, and answer domain-specific questions via an internal knowledge base.
- **🌙 Global Dark Mode:** A seamlessly integrated dark theme that reduces eye strain, controllable via a simple toggle.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS (for structure), Vanilla CSS (for custom styling), Lucide-React (icons).
- **Backend:** FastAPI, Python, Uvicorn.
- **Machine Learning:** TensorFlow/Keras (CNN), scikit-learn (Random Forests, Gradient Boosting), Pandas, NumPy.
- **LLM Orchestration:** Google Gemini 2.0 (`google-generativeai`).

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.12 recommended to avoid dependency conflicts)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/your-username/agrisens.git
cd agrisens
```

### 2. Backend Setup
Navigate to the `Backend` directory and set up the Python environment:
```bash
cd Backend
python -m venv agrisens_env
source agrisens_env/bin/activate  # On Windows: .\agrisens_env\Scripts\activate
pip install -r ../requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the **root** of the project repository (outside the Backend folder) and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 4. Start the Application
You will need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd Backend
source agrisens_env/bin/activate  # On Windows: .\agrisens_env\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser to start farming!

## 📖 Comprehensive Documentation

For a deep-dive into the platform's architecture and the detailed performance metrics/graphs of our four Machine Learning models, please refer to our master documentation file:

👉 **[Read the Full Project Documentation](PROJECT_DOCUMENTATION.md)**

---
*Built with ❤️ for the future of agriculture.*
