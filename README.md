# TripPlan ✈️

## 🌐 Live Demo

👉 https://tripplan-c5ay.vercel.app

---

## 📌 Overview

TripPlan is a full-stack travel planning application designed to help users organize trips, manage itineraries, track budgets, and visualize locations in one place.

You can create trips, plan daily activities, track your budget, and visualize locations on an interactive map — all with a clean and intuitive interface.

---

🎯 Purpose
This project was built to simulate a real-world application, combining frontend development, backend integration, and user-focused design.

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

## 👩‍💻 Author

Natalia Koceva

---

## 📄 License

This project is for educational and portfolio purposes.
