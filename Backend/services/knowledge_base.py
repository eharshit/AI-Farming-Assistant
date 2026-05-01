"""
Knowledge base loader for the AgriSens chatbot.
Loads farming knowledge from existing project documentation to provide
context to the LLM without calling any ML models.
"""

import os

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _read_file(path: str) -> str:
    """Safely read a text file, returning empty string if not found."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except (FileNotFoundError, OSError):
        return ""


# Static platform guide extracted from FarmingGuide.jsx content
PLATFORM_GUIDE = """
## How to Use AgriSens Platform

### Step 1: Get Crop Recommendations
- Go to the Crop Recommendation tool.
- Enter soil parameters: Nitrogen (N), Phosphorus (P), Potassium (K) levels.
- Enter environmental factors: Temperature, Humidity, pH, Rainfall.
- Click "Predict Best Crop" to get an AI-powered crop suggestion.
- Click "Start Planting" to add the crop to your Dashboard.

### Step 2: Manage Your Farm (Dashboard)
- The Dashboard is your central hub for tracking farm status.
- View active crop, planting date, and growth progress.
- Check "Next Recommended Step" for current farming actions.
- Review history of all previous AI recommendations in the Timeline.

### Step 3: AI Maintenance Tools
- **Fertilizer Recommendation:** Get tailored nutrient advice for your soil and crop.
- **Disease Identification:** Upload a photo of plant leaves to identify diseases instantly.
- **Weather Forecast:** Check real-time weather with a 7-day forecast for your location.
- **Price Prediction:** View 6-month commodity price forecasts for informed selling decisions.
"""


def load_disease_guide() -> str:
    """Load the plant disease reference from DISEASE-GUIDE.md."""
    return _read_file(os.path.join(_PROJECT_ROOT, "DISEASE-GUIDE.md"))


def load_models_info() -> str:
    """Load AI models documentation from AI_MODELS_README.md."""
    return _read_file(os.path.join(_PROJECT_ROOT, "AI_MODELS_README.md"))


def build_knowledge_context() -> str:
    """
    Build the full knowledge base context string for the system prompt.
    Called once at startup and cached.
    """
    sections = []

    models_info = load_models_info()
    if models_info:
        sections.append("=== AI MODELS DOCUMENTATION ===\n" + models_info)

    disease_guide = load_disease_guide()
    if disease_guide:
        sections.append("=== PLANT DISEASE REFERENCE GUIDE ===\n" + disease_guide)

    sections.append("=== PLATFORM USAGE GUIDE ===" + PLATFORM_GUIDE)

    return "\n\n".join(sections)
