import os
import json
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure Gemini
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
client = None
if GENAI_API_KEY:
    client = genai.Client(api_key=GENAI_API_KEY)

# Load Tarot Data
TAROT_DATA = {}
def load_tarot_data():
    global TAROT_DATA
    # Try multiple paths for flexibility (dev vs docker)
    possible_paths = [
        "public/tarot-images.json", 
        "../public/tarot-images.json",
        "tarot-images.json" # If copied to root in docker
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    TAROT_DATA = json.load(f)
                print(f"Loaded tarot data from {path}")
                return
            except Exception as e:
                print(f"Failed to load {path}: {e}")
    print("Warning: tarot-images.json not found")

load_tarot_data()

class PredictRequest(BaseModel):
    question: str
    selected_indices: Optional[List[int]] = None

@app.post("/api/predict")
async def predict(req: PredictRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    if not TAROT_DATA or "cards" not in TAROT_DATA:
         try:
             load_tarot_data()
         except:
             pass
         if not TAROT_DATA:
            raise HTTPException(status_code=500, detail="Tarot data not loaded")

    cards_info = TAROT_DATA.get("cards", [])
    total_cards = len(cards_info)

    # Select cards
    indices = req.selected_indices
    if not indices or len(indices) != 4:
        # Randomize if not provided or invalid count
        # Ensure we don't crash if deck is smaller than 4 (unlikely)
        sample_size = min(4, total_cards)
        indices = random.sample(range(total_cards), sample_size)
    
    selected_cards = []
    # Validate indices
    for idx in indices:
        if 0 <= idx < total_cards:
            selected_cards.append(cards_info[idx])
        else:
            # Fallback to random if index out of bounds
            selected_cards.append(random.choice(cards_info))

    # Construct Prompt
    # Logic from PRD:
    # Card 1: The Situation / The Past
    # Card 2: The Challenge / The Present
    # Card 3: The Advice / Action
    # Card 4: The Outcome / The Future
    
    positions = ["The Situation / The Past", "The Challenge / The Present", "The Advice / Action", "The Outcome / The Future"]
    
    cards_context = ""
    for i, card in enumerate(selected_cards):
        # Handle cases where card data might be missing fields
        name = card.get("name", "Unknown")
        meanings = card.get("meanings", {}).get("light", ["No meaning"])
        meaning_text = meanings[0] if meanings else "No meaning"
        pos = positions[i] if i < len(positions) else f"Card {i+1}"
        cards_context += f"{i+1}. {pos}: {name} ({meaning_text})\n"

    prompt = f"""
    You are a mystical Tarot Reader AI. Interpret these 4 cards based on the user's question: "{req.question}"
    
    The Cards:
    {cards_context}
    
    Provide a concise but deep interpretation in Markdown format. Address the user directly.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        prediction = response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

    # Format response
    resp_cards = []
    for i, c in enumerate(selected_cards):
        pos = positions[i] if i < len(positions) else f"Card {i+1}"
        resp_cards.append({
            "name": c.get("name"),
            "img": c.get("img"),
            "position": pos
        })

    return {"cards": resp_cards, "prediction": prediction}


# Serve Frontend
# Logic:
# 1. If 'dist' exists (built frontend), serve static from it.
# 2. If 'public' exists (dev assets), serve it too for direct access if needed.

dist_path = "../dist"
public_path = "../public"

# Mount /assets if using Vite build
if os.path.exists(os.path.join(dist_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

# Mount /cards from public if in dev, or from dist if built
# If dist exists, images should be in dist/cards (if vite copied them)
if os.path.exists(os.path.join(dist_path, "cards")):
    app.mount("/cards", StaticFiles(directory=os.path.join(dist_path, "cards")), name="cards")
elif os.path.exists(os.path.join(public_path, "cards")):
     app.mount("/cards", StaticFiles(directory=os.path.join(public_path, "cards")), name="cards-dev")

# Mount /static as requested
if os.path.exists(public_path):
    app.mount("/static", StaticFiles(directory=public_path), name="static")

@app.get("/")
async def serve_index():
    if os.path.exists(os.path.join(dist_path, "index.html")):
        return FileResponse(os.path.join(dist_path, "index.html"))
    return {"message": "Frontend not built. Please run `npm run build` or use Vite dev server."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
