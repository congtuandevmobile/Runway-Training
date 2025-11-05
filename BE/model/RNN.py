import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

class LSTMPredictor(nn.Module):
    def __init__(self, input_dim, hidden_dim=30, output_dim=4):
        super(LSTMPredictor, self).__init__()
        self.hidden_dim = hidden_dim

        # Lớp LSTM
        self.lstm = nn.LSTM(input_dim, hidden_dim, batch_first=True)

        # Lớp Fully Connected
        self.fc = nn.Linear(hidden_dim, output_dim)

        # Hàm Softmax sẽ được áp dụng trong loss function
        self.softmax = nn.Softmax(dim=-1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)  # lstm_out có shape (batch_size, seq_len, hidden_dim)
        lstm_out = torch.relu(lstm_out)  # Áp dụng ReLU
        output = self.fc(lstm_out)  # Lớp Fully Connected
        output = output[:, -1, :]  # Lấy output của bước cuối cùng
        score = self.softmax(output)
        return output,score  # Trả về logits (chưa áp dụng Softmax)
    
    