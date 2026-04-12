import { useEffect, useState } from "react";
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

function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [trips, setTrips] = useState([]);
  const [editingTripId, setEditingTripId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const cardClass = darkMode
    ? "bg-gray-800 text-white"
    : "bg-white text-gray-900";

  const inputClass = darkMode
    ? "border p-3 rounded-lg bg-gray-700 text-white border-gray-600 placeholder-gray-300"
    : "border p-3 rounded-lg bg-white text-gray-900 border-gray-300";

  const secondaryTextClass = darkMode ? "text-gray-300" : "text-gray-600";

  const fetchTrips = async () => {
    const q = query(collection(db, "trips"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    const tripsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTrips(tripsData);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, "trips", tripId));
      await fetchTrips();
    } catch (error) {
      console.log("Error deleting trip:", error);
      alert(error.message);
    }
  };

  const handleEditTrip = (trip) => {
    setTitle(trip.title || "");
    setDestination(trip.destination || "");
    setStartDate(trip.startDate || "");
    setEndDate(trip.endDate || "");
    setBudget(trip.budget || "");
    setEditingTripId(trip.id);
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTripId) {
        await updateDoc(doc(db, "trips", editingTripId), {
          title,
          destination,
          startDate,
          endDate,
          budget: Number(budget),
        });

        alert("Trip updated!");
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

        alert("Trip created!");
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
      alert(error.message);
    }
  };

  const filteredTrips = trips.filter((trip) =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-xl shadow max-w-3xl mx-auto ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-4">
          {editingTripId ? "Edit Trip" : "Create a New Trip"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Trip title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Destination"
            className={inputClass}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />

          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <input
            type="date"
            className={inputClass}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Budget"
            className={`${inputClass} md:col-span-2`}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 md:col-span-2">
            {editingTripId ? "Update Trip" : "Create Trip"}
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold">Your Trips</h2>

          <input
            type="text"
            placeholder="Search by title or destination"
            className={`p-3 rounded-lg w-full md:w-80 border ${
              darkMode
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-300"
                : "bg-white text-gray-900 border-gray-300"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredTrips.length === 0 ? (
          <p className={secondaryTextClass}>No trips yet.</p>
        ) : (
          <div className="grid gap-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className={`p-5 rounded-xl shadow cursor-pointer transition hover:shadow-lg ${cardClass}`}
                onClick={() => (window.location.href = `/trip/${trip.id}`)}
              >
                <h3 className="text-xl font-semibold">{trip.title}</h3>
                <p className={secondaryTextClass}>{trip.destination}</p>
                <p className="mt-2 text-sm">
                  {trip.startDate} → {trip.endDate}
                </p>
                <p className="mt-2 font-medium">Budget: €{trip.budget}</p>

                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTrip(trip);
                    }}
                    className="mr-4 text-blue-600 hover:underline"
                  >
                    Edit Trip
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;