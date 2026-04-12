# 🌍 TripPlan — Smart Travel Planner

TripPlan is a full-stack web application that helps users plan and organize their trips in one place.
Users can create trips, manage itineraries day by day, track expenses, and explore locations with integrated maps and weather data.

---

## ✨ Features

### 🔐 Authentication

* User signup and login (Firebase Authentication)
* Protected routes for private pages

### ✈️ Trip Management

* Create, edit, and delete trips
* Track destination, dates, and budget
* Search trips by title or destination

### 📅 Itinerary Planning

* Automatically generated trip days
* Add activities per day
* Edit and delete activities
* Activities grouped by day
* Activities sorted by time

### 🏷️ Categories & Filters

* Assign categories (Food, Sightseeing, Transport, etc.)
* Filter activities by category

### 💰 Budget Tracking

* Track total activity cost
* View remaining budget
* Visual warning when exceeding budget

### 📍 Locations & Maps

* Add location to each activity
* Open locations in Google Maps
* View all trip locations in one section
* Embedded map preview

### 🌤️ Weather Integration

* Fetch real-time weather for trip destination
* Display temperature and conditions

### 🌙 Dark Mode

* Toggle between light and dark mode

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router

### Backend / Services

* Firebase Authentication
* Firebase Firestore

### APIs

* OpenWeather API
* Google Maps (via links & embed)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/tripplan.git
cd tripplan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

### 4. Run the app

```bash
npm run dev
```

---

## 📌 Future Improvements

* Persist dark mode using localStorage
* Add map with multiple markers
* Show weather for trip dates (forecast)
* Share trips with other users
* Improve UI/UX design

---

## 📷 Screenshots

(Add screenshots here later)

---

## 👩‍💻 Author

Natalia Koceva
