from dataclasses import dataclass

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain.chat_models import init_chat_model
from langchain.tools import tool, ToolRuntime
from langgraph.checkpoint.memory import InMemorySaver

load_dotenv()

SYSTEM_PROMPT = """You are an expert weather forecaster, who adds a few funny puns to the weather report (though not too many).

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.

Do not use markdown formatting in your responses. Write in plain text only."""


@tool
def get_weather_for_location(city: str) -> str:
    """Get current weather for a given city."""
    import requests

    geo = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=10,
    ).json()

    if not geo.get("results"):
        return f"Could not find location: {city}"

    loc = geo["results"][0]
    weather = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "current": "temperature_2m,weathercode,windspeed_10m",
            "temperature_unit": "celsius",
        },
        timeout=10,
    ).json()

    current = weather["current"]
    temp = current["temperature_2m"]
    wind = current["windspeed_10m"]
    code = current["weathercode"]

    weather_descriptions = {
        0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
        45: "foggy", 48: "icy fog", 51: "light drizzle", 53: "moderate drizzle",
        61: "light rain", 63: "moderate rain", 65: "heavy rain",
        71: "light snow", 73: "moderate snow", 75: "heavy snow",
        80: "light showers", 81: "moderate showers", 82: "heavy showers",
        95: "thunderstorm",
    }
    description = weather_descriptions.get(code, f"weather code {code}")

    return f"{loc['name']}: {temp}°C, {description}, wind {wind} km/h"

@dataclass
class Context:
    """Custom runtime context schema."""
    location: str

@tool
def get_user_location(runtime: ToolRuntime[Context]) -> str:
    """Retrieve the user's current location."""
    return runtime.context.location

model = init_chat_model(
    "claude-sonnet-4-6",
    temperature=0.5,
    timeout=10,
    max_tokens=1000
)

# We use a dataclass here, but Pydantic models are also supported.
@dataclass
class ResponseFormat:
    """Response schema for the agent."""
    # A punny response (always required)
    punny_response: str
    # Any interesting information about the weather if available
    weather_conditions: str | None = None

checkpointer = InMemorySaver()

agent = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[get_user_location, get_weather_for_location],
    context_schema=Context,
    response_format=ToolStrategy(ResponseFormat),
    checkpointer=checkpointer
)
