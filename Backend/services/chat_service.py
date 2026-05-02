"""
Chat service for the Krishi Mitra chatbot.
Main orchestrator that uses Gemini with function calling to provide
a unified conversational interface over the existing ML endpoints.
"""

import os
import json
import base64
import asyncio
from typing import Optional, List, AsyncGenerator

import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file (project root, two levels up from this file)
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(_PROJECT_ROOT, ".env"))

from services.knowledge_base import build_knowledge_context
from services.intent_parser import build_system_prompt, TOOL_DECLARATIONS
from services.tool_router import execute_tool

# ---------------------------------------------------------------------------
# Gemini configuration (loaded once at module import)
# ---------------------------------------------------------------------------

# Priority: env var > hardcoded demo key (replace before pushing to production)
_DEMO_API_KEY = ""  # Paste demo key here for local testing if not using .env
_GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "") or _DEMO_API_KEY
_GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

if _GEMINI_API_KEY:
    genai.configure(api_key=_GEMINI_API_KEY)
    print(f"Chat service: Gemini configured with model '{_GEMINI_MODEL_NAME}'.")
else:
    print("WARNING: GEMINI_API_KEY not set. Chat endpoint will return an error.")

# Cache the knowledge context so we only read files once
_knowledge_context: Optional[str] = None


def _get_knowledge_context() -> str:
    global _knowledge_context
    if _knowledge_context is None:
        _knowledge_context = build_knowledge_context()
    return _knowledge_context


def _build_model() -> genai.GenerativeModel:
    """Create a fresh GenerativeModel with system prompt and tools."""
    system_prompt = build_system_prompt(_get_knowledge_context())
    return genai.GenerativeModel(
        model_name=_GEMINI_MODEL_NAME,
        system_instruction=system_prompt,
        tools=TOOL_DECLARATIONS,
    )


# ---------------------------------------------------------------------------
# History conversion
# ---------------------------------------------------------------------------

def _convert_history(history: List[dict]) -> list:
    """
    Convert the API history format to Gemini Content objects.
    Input:  [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    Output: [genai.protos.Content(...)]
    """
    contents = []
    for msg in history:
        role = msg.get("role", "user")
        text = msg.get("content", "")
        if not text:
            continue
        # Gemini uses "model" instead of "assistant"
        gemini_role = "model" if role == "assistant" else "user"
        contents.append(
            genai.protos.Content(
                parts=[genai.protos.Part(text=text)],
                role=gemini_role,
            )
        )
    return contents


def _build_user_message(message: str, image_data: Optional[str] = None):
    """
    Build the current user message Content, optionally including an image.
    """
    parts = [genai.protos.Part(text=message)]

    if image_data:
        try:
            raw = image_data
            mime_type = "image/jpeg"
            # Handle data URI prefix
            if raw.startswith("data:"):
                header, raw = raw.split(",", 1)
                if "png" in header:
                    mime_type = "image/png"
                elif "webp" in header:
                    mime_type = "image/webp"

            image_bytes = base64.b64decode(raw)
            parts.append(
                genai.protos.Part(
                    inline_data=genai.protos.Blob(
                        mime_type=mime_type,
                        data=image_bytes,
                    )
                )
            )
        except Exception:
            # If image decoding fails, just proceed with text only
            pass

    return genai.protos.Content(parts=parts, role="user")


# ---------------------------------------------------------------------------
# Response metadata helpers
# ---------------------------------------------------------------------------

_NEXT_ACTIONS = {
    "predict_crop": [
        {"label": "Check fertilizer recommendation", "action": "fertilizer"},
        {"label": "View weather forecast", "action": "weather"},
    ],
    "predict_fertilizer": [
        {"label": "Check weather forecast", "action": "weather"},
        {"label": "Predict market price", "action": "price"},
    ],
    "predict_price": [
        {"label": "Get crop recommendation", "action": "crop"},
        {"label": "View weather forecast", "action": "weather"},
    ],
    "identify_disease": [
        {"label": "Get fertilizer recommendation", "action": "fertilizer"},
        {"label": "Check weather forecast", "action": "weather"},
    ],
    "get_weather": [
        {"label": "Get crop recommendation", "action": "crop"},
        {"label": "Predict market price", "action": "price"},
    ],
}

_SOURCE_MAP = {
    "predict_crop": "crop_model",
    "predict_fertilizer": "fertilizer_model",
    "predict_price": "price_model",
    "identify_disease": "disease_model",
    "get_weather": "weather_api",
}


def _build_metadata(last_tool: Optional[str]):
    """Return (sources, suggested_actions) based on the last tool called."""
    sources = []
    suggestions = []
    if last_tool:
        if last_tool in _SOURCE_MAP:
            sources.append(_SOURCE_MAP[last_tool])
        suggestions = _NEXT_ACTIONS.get(last_tool, [])
    return sources, suggestions


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Keep history minimal to save tokens on the free tier (3 user + 3 assistant turns)
MAX_HISTORY_MESSAGES = 6
# Maximum tool-call round-trips per request
MAX_TOOL_ITERATIONS = 5
# Delay between streamed word chunks (seconds) for natural typing feel
STREAM_WORD_DELAY = 0.03


# ---------------------------------------------------------------------------
# Core tool-calling loop (shared by streaming and non-streaming)
# ---------------------------------------------------------------------------

async def _run_tool_loop(model, contents, image_data):
    """
    Run the Gemini call + tool-calling loop. Returns (response, last_tool_used).
    The response will contain the final text after all tools have been resolved.
    """
    response = await model.generate_content_async(contents)
    last_tool_used = None

    for _iteration in range(MAX_TOOL_ITERATIONS):
        function_call = _extract_function_call(response)
        if function_call is None:
            break

        tool_name, tool_args = function_call
        last_tool_used = tool_name

        # Execute the tool against the internal endpoint
        tool_result = await execute_tool(tool_name, tool_args, image_data)

        # Append the model's function-call part and our function response
        contents.append(response.candidates[0].content)
        contents.append(
            genai.protos.Content(
                parts=[
                    genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=tool_name,
                            response={"result": json.dumps(tool_result, default=str)},
                        )
                    )
                ],
                role="function",
            )
        )

        # Ask Gemini to generate a natural-language response from the tool result
        response = await model.generate_content_async(contents)

    return response, last_tool_used


# ---------------------------------------------------------------------------
# Non-streaming chat (original endpoint)
# ---------------------------------------------------------------------------

async def process_chat(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[str] = None,
) -> dict:
    """
    Process a user chat message and return a complete structured response.
    """
    # Guard: no API key configured
    if not _GEMINI_API_KEY:
        return {
            "reply": (
                "The chatbot is not configured yet. "
                "Please set the GEMINI_API_KEY environment variable on the server."
            ),
            "sources": [],
            "suggested_actions": [],
        }

    if history is None:
        history = []

    model = _build_model()

    trimmed_history = history[-MAX_HISTORY_MESSAGES:]
    contents = _convert_history(trimmed_history)
    contents.append(_build_user_message(message, image_data))

    try:
        response, last_tool_used = await _run_tool_loop(model, contents, image_data)

        reply = _extract_text(response)
        if not reply:
            reply = "I wasn't able to generate a response. Could you please rephrase your question?"

        sources, suggestions = _build_metadata(last_tool_used)

        return {
            "reply": reply,
            "sources": sources,
            "suggested_actions": suggestions,
        }

    except Exception as e:
        return {
            "reply": _friendly_error(str(e)),
            "sources": [],
            "suggested_actions": [],
        }


# ---------------------------------------------------------------------------
# Streaming chat (SSE word-by-word)
# ---------------------------------------------------------------------------

async def process_chat_stream(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """
    Process a chat message and yield SSE events word-by-word.

    Event types:
        data: {"type": "token",  "content": "word "}      — a text chunk
        data: {"type": "done",   "sources": [...], "suggested_actions": [...]}
        data: {"type": "error",  "content": "..."}
        data: [DONE]                                        — stream terminator
    """
    if not _GEMINI_API_KEY:
        yield _sse({"type": "error", "content": "Chatbot not configured. Set GEMINI_API_KEY."})
        yield "data: [DONE]\n\n"
        return

    if history is None:
        history = []

    model = _build_model()

    trimmed_history = history[-MAX_HISTORY_MESSAGES:]
    contents = _convert_history(trimmed_history)
    contents.append(_build_user_message(message, image_data))

    try:
        response, last_tool_used = await _run_tool_loop(model, contents, image_data)

        reply = _extract_text(response)
        if not reply:
            reply = "I wasn't able to generate a response. Could you please rephrase your question?"

        # Stream the reply word-by-word for a natural typing effect
        words = reply.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield _sse({"type": "token", "content": chunk})
            await asyncio.sleep(STREAM_WORD_DELAY)

        # Final metadata event
        sources, suggestions = _build_metadata(last_tool_used)
        yield _sse({
            "type": "done",
            "sources": sources,
            "suggested_actions": suggestions,
        })

    except Exception as e:
        import traceback
        print(f"CHAT STREAM ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        yield _sse({"type": "error", "content": _friendly_error(str(e))})

    yield "data: [DONE]\n\n"


def _sse(data: dict) -> str:
    """Format a dict as an SSE data line."""
    return f"data: {json.dumps(data)}\n\n"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _friendly_error(error_msg: str) -> str:
    """Convert raw error messages into user-friendly text."""
    lower = error_msg.lower()
    if "quota" in lower or "rate" in lower or "429" in lower:
        return "The AI service is temporarily busy. Please try again in a moment."
    if "api_key" in lower or "auth" in lower or "403" in lower:
        return "There is an authentication issue with the AI service. Please contact the administrator."
    return f"I encountered an issue processing your request. Please try again. (Details: {error_msg})"


def _extract_function_call(response):
    """
    Extract the first function call from a Gemini response.
    Returns (name, args_dict) or None.
    """
    try:
        if not response.candidates:
            return None
        for part in response.candidates[0].content.parts:
            if hasattr(part, "function_call") and part.function_call.name:
                return part.function_call.name, dict(part.function_call.args)
    except (AttributeError, IndexError):
        pass
    return None


def _extract_text(response) -> str:
    """Extract the concatenated text from a Gemini response."""
    try:
        parts = response.candidates[0].content.parts
        texts = [p.text for p in parts if hasattr(p, "text") and p.text]
        return "\n".join(texts)
    except (AttributeError, IndexError):
        return ""
