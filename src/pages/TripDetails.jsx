import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { 
    doc,
    getDoc, 
    addDoc, 
    collection,
    query,
    where,
    getDocs,
 } from "firebase/firestore";

function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);

  const [day, setDay] = useState("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [activities, setActivities] = useState([]);

  const fetchTrip = async () => {
    try {
      const docRef = doc(db, "trips", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTrip({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such trip found");
      }
    } catch (error) {
      console.log("Error fetching trip:", error);
    }
  };

  const fetchActivities = async () => {
    try {
        const q = query(collection(db, "activities"), where("tripId", "==", id));
        const snapshot = await getDocs(q);

        const activitiesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setActivities(activitiesData);
    } catch (error) {
        console.log("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchTrip();
    fetchActivities();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await addDoc(collection(db, "activities"), {
            tripId: id,
            day,
            title,
            time,
            notes,
            cost: Number(cost),
        });

        setDay("");
        setTitle("");
        setTime("");
        setNotes("");
        setCost("");
        await fetchActivities();

        alert("Activity added!");
    } catch (error) {
        console.log("Error adding activity:", error);
        alert(error.message);
    }  
  };

  const totalActivityCost = activities.reduce(
    (sum, activity) => sum + (activity.cost || 0),
    0
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow">
        {!trip ? (
          <p className="text-gray-600">Loading trip...</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            <p className="text-gray-600 mt-2">{trip.destination}</p>
            <p className="mt-2 text-sm">
              {trip.startDate} → {trip.endDate}
            </p>
            <p className="mt-2 font-medium">Budget: €{trip.budget}</p>
            <p className="mt-2 text-sm text-gray-700">
                Planned activity cost: €{totalActivityCost}
            </p>
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Add Activity</h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Day (example: Day 1)"
            className="border p-3 rounded-lg"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Activity title"
            className="border p-3 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="time"
            className="border p-3 rounded-lg"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <input
            type="number"
            placeholder="Estimated cost"
            className="border p-3 rounded-lg"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />

          <textarea
            placeholder="Notes"
            className="border p-3 rounded-lg md:col-span-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 md:col-span-2">
            Add Activity
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Itinerary</h2>

        {activities.length === 0 ? (
            <p className="text-gray-600">No activities yet.</p>
        ) : (
            <div className="grid gap-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4">
                        <p className="text-sm text-gray-500">{activity.day}</p>
                        <h3 className="text-xl font-semibold">{activity.title}</h3>
                        <p className="mt-1">Time: {activity.time || "Not set"}</p>
                        <p>Cost: €{activity.cost || 0}</p>
                        <p className="mt-2 text-gray-600">{activity.notes}</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default TripDetails;