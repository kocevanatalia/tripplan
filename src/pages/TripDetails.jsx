import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { useTheme } from "../context/ThemeContext";
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
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 13);
      return;
    }

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);

  return null;
}

function TripDetails() {
  const { id } = useParams();
  const { darkMode } = useTheme();

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);

  const [day, setDay] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");

  const [locationPoints, setLocationPoints] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const activityFormRef = useRef(null);

  const cardClass = darkMode
    ? "bg-gray-800 text-white"
    : "bg-white text-gray-900";

  const inputClass = darkMode
    ? "border p-3 rounded-lg bg-gray-700 text-white border-gray-600 placeholder-gray-300"
    : "border p-3 rounded-lg bg-white text-gray-900 border-gray-300";

  const secondaryTextClass = darkMode ? "text-gray-300" : "text-gray-600";
  const mutedTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const activityCardClass = darkMode
    ? "border rounded-lg p-4 bg-gray-700 border-gray-600"
    : "border rounded-lg p-4 bg-gray-50 border-gray-200";

  const fetchTrip = async () => {
    try {
      const docRef = doc(db, "trips", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const tripData = { id: docSnap.id, ...docSnap.data() };
        setTrip(tripData);
        fetchWeather(tripData.destination);
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

  const fetchWeather = async (destination) => {
    try {
      setWeatherError("");
      setWeather(null);

      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          destination
        )}&appid=${apiKey}&units=metric`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch weather data");
      }

      setWeather(data);
    } catch (error) {
      console.log("Weather error:", error);
      setWeatherError(error.message || "Weather data unavailable");
    }
  };

  useEffect(() => {
    fetchTrip();
    fetchActivities();
  }, [id]);

  const geocodeLocation = async (locationName) => {
    if (!locationName.trim()) {
      return { lat: null, lon: null };
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}`
      );

      const data = await response.json();

      if (!data.length) {
        return { lat: null, lon: null };
      }

      return {
        lat: Number(data[0].lat),
        lon: Number(data[0].lon),
      };
    } catch (error) {
      console.log("Geocoding error;", error);
      return { lat: null, lon: null };
    }
  };

  const handleEditClick = (activity) => {
    setDay(activity.day || "");
    setTitle(activity.title || "");
    setCategory(activity.category || "Other");
    setLocation(activity.location || "");
    setTime(activity.time || "");
    setNotes(activity.notes || "");
    setCost(activity.cost || "");
    setEditingActivityId(activity.id);
    activityFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setLat(activity.lat ?? null);
    setLon(activity.lon ?? null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const coordinates = await geocodeLocation(location);
      if (editingActivityId) {
        await updateDoc(doc(db, "activities", editingActivityId), {
          day,
          title,
          category,
          location,
          time,
          notes,
          cost: Number(cost),
          lat: coordinates.lat,
          lon: coordinates.lon,
        });

        alert("Activity updated!");
      } else {
        await addDoc(collection(db, "activities"), {
          tripId: id,
          day,
          title,
          category,
          location,
          time,
          notes,
          cost: Number(cost),
          lat: coordinates.lat,
          lon: coordinates.lon,
        });

        alert("Activity added!");
      }

      setDay("");
      setTitle("");
      setCategory("Other");
      setLocation("");
      setTime("");
      setNotes("");
      setCost("");
      setEditingActivityId(null);
      setLat(null);
      setLon(null);

      await fetchActivities();
    } catch (error) {
      console.log("Error saving activity:", error);
      alert(error.message);
    }
  };

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

  Object.keys(groupedActivities).forEach((dayKey) => {
    groupedActivities[dayKey].sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  });

  const totalActivityCost = activities.reduce(
    (sum, activity) => sum + (activity.cost || 0),
    0
  );

  const remainingBudget = trip ? trip.budget - totalActivityCost : 0;

  const uniqueLocations = useMemo(
    () => [
      ...new Set(
        activities
          .map((activity) => activity.location?.trim())
          .filter((loc) => loc)
      ),
    ],
    [activities]
  );

  useEffect(() => {
    const buildLocationPoints = async () => {
      if (!activities.length) {
        setLocationPoints([]);
        return;
      }

      setMapLoading(true);

      try {
        const savedPoints = [];
        const missingLocations = [];

        activities.forEach((activity) => {
          const cleanedLocation = activity.location?.trim();

          if (!cleanedLocation) return;

          if (
            typeof activity.lat === "number" &&
            typeof activity.lon === "number"
          ) {
            savedPoints.push({
              name: cleanedLocation,
              lat: activity.lat,
              lon: activity.lon,
            });
          } else {
            missingLocations.push(cleanedLocation);
          }
        });

        const uniqueSavedPoints = Array.from(
          new Map(savedPoints.map((point) => [point.name, point])).values()
        );

        const uniqueMissingLocations = [...new Set(missingLocations)].filter(
          (loc) => !uniqueSavedPoints.some((point) => point.name === loc)
        );

        const fallbackPoints = await Promise.all(
          uniqueMissingLocations.map(async (loc) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  loc
                )}`
              );
              const data = await response.json();

              if (!data.length) {
                console.log("No coordinates found for:", loc);
                return null;
              }

              return {
                name: loc,
                lat: Number(data[0].lat),
                lon: Number(data[0].lon),
              };
            } catch {
              return null;
            }
          })
        );

        setLocationPoints([
          ...uniqueSavedPoints,
          ...fallbackPoints.filter(Boolean),
        ]);
      } catch (error) {
        console.log("Map location error:", error);
        setLocationPoints([]);
      } finally {
        setMapLoading(false);
      }
    };

    buildLocationPoints();
  }, [activities]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className={`p-6 rounded-xl shadow ${cardClass}`}>
        {!trip ? (
          <p className={secondaryTextClass}>Loading trip...</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            <p className={`mt-2 ${secondaryTextClass}`}>{trip.destination}</p>
            <p className="mt-2 text-sm">
              {trip.startDate} → {trip.endDate}
            </p>
            <p className="mt-2 font-medium">Budget: €{trip.budget}</p>
            <p className={`mt-2 ${secondaryTextClass}`}>
              Planned activity cost: €{totalActivityCost}
            </p>
            <p
              className={`mt-2 font-medium ${
                remainingBudget < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              Remaining Budget: €{remainingBudget}
            </p>

            {weatherError && (
              <p className="mt-3 text-sm text-red-500">{weatherError}</p>
            )}

            {weather && (
              <div
                className={`mt-4 rounded-lg border p-4 ${
                  darkMode ? "border-gray-600 bg-gray-700" : "border-gray-200"
                }`}
              >
                <h3 className="text-lg font-semibold">Current Weather</h3>
                <p className="mt-2">
                  {weather.name}: {Math.round(weather.main.temp)}°C
                </p>
                <p className={`text-sm capitalize ${secondaryTextClass}`}>
                  {weather.weather?.[0]?.description}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div 
        ref={activityFormRef}
        className={`p-6 rounded-xl shadow ${cardClass}`}
      >
        <h2 className="text-2xl font-bold mb-4">Add Activity</h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <select
            className={inputClass}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          >
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
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Food">Food</option>
            <option value="Sightseeing">Sightseeing</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Location"
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="time"
            className={inputClass}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <input
            type="number"
            placeholder="Estimated cost"
            className={inputClass}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />

          <textarea
            placeholder="Notes"
            className={`${inputClass} md:col-span-2`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 md:col-span-2">
            {editingActivityId ? "Update Activity" : "Add Activity"}
          </button>
        </form>
      </div>

      <div className={`p-6 rounded-xl shadow ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-4">Itinerary</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "All",
            "Food",
            "Sightseeing",
            "Transport",
            "Shopping",
            "Accommodation",
            "Other",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg border ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : darkMode
                  ? "border-gray-600 text-white hover:bg-gray-700"
                  : "border-gray-300 text-gray-900 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {visibleActivities.length === 0 ? (
          <p className={secondaryTextClass}>No activities yet.</p>
        ) : (
          <div className="space-y-6">
            {tripDays
              .filter((tripDay) =>
                selectedCategory === "All"
                  ? true
                  : groupedActivities[tripDay]?.length
              )
              .map((tripDay) => (
                <div key={tripDay}>
                  <h3 className="text-xl font-bold mb-3">{tripDay}</h3>

                  {groupedActivities[tripDay]?.length ? (
                    <div className="grid gap-4">
                      {groupedActivities[tripDay].map((activity) => (
                        <div key={activity.id} className={activityCardClass}>
                          <h4 className="text-lg font-semibold">
                            {activity.title}
                          </h4>

                          <p className={`mt-1 text-sm ${mutedTextClass}`}>
                            Category: {activity.category || "Other"}
                          </p>

                          {activity.location ? (
                            <p className={`mt-1 text-sm ${mutedTextClass}`}>
                              Location:{" "}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  activity.location
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                📍 {activity.location} (open in maps)
                              </a>
                            </p>
                          ) : (
                            <p className={`mt-1 text-sm ${mutedTextClass}`}>
                              Location: Not set
                            </p>
                          )}

                          <p className="mt-1">
                            Time: {activity.time || "Not set"}
                          </p>
                          <p>Cost: €{activity.cost || 0}</p>
                          <p className={`mt-2 ${secondaryTextClass}`}>
                            {activity.notes}
                          </p>

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
                    <p className={mutedTextClass}>No activities planned.</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className={`p-6 rounded-xl shadow ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-4">Map & Locations</h2>

        {locationPoints.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-xl">
            <MapContainer
              center={[locationPoints[0].lat, locationPoints[0].lon]}
              zoom={13}
              scrollWheelZoom={true}
              className="h-80 w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={locationPoints} />

              {locationPoints.map((point) => (
                <Marker
                  key={point.name}
                  position={[point.lat, point.lon]}
                  icon={customMarkerIcon}
                >
                  <Popup>{point.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {mapLoading && (
          <p className={`mb-4 text-sm ${secondaryTextClass}`}>
            Loading map locations...
          </p>
        )}

        {!mapLoading && uniqueLocations.length === 0 ? (
          <p className={secondaryTextClass}>No locations added yet.</p>
        ) : (
          <div className="grid gap-3">
            {uniqueLocations.map((loc) => (
              <a
                key={loc}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  loc
                )}`}
                target="_blank"
                rel="noreferrer"
                className={`border rounded-lg p-4 transition text-blue-600 hover:underline ${
                  darkMode
                    ? "border-gray-600 hover:bg-gray-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                📍 {loc}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetails;