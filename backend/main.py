import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

def main():
    print("Starting FilmAI Backend...")
    # Run from the current directory, looking into backend.api.main
    uvicorn.run("api.main:app", host="0.0.0.0", port=8001, reload=False)

if __name__ == "__main__":
    main()
