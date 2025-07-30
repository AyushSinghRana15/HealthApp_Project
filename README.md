# 🧠 AI-Based Disease Prediction and Health Recommendation App

This project is a smart web-based healthcare assistant that utilizes AI to predict diseases based on symptoms, track real-time health metrics (like BMI), and interact with users through a chatbot for health-related queries. The platform is user-friendly, informative, and offers basic health suggestions to promote awareness.

---

## 🚀 Features

- 🔍 **Disease Prediction using Symptoms**
  - Users enter symptoms, and the system predicts the likely disease using an ML model trained on medical datasets.

- 📊 **Real-Time Health Monitoring**
  - Users can input height, weight, and age to calculate their **BMI** and receive personalized health advice.

- 💬 **Health Chatbot**
  - An interactive chatbot answers basic health questions using a local knowledge base or API.

- 🔐 **User Authentication**
  - Secure login/signup system integrated using **Firebase**.

- 🌐 **Modern UI**
  - Responsive and intuitive frontend built with **HTML, CSS, and JavaScript**.

---

## 🧠 Tech Stack

| Area              | Technology                 |
|-------------------|----------------------------|
| Frontend          | HTML, CSS, JavaScript      |
| Backend (API)     | Flask                      |
| Machine Learning  | Scikit-learn / Pandas      |
| Chatbot Logic     | JavaScript + Text Files    |
| User Auth         | Firebase Authentication    |
| Hosting           | Live Server (Frontend), Localhost (Backend) |

---

## 📁 Project Structure
├── App.html # Main interface
├── Monitor.html # Health tracker (BMI)
├── Feature.html # App features
├── Chatbot.html # Chatbot interface
├── App.js # Core JavaScript logic
├── App.css # Stylesheet
├── app.py # Flask backend (Disease Prediction API)
├── model.pkl # Trained ML model
├── chatbot.txt # Local text knowledge base
├── README.md # You're here!

---

## ⚙️ How to Run

### 🔹 Frontend
1. Open `App.html` with **Live Server** in VS Code.
2. Ensure all HTML pages and CSS/JS files are in the same folder.

### 🔹 Backend
1. Navigate to your project folder.
2. Run the Flask server:
   ```bash
   python app.py
http://127.0.0.1:5000

