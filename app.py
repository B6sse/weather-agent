from fastapi import FastAPI
from fastapi.responses import HTMLResponse
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
    response = agent.invoke(
        {"messages": [{"role": "user", "content": req.query}]},
        config=config,
        context=Context(location=req.location),
    )
    result: ResponseFormat = response["structured_response"]
    return {
        "punny_response": result.punny_response,
        "weather_conditions": result.weather_conditions,
    }
