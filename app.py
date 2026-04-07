import json

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from agent import agent, Context, ResponseFormat

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")


class WeatherRequest(BaseModel):
    query: str
    location: str


@app.get("/", response_class=HTMLResponse)
async def index():
    with open("static/index.html") as f:
        return f.read()


@app.post("/weather")
async def get_weather(req: WeatherRequest):
    config = {"configurable": {"thread_id": "web"}}

    async def event_stream():
        result_sent = False
        async for event in agent.astream_events(
            {"messages": [{"role": "user", "content": req.query}]},
            config=config,
            context=Context(location=req.location),
            version="v2",
        ):
            kind = event["event"]

            if kind == "on_tool_start":
                tool_name = event["name"]
                if tool_name == "get_user_location":
                    msg = "Detecting your location..."
                elif tool_name == "get_weather_for_location":
                    city = event["data"].get("input", {}).get("city", "")
                    msg = f"Fetching weather data for {city}..."
                else:
                    continue
                yield f"data: {json.dumps({'type': 'status', 'message': msg})}\n\n"

            elif kind == "on_tool_end":
                yield f"data: {json.dumps({'type': 'status', 'message': 'Generating response...'})}\n\n"

            elif kind == "on_chain_end" and not result_sent:
                output = event.get("data", {}).get("output", {})
                if isinstance(output, dict) and "structured_response" in output:
                    result: ResponseFormat = output["structured_response"]
                    result_sent = True
                    yield f"data: {json.dumps({'type': 'result', 'punny_response': result.punny_response, 'weather_conditions': result.weather_conditions})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
