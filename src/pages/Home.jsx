import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Home() {
  const { darkMode } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-5xl font-bold text-blue-600">TripPlan</h1>
      <p
        className={`mt-4 text-lg max-w-2xl ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Organize your trips, plan your itinerary, and keep everything in one place.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/signup"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className={`px-6 py-3 rounded-lg border ${
            darkMode
              ? "border-gray-600 text-white hover:bg-gray-800"
              : "border-gray-300 text-gray-900 hover:bg-gray-50"
          }`}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}

export default Home;