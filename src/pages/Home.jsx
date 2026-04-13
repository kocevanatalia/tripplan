import { Link, Navigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const pageClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white"
    : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-900";

  const cardClass = darkMode
    ? "bg-white/10 border border-white/10"
    : "bg-white/80 border border-white shadow-md";

  const secondaryBtn = darkMode
    ? "px-6 py-3 rounded-2xl border border-gray-600 bg-gray-800 hover:bg-gray-700 transition"
    : "px-6 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-100 transition";

  const primaryBtn =
    "px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md";

  return (
    <div className={pageClass}>
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <span>🌍</span>
              Plan smarter, travel better
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Organize every trip
              <span className="block text-blue-600">in one beautiful place</span>
            </h1>

            <p className="text-lg md:text-xl opacity-80 mb-8 leading-relaxed">
              Keep your destinations, activities, weather, budget, and plans
              together so every trip feels easier to manage.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/signup" className={primaryBtn}>
                Get Started
              </Link>
              <Link to="/login" className={secondaryBtn}>
                Log In
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className={`rounded-2xl p-4 ${cardClass}`}>
                <div className="text-2xl mb-2">🗓️</div>
                <h3 className="font-semibold mb-1">Plan trips</h3>
                <p className="text-sm opacity-75">
                  Create and manage your full travel itinerary.
                </p>
              </div>

              <div className={`rounded-2xl p-4 ${cardClass}`}>
                <div className="text-2xl mb-2">💸</div>
                <h3 className="font-semibold mb-1">Track budget</h3>
                <p className="text-sm opacity-75">
                  Keep your trip costs clear and organized.
                </p>
              </div>

              <div className={`rounded-2xl p-4 ${cardClass}`}>
                <div className="text-2xl mb-2">📍</div>
                <h3 className="font-semibold mb-1">Save locations</h3>
                <p className="text-sm opacity-75">
                  View places and activities more easily on the map.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              className={`rounded-3xl p-6 md:p-8 shadow-2xl ${
                darkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-70">Upcoming Trip</p>
                  <h2 className="text-2xl font-bold">Seoul Adventure</h2>
                </div>
                <div className="text-3xl">✈️</div>
              </div>

              <div className="space-y-4">
                <div
                  className={`rounded-2xl p-4 ${
                    darkMode ? "bg-gray-800" : "bg-blue-50"
                  }`}
                >
                  <p className="text-sm opacity-70">Dates</p>
                  <p className="font-semibold">October 12 – October 18</p>
                </div>

                <div
                  className={`rounded-2xl p-4 ${
                    darkMode ? "bg-gray-800" : "bg-cyan-50"
                  }`}
                >
                  <p className="text-sm opacity-70">Planned Activities</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>• Visit Gyeongbokgung Palace</li>
                    <li>• Explore Hongdae cafes</li>
                    <li>• Han River evening walk</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`rounded-2xl p-4 ${
                      darkMode ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <p className="text-sm opacity-70">Budget</p>
                    <p className="font-bold text-lg">€850</p>
                  </div>

                  <div
                    className={`rounded-2xl p-4 ${
                      darkMode ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <p className="text-sm opacity-70">Weather</p>
                    <p className="font-bold text-lg">21°C ☀️</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-4 text-5xl opacity-80">
              🌤️
            </div>
            <div className="absolute -bottom-6 -left-4 text-5xl opacity-80">
              🧳
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;