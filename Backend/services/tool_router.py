"""
Tool router for the AgriSens chatbot.
Executes tool calls by invoking the existing internal endpoint functions
directly (no HTTP round-trip). Uses lazy imports to avoid circular dependencies.
"""

import base64
from typing import Optional


class _MockUploadFile:
    """Minimal UploadFile-compatible object for passing image data to predict_disease."""

    def __init__(self, data: bytes, filename: str = "chat_image.jpg",
                 content_type: str = "image/jpeg"):
        self.filename = filename
        self.content_type = content_type
        self._data = data

    async def read(self):
        return self._data


async def execute_tool(tool_name: str, tool_args: dict,
                       image_data: Optional[str] = None) -> dict:
    """
    Execute a tool call by routing to the corresponding internal function.

    Args:
        tool_name: Name of the tool to execute (matches intent_parser declarations).
        tool_args: Arguments extracted by Gemini from the user message.
        image_data: Optional base64-encoded image string (for disease identification).

    Returns:
        Dict with the tool's result, or an error message.
    """
    try:
        if tool_name == "predict_crop":
            return await _run_crop(tool_args)
        elif tool_name == "predict_fertilizer":
            return await _run_fertilizer(tool_args)
        elif tool_name == "predict_price":
            return await _run_price(tool_args)
        elif tool_name == "identify_disease":
            return await _run_disease(image_data)
        elif tool_name == "get_weather":
            return await _run_weather(tool_args)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        return {"error": f"Tool '{tool_name}' failed: {str(e)}"}


async def _run_crop(args: dict) -> dict:
    """Call the internal predict_crop endpoint function."""
    # Lazy import to avoid circular dependency with main.py
    from main import predict_crop, CropRequest

    req = CropRequest(
        nitrogen=float(args["nitrogen"]),
        phosphorus=float(args["phosphorus"]),
        potassium=float(args["potassium"]),
        temperature=float(args["temperature"]),
        humidity=float(args["humidity"]),
        ph=float(args["ph"]),
        rainfall=float(args["rainfall"])
    )
    return await predict_crop(req)


async def _run_fertilizer(args: dict) -> dict:
    """Call the internal predict_fertilizer endpoint function."""
    from main import predict_fertilizer, FertilizerRequest

    req = FertilizerRequest(
        temperature=float(args["temperature"]),
        humidity=float(args["humidity"]),
        moisture=float(args["moisture"]),
        soil_type=str(args["soil_type"]),
        crop_type=str(args["crop_type"]),
        nitrogen=float(args["nitrogen"]),
        potassium=float(args["potassium"]),
        phosphorus=float(args["phosphorus"])
    )
    return await predict_fertilizer(req)


async def _run_price(args: dict) -> dict:
    """Call the internal predict_price endpoint function."""
    from main import predict_price, PriceRequest

    req = PriceRequest(
        commodity_name=str(args["commodity_name"]),
        state=str(args["state"]),
        district=str(args["district"]),
        market=str(args["market"])
    )
    return await predict_price(req)


async def _run_disease(image_data: Optional[str]) -> dict:
    """Call the internal predict_disease endpoint function with the chat image."""
    if not image_data:
        return {"error": "No image was provided. Please upload a leaf image for disease identification."}

    from main import predict_disease

    # Decode base64 image and wrap in a mock UploadFile
    try:
        # Handle data URI prefix if present (e.g., "data:image/jpeg;base64,...")
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        image_bytes = base64.b64decode(image_data)
    except Exception:
        return {"error": "Invalid image data. Please provide a valid image."}

    # Detect content type from first bytes
    content_type = "image/jpeg"
    if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
        content_type = "image/png"
    elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
        content_type = "image/webp"

    mock_file = _MockUploadFile(data=image_bytes, content_type=content_type)
    return await predict_disease(file=mock_file)


async def _run_weather(args: dict) -> dict:
    """Geocode the location then call the internal weather endpoint."""
    from main import get_weather, get_coordinates

    location = str(args.get("location", ""))
    if not location:
        return {"error": "No location provided for weather lookup."}

    # Step 1: Geocode the location name to lat/lon
    try:
        geo_results = await get_coordinates(query=location)
        if not geo_results or len(geo_results) == 0:
            return {"error": f"Could not find coordinates for '{location}'."}

        lat = geo_results[0]["latitude"]
        lon = geo_results[0]["longitude"]
        place_name = geo_results[0].get("name", location)
    except Exception as e:
        return {"error": f"Geocoding failed for '{location}': {str(e)}"}

    # Step 2: Fetch weather data
    try:
        weather_data = await get_weather(lat=lat, lon=lon)
        weather_data["location_name"] = place_name
        return weather_data
    except Exception as e:
        return {"error": f"Weather fetch failed: {str(e)}"}
