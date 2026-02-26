# FilmAI - AI-Powered Video Editing Agent

Welcome to **FilmAI**, a state-of-the-art Video Editing Agent built for the **AMD Slingshot Hackathon**. FilmAI is designed to be a zero-cost, professional-grade video editing solution that translates natural language requests into complex editing workflows.

## 🚀 Overview

FilmAI empowers users to create professional-quality videos with simple text prompts. It uses advanced AI agents to:

- **Analyze** user requests and create an optimal editing plan.
- **Process** video and audio using cutting-edge open-source tools.
- **Enhance** content with automated professional touches like silence removal and captions.

## ✨ Features (Zero-Cost Engine)

- **Silence Removal**: Automatically detects and removes dead pauses using `Pydub` and `FFmpeg`.
- **Auto-Captions**: Generates and burns highly accurate captions locally using OpenAI's **Whisper** (Tiny model).
- **AI Thinking Agent**: Integrated with Google Gemini (Free tier) to parse creative requests like "Make it energetic" or "Professional talk".
- **Scene Detection**: Smart scene cutting using `PySceneDetect`.
- **Background Music**: Automated overlay with auto-ducking (Lowering music under speech).
- **Background Removal**: integrated MediaPipe for basic background manipulation.

## 📁 Project Structure

- `backend/`:
  - `agents/`: AI logic and `VideoAgent` implementation.
  - `api/`: FastAPI server and request handling.
  - `processors/`: Specialized engines for Video, Audio, Captions, and Vision.
  - `core/`: Global configuration, status tracking, and settings.
  - `tests/`: Integration tests for verifying the API flow.
- `frontend/`: React/Next.js application (Work in Progress).
- `docs/`: Technical documentation and API guides.

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.10+ (Tested on 3.14 with `audioop-lts`)
- **FFmpeg**: Must be available on the system.

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/sanyamChaudhary27/FilmAI.git
   cd FilmAI
   ```

2. **Create a Virtual Environment**:

   ```bash
   python -m venv myenv
   .\myenv\Scripts\activate
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r backend/requirements.txt
   ```

4. **FFmpeg Configuration**:
   The backend is configured to use the FFmpeg binary from `imageio-ffmpeg`. Ensure you run:

   ```bash
   pip install ffmpeg-downloader
   ffdl install
   ```

5. **API Key Setup**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```

## 🚦 Running the Server

Start the backend server on **port 8001**:

```bash
python backend/main.py
```

Check the API health:

- `http://localhost:8001/`

API Documentation (Swagger UI):

- `http://localhost:8001/docs`

## 👥 Team

- **Sanyam**: Backend, AI Agents, Video Processing.
- **Kanishka**: Frontend, UI/UX Design.

---

_Built with ❤️ for AMD Slingshot._
