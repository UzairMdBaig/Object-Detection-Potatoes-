# 🥔 Potato Detection with ONNX (Images + Videos)  
This project demonstrates an end-to-end potato detection system built with:  

- **Model:** ONNX model (`Potato_model_best_weights.onnx`) trained to detect potatoes in images and videos  
- **Backend:** FastAPI serving the ONNX model with inference via onnxruntime and OpenCV  
- **Frontend:** React app to upload and visualize predictions (images/videos)  
- **Deployment:** Fully containerized with Docker and orchestrated using Docker Compose  

---

## 📂 Project Structure (Highlighting main folders/ files)  
```bash
.
├── API/                     # FastAPI backend
│   └── model/
│       └── Potato_model_best_weights.onnx
│   ├── Dockerfile
│   ├── main.py             # API code
│   └── requirements.txt
│
├── frontend/                # React frontend
│   ├── Dockerfile
|   ├── nginx.conf           # Reverse proxy config
│   ├── src/
│   └── App.jsx
│
├── docker-compose.yml       # Multi-service setup
|
└── README.md
```

## 🚀 Model & Preprocessing
The ONNX model expects input images resized to 640×640.

**Image preprocessing:**
- Read image, resize, convert to RGB, normalize, transpose to (1,3,640,640)
  
**Video preprocessing:**
- Decode frames, resize to 640×640, normalize, batch through ONNX model
- Bounding boxes with confidence ≥ 0.5 are drawn with OpenCV.

---

## ▶️ Running the Project ##


**1. Clone the repository**

```bash
git clone https://github.com/your-username/Object-Detection-Potatoes-.git
cd Object-Detection-Potatoes-
```


**2. Build and run with Docker Compose**

```bash
docker-compose up --build
```


**3. Access the frontend**

```bash
👉 http://localhost/80
```

---

## 🌐 API Endpoints

**POST /predict_image**

- **Input**: Image file (multipart/form-data)

- **Output**: JSON containing base64-encoded annotated image (JPEG)

**POST /predict_video**

- **Input**: Video file (multipart/form-data)

- **Output**: JSON containing base64-encoded annotated video (webm)

---

## 🛠 Tech Stack

- **Backend**: FastAPI, ONNX Runtime, OpenCV, NumPy

- **Frontend**: React, TailwindCSS, Typewriter-effect

- **Proxy**: Nginx

- **Containerization**: Docker, Docker Compose
