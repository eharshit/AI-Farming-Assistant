# Krishi Mitra Chatbot Documentation

This document outlines the architecture, rules, and integration details of the AI-powered chatbot implemented in the Krishi Mitra project.

## Architecture Overview

The Krishi Mitra chatbot is designed as an additive feature. It acts as an intelligent orchestration layer over the existing machine learning endpoints, ensuring zero disruption to the original API structure.

The architecture is composed of the following core components:

1. **Frontend (`ChatWidget.jsx`)**: A React-based floating overlay that handles user input, image uploads, Server-Sent Events (SSE) streaming for real-time responses, and session history management.
2. **Backend Entrypoint (`main.py`)**: Two new, purely additive endpoints (`/api/chat` and `/api/chat/stream`) route requests into the chat service without modifying any existing logic.
3. **Chat Service (`services/chat_service.py`)**: The central orchestrator. It manages the conversation history, interfaces with the Gemini API, and handles the multi-turn tool-calling loop.
4. **Intent Parser & Tools (`services/intent_parser.py`)**: Defines the system prompt (the chatbot's "brain" and rules) and declares the OpenAPI-style schemas for the five available tools (Crop, Fertilizer, Disease, Price, Weather).
5. **Tool Router (`services/tool_router.py`)**: The execution layer. When Gemini decides to call a tool, this module routes the request to the *existing* internal functions in `main.py` using lazy imports, avoiding HTTP round-trips.
6. **Knowledge Base (`services/knowledge_base.py`)**: Reads existing project markdown files (`DISEASE-GUIDE.md`, `AI_MODELS_README.md`, etc.) and injects them into the LLM context, allowing the bot to answer general farming questions without needing an ML model.

## Chatbot Rules and Constraints (The "System Prompt")

The chatbot operates under a strict set of rules defined in `intent_parser.py` to ensure it behaves as a professional, cost-effective agricultural tool.

### 1. Strict Scope: Farming Only
*   **Rule**: The bot MUST ONLY discuss agriculture, crops, soil, weather, diseases, fertilizers, market prices, and the Krishi Mitra platform.
*   **Enforcement**: If asked about coding, politics, or recipes, the bot will politely decline and steer the conversation back to farming. This prevents burning API quotas on irrelevant chats.

### 2. No Parameter Guessing
*   **Rule**: The bot must **never** guess or hallucinate parameter values for the ML tools.
*   **Enforcement**: If a user asks "What crop should I grow?" but doesn't provide soil data, the bot must ask the user for the missing values (N, P, K, temp, etc.) before calling the `predict_crop` tool.

### 3. Tool vs. Knowledge Base Routing
*   **Rule**: Use tools for specific predictions; use the knowledge base for general questions.
*   **Enforcement**: If a user asks "How do I use this site?", the bot reads from the injected markdown context. If they ask "What fertilizer for wheat?", it calls the `predict_fertilizer` tool.

### 4. Image Handling for Disease Detection
*   **Rule**: The `identify_disease` tool must only be called when an image is actively provided by the user.

### 5. Cost and History Limits
*   **Rule**: Minimize token usage on the LLM API.
*   **Enforcement**: The conversation history sent to the Gemini API is hard-capped at the last 6 messages (3 user turns, 3 bot turns).

## Frontend UI/UX Design Decisions

The frontend (`ChatWidget.jsx` and `ChatWidget.css`) was explicitly designed to avoid the "generic playful AI assistant" look, favoring a serious, functional tool aesthetic.

*   **No Emojis**: Removed all conversational emojis. Replaced with clean, professional `lucide-react` icons.
*   **Agricultural Branding**: Uses the existing Krishi Mitra color palette (deep greens, high contrast borders). The header reads simply "Krishi Mitra", matching the navbar.
*   **Action-Oriented**: Suggested prompts are phrased as actionable tasks (e.g., "Predict onion prices in Maharashtra") rather than vague questions.
*   **Clear Interaction States**: Action buttons have distinct hover and active states (background color changes, slight scale down) to feel like real tools, not just text.
*   **Message Clarity**: High contrast between user messages (dark green, white text) and bot messages (light grey/white background, dark text) to ensure readability. No "bot/user" text labels to reduce clutter.

## How to Edit in the Future

### Modifying the Bot's Personality or Rules
Edit the `build_system_prompt()` function inside `Backend/services/intent_parser.py`.

### Adding a New ML Tool
1.  **Define it**: Add a new schema dictionary to `TOOL_DECLARATIONS` in `intent_parser.py`. Give it a clear name, description, and required parameters.
2.  **Route it**: Open `Backend/services/tool_router.py`. Add an `elif tool_name == 'new_tool':` block inside `execute_tool()`.
3.  **Execute it**: Create a private helper function (e.g., `_run_new_tool`) that lazy-imports your new function from `main.py` and returns the result.
4.  **UI Suggestions (Optional)**: Update `_NEXT_ACTIONS` in `chat_service.py` so the bot suggests follow-up actions after using your new tool.

### Updating the Knowledge Base
Simply edit the source markdown files (e.g., `DISEASE-GUIDE.md`). The chatbot automatically reads these files on startup. To add a new file, update the `_DOCUMENTS` list in `Backend/services/knowledge_base.py`.

### Changing the API Key or Model
The API key is currently read from the `GEMINI_API_KEY` environment variable.
To change the model (e.g., from `gemini-2.0-flash` to a different version), update the `GEMINI_MODEL` environment variable or edit the default fallback in `services/chat_service.py`.

## API Endpoints Created

*   **`POST /api/chat`**: Standard JSON request/response endpoint. Useful for programmatic access or testing.
*   **`POST /api/chat/stream`**: Returns Server-Sent Events (SSE). This is what the React frontend uses to provide the word-by-word typing effect.
