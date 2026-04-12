import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/Toast";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const { signup } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const cardClass = darkMode
    ? "bg-gray-800 text-white"
    : "bg-white text-gray-900";

  const inputClass = darkMode
    ? "border p-3 rounded-lg bg-gray-700 text-white border-gray-600 placeholder-gray-300"
    : "border p-3 rounded-lg bg-white text-gray-900 border-gray-300";

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [successMessage]);

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
    <div className="max-w-md mx-auto">
      <Toast message={successMessage} type={toastType} />

      <div className={`p-6 rounded-xl shadow ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
            Sign Up
          </button>
        </form>

        <p className={`mt-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;