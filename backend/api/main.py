import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.status import task_store, TaskStatus
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
    
    # Initialize status
    task_store[video_id] = TaskStatus(
        video_id=video_id,
        status="uploaded",
        progress=0
    )
        
    return {
        "video_id": video_id, 
        "filename": file.filename,
        "status": "uploaded"
    }

@app.get("/status/{video_id}")
async def get_status(video_id: str):
    if video_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_store[video_id]

@app.get("/uploads/{video_id}")
async def get_upload(video_id: str):
    # Find the file in settings.UPLOAD_DIR with the given video_id
    if video_id not in task_store:
        raise HTTPException(status_code=404, detail="Video not found")
        
    # Search for the file extension
    for ext in ["mp4", "mov", "avi", "mkv"]:
        file_path = os.path.join(settings.UPLOAD_DIR, f"{video_id}.{ext}")
        if os.path.exists(file_path):
            return FileResponse(file_path)
            
    raise HTTPException(status_code=404, detail="Video file not found on disk")

@app.get("/download/{filename}")
async def download_video(filename: str):
    output_dir = os.path.join(os.path.dirname(settings.UPLOAD_DIR), "outputs")
    file_path = os.path.join(output_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="video/mp4", filename=filename)

@app.post("/edit")
async def edit_video(prompt: str, video_id: str, background_tasks: BackgroundTasks):
    if video_id not in task_store:
        raise HTTPException(status_code=404, detail="Video not uploaded yet")
        
    # 1. Thinking phase: Generate a plan from the prompt
    # Find the actual extension of the uploaded video
    file_extension = "mp4" # Default
    for ext in ["mp4", "mov", "avi", "mkv"]:
        if os.path.exists(os.path.join(settings.UPLOAD_DIR, f"{video_id}.{ext}")):
            file_extension = ext
            break

    metadata = {"duration": "unknown", "format": file_extension} 
    plan = await video_agent.generate_plan(prompt, metadata)
    plan.video_id = video_id
    
    task_store[video_id].status = "thinking"
    
    # Use actual extension in processing
    # Update execute_plan to use the detected extension if necessary
    # (Actually video_processor.execute_plan needs to know the extension or we update internal logic)
    
    # 2. Execution phase: Run processing in background
    background_tasks.add_task(video_processor.execute_plan, plan)
    
    return {
        "task_id": video_id,
        "plan": plan.dict(),
        "status": "processing"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
