import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
# 1. Định nghĩa mô hình neural network
device = "cuda" if torch.cuda.is_available() else "cpu"
class NeuralNetwork(nn.Module):
    def __init__(self, input_size, hidden_units):
        super(NeuralNetwork, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_units)
        self.gelu = nn.GELU()  # Activation function
        self.fc2 = nn.Linear(hidden_units, hidden_units)  # Output layer for regression
        self.fc3 = nn.Linear(hidden_units, 1)  # Output layer for regression

    def forward(self, x):
        x = self.fc1(x)
        x = self.gelu(x)
        x = self.fc2(x)
        x = self.gelu(x)
        x = self.fc3(x)
        return x

def predict_ensemble(models, X_test):
    X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
    X_test_tensor = X_test_tensor.to(device)
    predictions = []
    with torch.no_grad():
        for model in models:
            predictions.append(model(X_test_tensor).cpu().numpy())
    # Trung bình kết quả từ tất cả các mô hình con
    return np.mean(predictions, axis=0),np.var(np.array(predictions),axis=0,ddof=1)