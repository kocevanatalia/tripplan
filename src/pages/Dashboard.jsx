import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
} from "firebase/firestore";

function Dashboard() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [trips, setTrips] = useState([]);

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

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "trips"), {
        title,
        destination,
        startDate,
        endDate,
        budget: Number(budget),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudget("");

      await fetchTrips();

      alert("Trip created!");
    } catch (error) {
      console.log("Firebase error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create a New Trip</h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Trip title"
            className="border p-3 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Destination"
            className="border p-3 rounded-lg"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />

          <input
            type="date"
            className="border p-3 rounded-lg"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <input
            type="date"
            className="border p-3 rounded-lg"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Budget"
            className="border p-3 rounded-lg md:col-span-2"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 md:col-span-2">
            Create Trip
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Trips</h2>

        {trips.length === 0 ? (
          <p className="text-gray-600">No trips yet.</p>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white p-5 rounded-xl shadow cursor-pointer hover:shadow-lg transtition"
              onClick={() => window.location.href = `/trip/${trip.id}`}>
                <h3 className="text-xl font-semibold">{trip.title}</h3>
                <p className="text-gray-600">{trip.destination}</p>
                <p className="mt-2 text-sm">
                  {trip.startDate} → {trip.endDate}
                </p>
                <p className="mt-2 font-medium">Budget: €{trip.budget}</p>
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                    }}
                    className="text-red-500 hover:underline">
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