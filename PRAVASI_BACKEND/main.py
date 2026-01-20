from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="PRAVASI AI Engine")

# This allows your React frontend (usually on port 5173 or 3000) 
# to talk to this Python backend.
# PRAVASI_BACKEND/main.py

# PRAVASI_BACKEND/main.py

origins = [
    "http://localhost:3000",
    "https://uidaihackathon.vercel.app",  # YOUR LIVE FRONTEND
    "https://uidaihackathon-lzm9.vercel.app", # BACKUP FRONTEND
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = "data/migration_master.json"

@app.get("/")
def health_check():
    return {"status": "Cyber-Command Center Online", "model": "XGBoost-V1"}

@app.get("/api/migration-data")
def get_data():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r") as f:
            return json.load(f)
    return {"error": "Migration master file not found. Run the fusion script first."}

@app.get("/api/alerts")
def get_alerts():
    # Logic to filter districts where migration_events are high
    # For now, returning a sample for your UI testing
    return [
        {
            "id": 1,
            "district": "Bangalore",
            "alert": "High Inflow Predicted",
            "recommendation": "Increase urban infrastructure capacity."
        },
        {
            "id": 2,
            "district": "Rural District X",
            "alert": "Child Migration Spike",
            "recommendation": "Check school enrollment for ages 5-17."
        }
    ]

if __name__ == "__main__":
    import uvicorn
    # This starts the server on http://127.0.0.1:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)