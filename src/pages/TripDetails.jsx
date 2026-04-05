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
    deleteDoc,
    updateDoc,
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
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [category, setCategory] = useState("Other");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState("");

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
        if (editingActivityId) {
          await updateDoc(doc(db, "activities", editingActivityId), {
            day,
            title,
            time,
            notes,
            cost: Number(cost),
            category,
            location,
          });

          alert("Activity updated!");
        } else {
          await addDoc(collection(db, "activities"), {
            tripId: id,
            day,
            title,
            time,
            notes,
            cost: Number(cost),
            category,
            location,
          });

          alert("Activity added!");
        }

        setDay("");
        setTitle("");
        setTime("");
        setNotes("");
        setCost("");
        setEditingActivityId(null);
        setCategory("Other");
        setLocation("");

        await fetchActivities();
    } catch (error) {
        console.log("Error saving activity:", error);
        alert(error.message);
    }  
  };

  const handleEditClick = (activity) => {
    setDay(activity.day || "");
    setTitle(activity.title || "");
    setTime(activity.time || "");
    setNotes(activity.notes || "");
    setCost(activity.cost || "");
    setEditingActivityId(activity.id);
    setCategory(activity.category || "Other");
    setLocation(activity.location || "");
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteDoc(doc(db, "activities", activityId));
      await fetchActivities();
    } catch (error) {
      console.log("Error deleting activity:", error);
      alert(error.message);
    }
  };

  const totalActivityCost = activities.reduce(
    (sum, activity) => sum + (activity.cost || 0),
    0
  );

  const remainingBudget = trip ? trip.budget - totalActivityCost : 0;

  const generateTripDays = (startDate, endDate) => {
    const days = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);
    let count = 1;

    while (current <= end) {
      days.push(`Day ${count}`);
      current.setDate(current.getDate() + 1);
      count++;
    }

    return days;
  };

  const tripDays = trip ? generateTripDays(trip.startDate, trip.endDate) : [];

  const visibleActivities =
    selectedCategory === "All"
      ? activities
      : activities.filter((activity) => activity.category === selectedCategory);

  const groupedActivities = visibleActivities.reduce((groups, activity) => {
    if (!groups[activity.day]) {
      groups[activity.day] = [];
    }

    groups[activity.day].push(activity);
    return groups;
  }, {});

  Object.keys(groupedActivities).forEach((day) => {
    groupedActivities[day].sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  });

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
            <p 
              className={`mt-2 text-sm font-medium ${remainingBudget < 0 ? "text-red-500" : "text-green-600"}`}
            >
              Remaining Budget: €{remainingBudget}
            </p>
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Add Activity</h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <select
            className="border p-3 rounded-lg"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required>
              <option value="">Select a day</option>
              {tripDays.map((tripDay) => (
                <option key={tripDay} value={tripDay}>
                  {tripDay}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Activity title"
            className="border p-3 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <select 
            className="border p-3 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Food">Food</option>
            <option value="Sightseeing">Sightseeing</option>
            <option value="Transport">Transport</option>
            <option value="Accomodation">Accomodation</option>
            <option value="Other">Other</option>
          </select>

          <input 
            type="text"
            placeholder="Location"
            className="border p-3 rounded-lg"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            {editingActivityId ? "Update Activity" : "Add Activity"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Itinerary</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "Food", "Sightseeing", "Transport", "Shopping", "Accomodation", "Other"].map((cat) =>(
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg border ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {visibleActivities.length === 0 ? (
          <p className="text-gray-600">No activities yet.</p>
        ) : (
          <div className="space-y-6">
            {tripDays
              .filter((tripDay) => 
                selectedCategory === "All" ? true : groupedActivities[tripDay]?.length
              )
              .map((tripDay) => (
                <div key={tripDay}>
                <h3 className="text-xl font-bold mb-3">{tripDay}</h3>

                {groupedActivities[tripDay]?.length ? (
                  <div className="grid gap-4">
                    {groupedActivities[tripDay].map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="text-lg font-semibold">{activity.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">Category: {activity.category || "Other"}</p>
                        {activity.location ? (
                          <p className="mt-1 text-sm text-gray-500">
                            Location:{" "}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {activity.location}
                            </a>
                          </p>
                        ): (
                          <p className="mt-1 text-sm text-gray-500">Location: Not set</p>
                        )}
                        <p className="mt-1">Time: {activity.time || "Not set"}</p>
                        <p>Cost:  €{activity.cost || 0}</p>
                        <p className="mt-2 text-gray-600">{activity.notes}</p>
                        <button
                          onClick={() => handleEditClick(activity)}
                          className="mt-3 mr-4 text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="mt-3 text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No activities planned.</p>
                )}
              </div>
                
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetails;