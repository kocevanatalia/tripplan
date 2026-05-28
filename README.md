# TripPlan ✈️

## 🌐 Live Demo

👉 https://tripplan-c5ay.vercel.app

---

## 📸 Screenshots

#Homepage - Light & Dark Mode
<img width="1470" height="919" alt="homepage-light" src="https://github.com/user-attachments/assets/3f6e7b54-cb40-4edb-8f52-273ba7541648" />
<img width="1470" height="919" alt="homepage-dark" src="https://github.com/user-attachments/assets/75ac7dc2-de6a-4ad7-a8f1-a99ee89735da" />



#Trip Dashboard
<img width="1470" height="919" alt="dashboard" src="https://github.com/user-attachments/assets/0d8544f8-8165-4906-81f0-bf810c939145" />


#Trips
<img width="1470" height="919" alt="trip" src="https://github.com/user-attachments/assets/979a119b-4540-483e-82c2-d0b1e4e8c1fa" />
<img width="1470" height="919" alt="interactive-map" src="https://github.com/user-attachments/assets/3d882f9f-2860-416a-87a2-066a3ce67d17" />






---

## 📌 Overview

TripPlan is a full-stack travel planning web application that helps users organize trips, manage itineraries, track budgets, and visualize destinations through an interactive map interface.

---

🎯 Purpose
The project was developed using modern AI-assisted development workflows for debugging, iteration, and feature development.

---

## ✨ Features

* 🧳 Create and manage trips
* 📅 Plan activities by day
* 📍 Add locations with direct Google Maps access
* 🗺️ Interactive map with multiple markers
* 💰 Budget tracking and cost calculation
* 🌦️ Weather information for trip destinations
* 🔍 Search and filter activities
* 🌙 Dark mode with persistent settings
* 🔔 Toast notifications for actions and errors

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS
* **Backend / Database:** Firebase Firestore
* **Authentication:** Firebase Auth
* **Maps:** Leaflet + OpenStreetMap
* **Weather API:** OpenWeatherMap
* **Deployment:** Vercel
* **Architecture:** Component-based frontend with modular structure

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kocevanatalia/tripplan.git
cd tripplan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

### 4. Run the app locally

```bash
npm run dev
```

---

## 📁 Project Structure

```
src/
  components/
  context/
  pages/
  firebase/
```

---

## 🔐 Notes

* Firebase configuration is required for authentication and database access
* Make sure your Firestore rules allow authenticated users to read/write their own data

---

## 🎯 Future Improvements

* Share trips with other users
* Export itinerary (PDF or image)
* Drag & drop activity ordering
* Improved UI/UX and animations

---

## 📚 Key Learning Outcomes

- Building scalable React component structures
- Managing authentication and cloud databases with Firebase
- Integrating third-party APIs into production-ready applications
- Designing responsive user interfaces
- Deploying full-stack applications using Vercel

---

## 👩‍💻 Author

Natalia Koceva

---

## 📄 License

This project is for educational and portfolio purposes.
