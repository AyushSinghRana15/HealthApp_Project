from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pandas as pd
from flask_cors import CORS
from sklearn.preprocessing import MultiLabelBinarizer

# Load dataset
data = pd.read_csv('disease_symptoms.csv')

# Convert symptoms into numerical format
mlb = MultiLabelBinarizer()
X = mlb.fit_transform(data['symptoms'].apply(lambda x: x.split(',')))

# Encode target labels (diseases)
disease_labels = list(data['disease'].unique())

# Build Neural Network Model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(X.shape[1],)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(len(disease_labels), activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Convert diseases to numerical labels
y = np.array([disease_labels.index(d) for d in data['disease']])

# Train the model
model.fit(X, y, epochs=50, batch_size=8, validation_split=0.2)

# Save model
model.save("disease_prediction_model.keras")

# Load model for API
loaded_model = tf.keras.models.load_model("disease_prediction_model.keras")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Received request data:", request.data)  # Debugging

        user_data = request.get_json()
        
        # Check if JSON is None
        if user_data is None:
            return jsonify({"error": "No JSON received. Ensure you set 'Content-Type: application/json'"}), 400

        # Check if symptoms are provided
        if 'symptoms' not in user_data:
            return jsonify({"error": "Invalid input format. Expected {'symptoms': ['symptom1', 'symptom2']}"}), 400
        
        
        user_symptoms = user_data['symptoms']
        
        # Ensure symptoms exist in the dataset
        unknown_symptoms = [s for s in user_symptoms if s not in mlb.classes_]
        if unknown_symptoms:
            return jsonify({"error": f"Unknown symptoms: {unknown_symptoms}"}), 400

        input_data = mlb.transform([user_symptoms])
        prediction = loaded_model.predict(input_data)
        predicted_disease = disease_labels[np.argmax(prediction)]

        return jsonify({"predicted_disease": predicted_disease})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
