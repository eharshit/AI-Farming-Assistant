"""
Intent parser for the Krishi Mitra chatbot.
Defines the system prompt and Gemini function-calling tool schemas.
"""


def build_system_prompt(knowledge_context: str) -> str:
    """Build the full system instruction for the Gemini model."""
    return f"""You are Krishi Mitra AI Assistant, a friendly and knowledgeable farming expert \
built into the Krishi Mitra precision agriculture platform.

## Your Capabilities
You can help farmers with:
1. **Crop Recommendation** — Suggest the best crop based on soil nutrients and weather.
2. **Plant Disease Identification** — Identify diseases from leaf images.
3. **Fertilizer Recommendation** — Suggest the right fertilizer for a crop and soil.
4. **Price Prediction** — Forecast commodity market prices for the next 6 months.
5. **Weather Forecast** — Provide real-time weather data for any location.
6. **General Farming Knowledge** — Answer questions about diseases, farming practices, \
and how to use the Krishi Mitra platform.

## STRICT SCOPE — Farming Only
- You MUST ONLY answer questions related to farming, agriculture, crops, soil, \
weather for farming, plant diseases, fertilizers, market prices for crops, and \
the Krishi Mitra platform itself.
- If a user asks about ANYTHING unrelated to farming or agriculture (e.g., coding, \
math, entertainment, politics, personal advice, recipes, etc.), politely decline \
with: "I'm Krishi Mitra AI, specialized in agriculture and farming. I can help you \
with crop recommendations, disease identification, fertilizer advice, weather \
forecasts, and market prices. How can I assist with your farming needs?"
- Do NOT engage with off-topic follow-ups. Always redirect to farming.

## Behavior Rules
- Always be helpful, concise, and farmer-friendly. Avoid overly technical jargon.
- Keep responses short and to the point — avoid lengthy paragraphs.
- When a user asks for a prediction or recommendation, use the appropriate tool.
- **Never guess or fabricate parameter values.** If required inputs are missing, \
  ask the user to provide them. List exactly which values you still need.
- When an image is provided alongside a message, use the identify_disease tool to \
  analyze it for plant diseases.
- If the user asks a general question about diseases, models, or the platform, \
  answer directly from the knowledge base below — do NOT call a tool.
- After providing a result, suggest a logical next step \
  (e.g., after crop recommendation → suggest checking fertilizer or weather).
- Keep conversation context: if the user says "what about rice instead?", \
  understand they're referring to the previous recommendation topic.
- If a tool call fails, explain the error clearly and suggest what the user can fix.
- Respond in the same language the user writes in when possible.

## Knowledge Base
{knowledge_context}
"""


# Tool schemas for Gemini function calling (OpenAPI-style dicts)
TOOL_DECLARATIONS = [
    {
        "function_declarations": [
            {
                "name": "predict_crop",
                "description": (
                    "Recommend the best crop to grow based on soil nutrients "
                    "and environmental conditions. Call this when the user wants "
                    "to know which crop to plant."
                ),
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "nitrogen": {
                            "type": "NUMBER",
                            "description": "Ratio of Nitrogen content in soil (0-140)"
                        },
                        "phosphorus": {
                            "type": "NUMBER",
                            "description": "Ratio of Phosphorus content in soil (0-145)"
                        },
                        "potassium": {
                            "type": "NUMBER",
                            "description": "Ratio of Potassium content in soil (0-205)"
                        },
                        "temperature": {
                            "type": "NUMBER",
                            "description": "Temperature in degrees Celsius"
                        },
                        "humidity": {
                            "type": "NUMBER",
                            "description": "Relative humidity in percentage"
                        },
                        "ph": {
                            "type": "NUMBER",
                            "description": "Soil pH level (0-14)"
                        },
                        "rainfall": {
                            "type": "NUMBER",
                            "description": "Rainfall in millimeters"
                        }
                    },
                    "required": [
                        "nitrogen", "phosphorus", "potassium",
                        "temperature", "humidity", "ph", "rainfall"
                    ]
                }
            },
            {
                "name": "predict_fertilizer",
                "description": (
                    "Recommend the best fertilizer for a given crop and soil "
                    "combination. Call this when the user wants fertilizer advice."
                ),
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "temperature": {
                            "type": "NUMBER",
                            "description": "Ambient temperature in Celsius"
                        },
                        "humidity": {
                            "type": "NUMBER",
                            "description": "Relative humidity percentage"
                        },
                        "moisture": {
                            "type": "NUMBER",
                            "description": "Soil moisture level"
                        },
                        "soil_type": {
                            "type": "STRING",
                            "description": "Type of soil: Sandy, Loamy, Black, Red, or Clayey"
                        },
                        "crop_type": {
                            "type": "STRING",
                            "description": (
                                "Type of crop: Maize, Sugarcane, Cotton, Tobacco, "
                                "Paddy, Wheat, Millets, Oil seeds, Pulses, or Ground Nuts"
                            )
                        },
                        "nitrogen": {
                            "type": "NUMBER",
                            "description": "Ratio of Nitrogen content in soil"
                        },
                        "potassium": {
                            "type": "NUMBER",
                            "description": "Ratio of Potassium content in soil"
                        },
                        "phosphorus": {
                            "type": "NUMBER",
                            "description": "Ratio of Phosphorus content in soil"
                        }
                    },
                    "required": [
                        "temperature", "humidity", "moisture",
                        "soil_type", "crop_type",
                        "nitrogen", "potassium", "phosphorus"
                    ]
                }
            },
            {
                "name": "predict_price",
                "description": (
                    "Predict commodity market prices for the next 6 months. "
                    "Call this when the user asks about market prices or "
                    "price forecasts for agricultural commodities."
                ),
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "commodity_name": {
                            "type": "STRING",
                            "description": "Name of the agricultural commodity (e.g., Onion, Wheat, Tomato)"
                        },
                        "state": {
                            "type": "STRING",
                            "description": "Indian state where the market is located"
                        },
                        "district": {
                            "type": "STRING",
                            "description": "District of the market"
                        },
                        "market": {
                            "type": "STRING",
                            "description": "Specific APMC market name"
                        }
                    },
                    "required": ["commodity_name", "state", "district", "market"]
                }
            },
            {
                "name": "identify_disease",
                "description": (
                    "Identify a plant disease from an uploaded leaf image. "
                    "Call this ONLY when the user has provided an image. "
                    "Do NOT call this without an image — ask the user to upload one first."
                ),
                "parameters": {
                    "type": "OBJECT",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_weather",
                "description": (
                    "Get the current weather and 7-day forecast for a location. "
                    "Call this when the user asks about weather conditions."
                ),
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "location": {
                            "type": "STRING",
                            "description": "City or place name to get weather for (e.g., Pune, Mumbai, Delhi)"
                        }
                    },
                    "required": ["location"]
                }
            }
        ]
    }
]
