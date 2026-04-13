import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { db } from "../firebase/config";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Toast from "../components/Toast";

function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [trips, setTrips] = useState([]);
  const [editingTripId, setEditingTripId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const tripFormRef = useRef(null);

  const pageClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white"
    : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-900";

  const mainCardClass = darkMode
    ? "bg-gray-900 border border-gray-800 rounded-3xl shadow-xl"
    : "bg-white border border-gray-200 rounded-3xl shadow-xl";

  const statCardClass = darkMode
    ? "bg-white/10 border border-white/10 rounded-2xl p-5"
    : "bg-white/80 border border-white rounded-2xl p-5 shadow-md";

  const inputClass = darkMode
    ? "w-full border p-3 rounded-xl bg-gray-800 text-white border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full border p-3 rounded-xl bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const secondaryBtn = darkMode
    ? "px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
    : "px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition";

  const primaryBtn =
    "px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm";

  const dangerBtn = darkMode
    ? "px-4 py-2 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/10 transition"
    : "px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition";

  const fetchTrips = async () => {
    const q = query(collection(db, "trips"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const tripsData = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    setTrips(tripsData);
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleDeleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, "trips", tripId));
      setToastType("success");
      setSuccessMessage("Trip deleted successfully!");
      await fetchTrips();
    } catch (error) {
      console.log("Error deleting trip:", error);
      setToastType("error");
      setSuccessMessage("Failed to delete trip");
    }
  };

  const handleEditTrip = (trip) => {
    setTitle(trip.title || "");
    setDestination(trip.destination || "");
    setStartDate(trip.startDate || "");
    setEndDate(trip.endDate || "");
    setBudget(trip.budget || "");
    setEditingTripId(trip.id);

    tripFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (endDate < startDate) {
      setToastType("error");
      setSuccessMessage("End date cannot be before start date.");
      return;
    }

    try {
      if (editingTripId) {
        await updateDoc(doc(db, "trips", editingTripId), {
          title,
          destination,
          startDate,
          endDate,
          budget: Number(budget),
        });
        setToastType("success");
        setSuccessMessage("Trip updated successfully!");
      } else {
        await addDoc(collection(db, "trips"), {
          title,
          destination,
          startDate,
          endDate,
          budget: Number(budget),
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        setToastType("success");
        setSuccessMessage("Trip created successfully!");
      }

      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setEditingTripId(null);

      await fetchTrips();
    } catch (error) {
      console.log("Firebase error:", error);
      setToastType("error");
      setSuccessMessage(error.message);
    }
  };

  const filteredTrips = trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudget = useMemo(() => {
    return trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);
  }, [trips]);

  const upcomingTrips = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return trips.filter((trip) => trip.startDate >= today).length;
  }, [trips]);

  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Traveler";

  return (
    <div className={pageClass}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <section className="mb-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-5">
                <span>✈️</span>
                Your travel dashboard
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Welcome back, {firstName}
              </h1>

              <p className="text-lg opacity-80 max-w-xl">
                Organize your next adventure, manage your travel budget, and
                keep all your trips in one place.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() =>
                    tripFormRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className={primaryBtn}
                >
                  + Create New Trip
                </button>
              </div>
            </div>

            <div className={`p-6 ${mainCardClass}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={statCardClass}>
                  <div className="text-2xl mb-2">🧳</div>
                  <p className="text-sm opacity-70 mb-1">Total Trips</p>
                  <p className="text-2xl font-bold">{trips.length}</p>
                </div>

                <div className={statCardClass}>
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-sm opacity-70 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingTrips}</p>
                </div>

                <div className={statCardClass}>
                  <div className="text-2xl mb-2">💸</div>
                  <p className="text-sm opacity-70 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold">€{totalBudget}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={tripFormRef} className="mb-10">
          <div className={`p-6 md:p-8 ${mainCardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-70 mb-1">Trip planner</p>
                <h2 className="text-2xl font-bold">
                  {editingTripId ? "Edit Trip" : "Create a New Trip"}
                </h2>
              </div>
              <div className="text-3xl">🌍</div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Trip title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                required
              />

              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={inputClass}
                required
              />

              <div>
                <label className="block text-sm mb-2 opacity-70">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <input
                type="number"
                placeholder="Budget (€)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={inputClass}
                min="0"
                required
              />

              <div className="flex items-end gap-3">
                <button type="submit" className={primaryBtn}>
                  {editingTripId ? "Update Trip" : "Create Trip"}
                </button>

                {editingTripId && (
                  <button
                    type="button"
                    className={secondaryBtn}
                    onClick={() => {
                      setTitle("");
                      setDestination("");
                      setStartDate("");
                      setEndDate("");
                      setBudget("");
                      setEditingTripId(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm opacity-70 mb-1">Your saved plans</p>
              <h2 className="text-2xl font-bold">Your Trips</h2>
            </div>

            <input
              type="text"
              placeholder="Search by title or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} md:max-w-sm`}
            />
          </div>

          {filteredTrips.length === 0 ? (
            <div className={`p-10 text-center ${mainCardClass}`}>
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold mb-2">No trips yet</h3>
              <p className="opacity-75 mb-6">
                Start planning your first adventure and keep everything in one
                place.
              </p>
              <button
                onClick={() =>
                  tripFormRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className={primaryBtn}
              >
                Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className={`p-6 cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${mainCardClass}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm opacity-70 mb-1">Trip</p>
                      <h3 className="text-xl font-bold break-words">
                        {trip.title}
                      </h3>
                    </div>
                    <div className="text-2xl">✈️</div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm opacity-70">Destination</p>
                      <p className="font-medium">{trip.destination}</p>
                    </div>

                    <div>
                      <p className="text-sm opacity-70">Dates</p>
                      <p className="font-medium">
                        {trip.startDate} → {trip.endDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm opacity-70">Budget</p>
                      <p className="font-semibold text-lg">€{trip.budget}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTrip(trip);
                      }}
                      className={secondaryBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                      className={dangerBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {successMessage && (
          <Toast
            message={successMessage}
            type={toastType}
            onClose={() => setSuccessMessage("")}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;