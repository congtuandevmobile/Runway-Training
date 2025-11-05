# Backend API - Runway Training Prediction



API backend cho hệ thống dự đoán runway training sử dụng FastAPI, PyTorch và Scikit-learn.



## 📋 Yêu cầu



- Python 3.8+

- pip

- virtualenv



## 🚀 Cài đặt



1. Tạo môi trường ảo:

```bash

cd BE

python -m venv venv

```



2. Kích hoạt môi trường ảo:

```bash

# Windows

.\\venv\\Scripts\\activate



# Linux/Mac

source venv/bin/activate

```



3. Cài đặt dependencies:

```bash

pip install -r requirements.txt

```


## 📁 Cấu trúc thư mục

```

BE/

├── api/

│   ├── \_\_init\_\_.py

│   └── endpoint.py       # API endpoints

├── model/

│   ├── \_\_init\_\_.py

│   ├── RNN.py           # LSTM model

│   └── ROI.py           # Neural Network \& Ensemble

├── checkpoint/          # Model checkpoints

│   ├── ensemble\_checkpoint.pth

│   └── RNN\_checkpoint.pth

├── dataset/            # Training data

├── main.py            # FastAPI application

└── requirements.txt

```



## ▶️ Chạy Server

```bash

uvicorn main:app --reload

```



Server sẽ chạy tại: `http://127.0.0.1:8000`



## 🔌 API Endpoints



### POST `/predict`



Dự đoán runway performance dựa trên các thông số đầu vào.



**Request Body:**

```json

{

"final_approach": 150,

"aircraft_type": "Medium",

"temperature": 30,

"time": "Night",

"windspeed": 2,

"visibility": 9

}```



**Response:**

```json
{

"prediction": 0.85,

"status": "success"

}```





