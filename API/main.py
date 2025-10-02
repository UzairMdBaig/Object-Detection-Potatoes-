from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import onnxruntime as ort
import numpy as np
import os
import base64
import cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],          
)

onnx_model = ort.InferenceSession("model/Potato_model_best_weights.onnx")
input_name = onnx_model.get_inputs()[0].name


def preprocess_image(image):
    nparr = np.frombuffer(image, np.uint8)    
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.resize(image, (640, 640))
    raw_image = image.copy()
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.transpose(2, 0, 1)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0
    image = image.astype(np.float32)
    return image, raw_image


def preprocess_video_frame(frame):
    frame = cv2.resize(frame, (640, 640))
    image = frame.copy()
    image = image.astype(np.uint8)
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = frame.transpose(2, 0, 1)
    frame = np.expand_dims(frame, axis=0)
    frame = frame / 255.0
    frame = frame.astype(np.float32)
    return frame, image


def image_with_bounding_boxes(result, image, conf_threshold):
    for detection in result:
        x1, y1, x2, y2, confidence, _ = detection
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

        if confidence >= conf_threshold:
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 128, 0), 2)
            cv2.putText(image, f"potato: {int(confidence*100)}%",
                        (x1 + 10, max(y1 + 30, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 128, 0), 2)
    return image


@app.post("/predict_image")
async def predict_image(file: UploadFile = File(...)):
    image = await file.read()
    image, raw_image = preprocess_image(image)
    result = onnx_model.run(None, {input_name: image})
    result = result[0][0]
    raw_image = image_with_bounding_boxes(result, raw_image, 0.5)
    _, img_encoded = cv2.imencode('.jpg', raw_image)
    bb_image_b64 = base64.b64encode(img_encoded.tobytes()).decode("utf-8")
    return {"type": "image", "format": "JPEG", "data": bb_image_b64}


@app.post("/predict_video")
async def predict_video(file: UploadFile = File(...)):
    try:
        video = await file.read()
        temp_input_video_path = "/app/temp_input_video_path.webm"
        with open(temp_input_video_path, "wb") as f:
            f.write(video)

        cap = cv2.VideoCapture(temp_input_video_path)
        fourcc = cv2.VideoWriter_fourcc(*"VP80")
        fps = cap.get(cv2.CAP_PROP_FPS)
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        temp_output_video_path = "/app/temp_output_video_path.webm"

        out = cv2.VideoWriter(temp_output_video_path, fourcc, fps, (width, height))

        while cap.isOpened():
            ref, frame = cap.read()
            if not ref:
                break
            frame, raw_image = preprocess_video_frame(frame)
            result = onnx_model.run(None, {input_name: frame})
            result = result[0][0]   
            raw_image = image_with_bounding_boxes(result, raw_image, 0.5)
            raw_image = cv2.resize(raw_image, (width, height))
            out.write(raw_image)
        cap.release()
        out.release()
        with open(temp_output_video_path, "rb") as f:
            video_data = f.read()

        return {"type": "video", "format": "webm", "data": base64.b64encode(video_data).decode("utf-8")}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Output video not created")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
