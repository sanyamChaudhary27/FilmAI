from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="FilmAI API")

# Setup CORS for Kanishka's frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to FilmAI API"}

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    # Logic to save to data/uploads
    return {"filename": file.filename, "status": "uploaded"}

@app.post("/edit")
async def edit_video(prompt: str, video_id: str):
    # Logic to trigger agents and processors
    return {"task_id": "123", "status": "processing"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
