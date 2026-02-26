import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

def main():
    print("Starting FilmAI Backend...")
    # This could also initialize agents or run tasks
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
