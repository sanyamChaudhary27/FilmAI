# FilmAI: Frontend Integration Guide

This document provides all the details needed for Kanishka to build the dashboard.

## Base URL

`http://localhost:8001`

## Endpoints

### 1. Root / Health Check

- **URL**: `/`
- **Method**: `GET`
- **Response**:
  ```json
  { "message": "Welcome to FilmAI API", "status": "online" }
  ```

### 2. Upload Video

- **URL**: `/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Payload**: `file` (Video file)
- **Response**:
  ```json
  {
    "video_id": "uuid-string",
    "filename": "original_name.mp4",
    "status": "uploaded"
  }
  ```

### 3. Edit Video (Trigger Agent)

- **URL**: `/edit`
- **Method**: `POST`
- **Parameters**:
  - `prompt`: (string) "The user's editing request"
  - `video_id`: (string) The ID received from `/upload`
- **Response**:
  ```json
  {
    "task_id": "uuid-string",
    "plan": {
      "video_id": "uuid-string",
      "original_prompt": "prompt text",
      "actions": [
        {
          "action": "trim",
          "start_time": 0.0,
          "end_time": 5.0,
          "parameters": {}
        }
      ],
      "estimated_duration": 5.0
    },
    "status": "processing"
  }
  ```

### 4. Track Status (Coming Soon)

- **URL**: `/status/{video_id}`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "video_id": "uuid-string",
    "status": "processing | completed | failed",
    "progress": 45,
    "output_url": "http://localhost:8000/download/processed_uuid.mp4"
  }
  ```

## UI/UX Recommendations

- **Upload Progress**: Show a spinner or progress bar during `/upload`.
- **Thinking State**: While `/edit` is called, show an "Agent is thinking..." animation.
- **Processing State**: Once `/edit` returns, show the `plan` to the user so they see what the AI decided to do, then show a "Processing..." state.
