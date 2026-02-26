import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from agents.thinking_agent import video_agent
from processors.video_processor import video_processor

app = FastAPI(title="FilmAI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to FilmAI API", "status": "online"}

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    video_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{video_id}.{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "video_id": video_id, 
        "filename": file.filename,
        "status": "uploaded"
    }

@app.post("/edit")
async def edit_video(prompt: str, video_id: str, background_tasks: BackgroundTasks):
    # 1. Thinking phase: Generate a plan from the prompt
    metadata = {"duration": "unknown", "format": "mp4"} # Placeholder metadata
    plan = await video_agent.generate_plan(prompt, metadata)
    plan.video_id = video_id
    
    # 2. Execution phase: Run processing in background
    background_tasks.add_task(video_processor.execute_plan, plan)
    
    return {
        "task_id": video_id,
        "plan": plan.dict(),
        "status": "processing"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
