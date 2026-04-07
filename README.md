# 🌤️ Weather Agent

> A conversational AI weather assistant powered by **Claude** and **LangChain** — ask about the weather in plain English and get a smart (and slightly punny) response.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1.2-green?logo=chainlink&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4.6-orange?logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

<!-- Replace the line below with your actual GIF once recorded -->
![Demo](demo.gif)

---

## Features

- **Natural language queries** — ask "What should I wear today?" or "Will it rain in Tokyo?"
- **Auto-detects your location** — no need to specify a city if you ask about your local weather
- **Structured AI responses** — Claude returns both a weather summary and a punny remark
- **Conversation memory** — the agent remembers context within a session using LangGraph checkpointing
- **Live weather data** — fetches real-time conditions from the free [Open-Meteo API](https://open-meteo.com/)

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Agent | [LangChain](https://www.langchain.com/) + [LangGraph](https://langchain-ai.github.io/langgraph/) |
| LLM | [Claude Sonnet 4.6](https://www.anthropic.com/) (Anthropic) |
| Backend | [FastAPI](https://fastapi.tiangolo.com/) |
| Weather data | [Open-Meteo](https://open-meteo.com/) (free, no API key needed) |
| Frontend | Vanilla HTML/CSS/JS |

---

## How It Works

```
User query
    │
    ▼
FastAPI /weather endpoint
    │
    ▼
LangChain Agent (Claude Sonnet 4.6)
    │
    ├─── get_user_location()     ← injects location from request context
    └─── get_weather_for_location(city)  ← calls Open-Meteo API
    │
    ▼
Structured response (ResponseFormat)
    ├── punny_response: string
    └── weather_conditions: string | null
```

The agent uses **LangChain's `create_agent`** with a structured output strategy (`ToolStrategy`) to guarantee a typed response schema, and **LangGraph's `InMemorySaver`** for conversation checkpointing across turns.

---

## Getting Started

### Prerequisites

- Python 3.11+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/B6sse/weather-agent.git
cd weather-agent
pip install -r requirements.txt
```

### Configuration

```bash
cp .env.example .env
```

Open `.env` and add your API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Run

```bash
uvicorn app:app --reload
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Example Queries

| Query | What the agent does |
|---|---|
| *"What's the weather like?"* | Uses `get_user_location` then fetches weather |
| *"Will it rain in London tomorrow?"* | Fetches weather directly for London |
| *"What should I wear today?"* | Combines weather data with clothing advice |

---

## License

MIT
