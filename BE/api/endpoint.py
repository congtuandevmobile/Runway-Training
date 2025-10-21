from fastapi import APIRouter
from model.RNN import LSTMPredictor
from model.ROT import NeuralNetwork, predict_ensemble
import torch
import numpy as np
import pandas as pd
from pydantic import BaseModel

router = APIRouter()

# Định nghĩa request model
class PredictRequest(BaseModel):
    final_approach: float
    aircraft_type: str
    temperature: float
    time: str
    windspeed: float
    visibility: float

# Mapping dictionaries
aircraft_type_map = {
    "Heavy": 0,
    "Light": 1,
    "Medium": 2
}

time_map = {
    "Day": 0,
    "Night": 1
}

def preprocess_df(df):
    df['Aircraft-type'] = df['Aircraft-type'].map(aircraft_type_map)
    df['Time'] = df['Time'].map(time_map)  
    return df
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load checkpoint
checkpoint = torch.load("D:/Runway-Training-main/BE/checkpoint/ensemble_checkpoint.pth", map_location=device,weights_only=False)

num_models = checkpoint["num_models"]
hidden_units_list = checkpoint["hidden_units"]
input_size = checkpoint["input_size"]
scaler_rot = checkpoint["scaler"]

# Khởi tạo lại mô hình giống như lúc train và load weight
models = []
for i in range(num_models):
    model = NeuralNetwork(input_size=input_size, hidden_units=hidden_units_list[i]).to(device) 
    model.load_state_dict(checkpoint["model_states"][i])
    model.eval()
    models.append(model)

print(f"✅ Loaded ensemble with {len(models)} models")

checkpoint = torch.load("D:/Runway-Training-main/BE/checkpoint/RNN_checkpoint.pth", map_location=torch.device('cpu'),weights_only=False)
model_pro = LSTMPredictor(input_dim= checkpoint['input_dim'],hidden_dim=checkpoint['hidden_dim'],output_dim=3)
model_pro.load_state_dict(checkpoint["model_states"])
scaler_pro = checkpoint["scaler"]
model_pro.eval()
print(f"✅ Loaded RNN model")


@router.post("/predict")
async def predict(input: PredictRequest):
    print("=== Received request ===")
    try:
        # Load models và scalers (giả sử đã được load trước đó)
        # models, new_model_pro, scaler_pro, scaler_rot, device cần được khởi tạo
        
        # Tạo runway dataframe
        runway_df = pd.DataFrame({
            'Exit-location': [1750, 1950, 2086.35],
            'Exit-angle': [30, 30, 30],
        })
        
        # Tạo aircraft dataframe từ input
        aircraft_df = pd.DataFrame({
            'Final-approach': [input.final_approach],
            'Aircraft-type': [input.aircraft_type],
            'Temperature': [input.temperature],
            'Time': [input.time],
            'Windspeed': [input.windspeed],
            'Visibility': [input.visibility]
        })
        
        # Preprocess aircraft data
        aircraft_df = preprocess_df(aircraft_df)
        
        # Lấy số features
        n = len(runway_df.columns)  # 2 features từ runway
        m = len(aircraft_df.columns)  # 6 features từ aircraft
        
        # Khởi tạo mảng 3 chiều
        array_3d = np.zeros((len(aircraft_df), len(runway_df), n + m))
        
        # Điền giá trị vào mảng
        for i, plane in aircraft_df.iterrows():
            for j, runway in runway_df.iterrows():
                # Lấy đặc trưng plane
                plane_features = plane.values
                # Lấy đặc trưng runway
                runway_features = runway.values
                # Ghép đặc trưng (runway trước, plane sau)
                combined_features = np.concatenate((runway_features, plane_features))
                # Điền vào mảng
                array_3d[i, j, :] = combined_features
        
        # Reshape và normalize
        N, seq_len, M = array_3d.shape
        data_reshaped = array_3d.reshape(-1, M)  # Chuyển thành mảng 2D (N*3, M)
        
        # Chuẩn hóa dữ liệu
        data_normalized_pro = scaler_pro.transform(data_reshaped)
        data_normalized_rot = scaler_rot.transform(data_reshaped)
        print(data_normalized_pro)
        print(data_normalized_rot)
        
        # Chuyển đổi lại thành mảng 3D Nx3xM
        data_normalized_3d_pro = data_normalized_pro.reshape(N, seq_len, M)
        data_normalized_3d_rot = data_normalized_rot.reshape(N, seq_len, M)
        
        # Tạo tensors
        X_tensor_pro = torch.tensor(data_normalized_3d_pro, dtype=torch.float32).to(device)
        X_tensor_rot = torch.tensor(data_normalized_3d_rot, dtype=torch.float32).to(device)
        
        # Predict
        means, variances = predict_ensemble(models, X_tensor_rot)
        _, probabilities = model_pro(X_tensor_pro)
        
        probabilities = probabilities.cpu().detach().numpy()
        means = means.squeeze()
        
        # Tìm best index
        best_index = np.argmax(probabilities)
        
        # Chuẩn bị kết quả
        result = {
            "best_index": int(best_index + 1),  # +1 để index bắt đầu từ 1
            "best_probability": float(probabilities[0][best_index]),
            "mean_rot": float(means[best_index]),
            "all_probabilities": [float(p) for p in probabilities[0]],
            "all_means": [float(m) for m in means],
            "exit_locations": [1750, 1950, 2086.35]
        }
        
        return {
            "status": "success",
            "data": result,
            "message": f"Xác suất sử dụng lối thoát thứ {best_index+1} là: {probabilities[0][best_index]:.4f}, ROT trung bình: {means[best_index]:.2f}"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }