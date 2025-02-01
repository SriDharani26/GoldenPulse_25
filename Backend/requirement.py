# api.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the trained model and label encoder
model = joblib.load("random_forest_model.pkl")
label_encoder = joblib.load("label_encoder.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    num_injured = data['num_injured']
    accident_type = data['accident_type']
    
    accident_type_encoded = label_encoder.transform([accident_type])[0]
    input_data = np.array([[num_injured, accident_type_encoded]])
    prediction = model.predict(input_data)
    
    response = {
        "Number of Ambulances": int(prediction[0][0]),
        "Number of Emergency Beds": int(prediction[0][1])
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)