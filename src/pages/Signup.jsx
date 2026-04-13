import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/Toast";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const { signup, user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const pageClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white"
    : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-900";

  const cardClass = darkMode
    ? "bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl"
    : "bg-white border border-gray-200 rounded-3xl shadow-2xl";

  const inputClass = darkMode
    ? "w-full border p-3 rounded-xl bg-gray-800 text-white border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full border p-3 rounded-xl bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const secondaryBtn = darkMode
    ? "px-5 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
    : "px-5 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition";

  const primaryBtn =
    "w-full px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm font-medium";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setToastType("error");
      setSuccessMessage("Failed to create account");
    }
  };

  return (
    <div className={pageClass}>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <span>🌍</span>
              Start planning with TripPlan
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Create your account and start building your next adventure
            </h1>

            <p className="text-lg opacity-80 max-w-xl mb-8">
              Save trips, organize activities by day, manage costs, and keep
              your travel plans in one easy place.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div
                className={
                  darkMode
                    ? "rounded-2xl p-4 bg-white/10 border border-white/10"
                    : "rounded-2xl p-4 bg-white/80 border border-white shadow-md"
                }
              >
                <div className="text-2xl mb-2">🗓️</div>
                <h3 className="font-semibold mb-1">Plan smarter</h3>
                <p className="text-sm opacity-75">
                  Organize each day more clearly.
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-2xl p-4 bg-white/10 border border-white/10"
                    : "rounded-2xl p-4 bg-white/80 border border-white shadow-md"
                }
              >
                <div className="text-2xl mb-2">🌤️</div>
                <h3 className="font-semibold mb-1">Check weather</h3>
                <p className="text-sm opacity-75">
                  Keep destination info in view.
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-2xl p-4 bg-white/10 border border-white/10"
                    : "rounded-2xl p-4 bg-white/80 border border-white shadow-md"
                }
              >
                <div className="text-2xl mb-2">🗺️</div>
                <h3 className="font-semibold mb-1">Save places</h3>
                <p className="text-sm opacity-75">
                  Track locations and activities.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-8 md:p-10 ${cardClass}`}>
            <div className="mb-8">
              <p className="text-sm opacity-70 mb-2">Create your account</p>
              <h2 className="text-3xl font-bold mb-2">Sign Up</h2>
              <p className="opacity-75">
                Set up your account and start planning.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm mb-2 opacity-70">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <button type="submit" className={primaryBtn}>
                Sign Up
              </button>
            </form>

            <div className="mt-6 text-sm opacity-80">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Log in
              </Link>
            </div>

            <div className="mt-4">
              <Link to="/" className={secondaryBtn}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <Toast
          message={successMessage}
          type={toastType}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
}

export default Signup;