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
    try:
        client = genai.Client(api_key=GENAI_API_KEY, http_options={'api_version': 'v1beta'})
        print("Gemini Client Configured (v1beta)")
    except Exception as e:
        print(f"Failed to configure Gemini Client: {e}")

# Load Tarot Data
TAROT_DATA = {}
def load_tarot_data():
    global TAROT_DATA
    # Try multiple paths for flexibility (dev vs docker)
    possible_paths = [
        "tarot-images.json", # In docker backend folder
        "../frontend/public/tarot-images.json", # Local dev relative
        "public/tarot-images.json" # Fallback
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
    
    positions = ["1. The Situation / The Past", "2. The Challenge / The Present", "3. The Advice / Action", "4. The Outcome / The Future"]
    
    cards_context = ""
    for i, card in enumerate(selected_cards):
        # Extract rich details as per POC
        name = card.get("name", "Unknown")
        arcana = card.get("arcana", "Unknown")
        keywords = ", ".join(card.get("keywords", []))
        meanings_light = ", ".join(card.get("meanings", {}).get("light", []))
        meanings_shadow = ", ".join(card.get("meanings", {}).get("shadow", []))
        fortune = ", ".join(card.get("fortune_telling", []))
        
        pos = positions[i] if i < len(positions) else f"Card {i+1}"
        
        cards_context += f"""
        Position {pos}: {name} (Arcana: {arcana})
        - Keywords: {keywords}
        - Meanings (Light): {meanings_light}
        - Meanings (Shadow): {meanings_shadow}
        - Fortune Telling: {fortune}
        """

    prompt = f"""
        You are a mystical, wise, and empathetic Tarot Reader AI.
        Your task is to interpret a 4-card spread for a user based on their question.

        Here is the User's Question: "{req.question}"

        Here are the drawn cards and their meanings:
        {cards_context}

        Instructions:
        1. Analyze how each card relates to the user's question based on its position.
        2. Synthesize the meanings of all 4 cards together into a coherent narrative.
        3. Provide a direct answer or guidance relevant to the question.
        4. Use a supportive and mystical tone, but keep the advice practical.
        5. Structure your response clearly with headings using Markdown.
        6. **Answer in Thai language (ภาษาไทย) only.**
    """
    
    try:
        # Log the attempt
        print(f"Calling Gemini API with model 'gemini-3-flash-preview' for prompt length: {len(prompt)}")
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt
        )
        prediction = response.text
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Gemini Error Detailed: {error_details}")
        # Try to print response text if available in error structure (depends on SDK)
        if hasattr(e, 'response'):
             print(f"Gemini Error Response: {e.response}")
        
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
