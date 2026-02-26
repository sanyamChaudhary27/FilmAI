import requests
import time
import os

BASE_URL = "http://localhost:8001"

def test_flow():
    print("1. Checking Health...")
    r = requests.get(f"{BASE_URL}/")
    print(r.json())

    # Create a dummy video if it doesn't exist for testing
    test_video = "test_input.mp4"
    if not os.path.exists(test_video):
        print("Creating dummy video file...")
        with open(test_video, "wb") as f:
            f.write(os.urandom(1024 * 1024)) # 1MB junk data

    print("\n2. Testing Upload...")
    with open(test_video, "rb") as f:
        r = requests.post(f"{BASE_URL}/upload", files={"file": f})
    
    try:
        upload_data = r.json()
    except Exception as e:
        print(f"Failed to decode JSON: {r.text}")
        raise e

    video_id = upload_data["video_id"]
    print(f"Uploaded: {video_id}")

    print("\n3. Testing Professional Edit (Agent thinking 'energetic' style)...")
    r = requests.post(f"{BASE_URL}/edit", params={
        "prompt": "Make this an energetic reel: remove silence and add auto captions",
        "video_id": video_id
    })
    
    try:
        edit_data = r.json()
    except Exception as e:
        print(f"Failed to decode /edit response JSON: {r.text}")
        raise e
    
    print(edit_data)

    print("\n4. Polling Status...")
    for _ in range(10):
        r = requests.get(f"{BASE_URL}/status/{video_id}")
        status_data = r.json()
        print(f"Status: {status_data['status']} - Progress: {status_data['progress']}%")
        if status_data['status'] == "completed":
            print(f"Success! Output URL: {status_data['output_url']}")
            break
        elif status_data['status'] == "failed":
            print(f"Failed: {status_data['error']}")
            break
        time.sleep(2)

if __name__ == "__main__":
    test_flow()
