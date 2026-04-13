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
import Toast from "../components/Toast";

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
  const [expandedDays, setExpandedDays] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [locationPoints, setLocationPoints] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [toastType, setToastType] = useState("success");

  const activityFormRef = useRef(null);

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

      const activitiesData = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
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
      console.log("Geocoding error:", error);
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
    setLat(activity.lat ?? null);
    setLon(activity.lon ?? null);

    activityFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteDoc(doc(db, "activities", activityId));
      setToastType("success");
      setSuccessMessage("Activity deleted successfully!");
      await fetchActivities();
    } catch (error) {
      console.log("Error deleting activity:", error);
      setToastType("error");
      setSuccessMessage("Failed to delete activity");
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

        setToastType("success");
        setSuccessMessage("Activity updated successfully!");
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

        setToastType("success");
        setSuccessMessage("Activity added successfully!");
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
      setToastType("error");
      setSuccessMessage(error.message);
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

  const toggleDay = (tripDay) => {
    setExpandedDays((prev) => ({
      ...prev,
      [tripDay]: !prev[tripDay],
    }));
  };

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!tripDays.length) return;

    setExpandedDays((prev) => {
      if (Object.keys(prev).length > 0) return prev;

      return {
        [tripDays[0]]: true,
      };
    });
  }, [tripDays]);

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

  if (!trip) {
    return (
      <div className={pageClass}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className={`p-10 text-center ${mainCardClass}`}>
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold mb-2">Loading trip...</h2>
            <p className="opacity-75">
              Please wait while we load your travel details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <section className="mb-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-5">
                <span>🌍</span>
                Trip details
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                {trip.title}
              </h1>

              <p className="text-lg opacity-80 mb-2">{trip.destination}</p>
              <p className="opacity-70">
                {trip.startDate} → {trip.endDate}
              </p>
            </div>

            <div className={`p-6 ${mainCardClass}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={statCardClass}>
                  <div className="text-2xl mb-2">💰</div>
                  <p className="text-sm opacity-70 mb-1">Trip Budget</p>
                  <p className="text-2xl font-bold">€{trip.budget}</p>
                </div>

                <div className={statCardClass}>
                  <div className="text-2xl mb-2">🧾</div>
                  <p className="text-sm opacity-70 mb-1">Planned Cost</p>
                  <p className="text-2xl font-bold">€{totalActivityCost}</p>
                </div>

                <div className={statCardClass}>
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-sm opacity-70 mb-1">Remaining</p>
                  <p className="text-2xl font-bold">€{remainingBudget}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(weather || weatherError) && (
          <section className="mb-10">
            <div className={`p-6 ${mainCardClass}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-70 mb-1">Live destination info</p>
                  <h2 className="text-2xl font-bold">Current Weather</h2>
                </div>
                <div className="text-3xl">🌤️</div>
              </div>

              {weatherError && (
                <p className="text-red-500">{weatherError}</p>
              )}

              {weather && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className={statCardClass}>
                    <p className="text-sm opacity-70 mb-1">City</p>
                    <p className="text-lg font-semibold">{weather.name}</p>
                  </div>

                  <div className={statCardClass}>
                    <p className="text-sm opacity-70 mb-1">Temperature</p>
                    <p className="text-lg font-semibold">
                      {Math.round(weather.main.temp)}°C
                    </p>
                  </div>

                  <div className={statCardClass}>
                    <p className="text-sm opacity-70 mb-1">Condition</p>
                    <p className="text-lg font-semibold capitalize">
                      {weather.weather?.[0]?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section ref={activityFormRef} className="mb-10">
          <div className={`p-6 md:p-8 ${mainCardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-70 mb-1">Activity planner</p>
                <h2 className="text-2xl font-bold">
                  {editingActivityId ? "Edit Activity" : "Add Activity"}
                </h2>
              </div>
              <div className="text-3xl">🗓️</div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 opacity-70">Day</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select a day</option>
                  {tripDays.map((tripDay) => (
                    <option key={tripDay} value={tripDay}>
                      {tripDay}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">Title</label>
                <input
                  type="text"
                  placeholder="Activity title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="Food">Food</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-70">Cost (€)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-2 opacity-70">Notes</label>
                <textarea
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputClass} min-h-[110px] resize-none`}
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" className={primaryBtn}>
                  {editingActivityId ? "Update Activity" : "Add Activity"}
                </button>

                {editingActivityId && (
                  <button
                    type="button"
                    className={secondaryBtn}
                    onClick={() => {
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
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="grid xl:grid-cols-2 gap-8">
          <div className={`p-6 ${mainCardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-70 mb-1">Your schedule</p>
                <h2 className="text-2xl font-bold">Itinerary</h2>
              </div>
              <div className="text-3xl">📌</div>
            </div>

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
                  className={`px-4 py-2 rounded-xl border transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : darkMode
                      ? "border-gray-700 text-white hover:bg-gray-800"
                      : "border-gray-300 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {visibleActivities.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">No activities yet</h3>
                <p className="opacity-75">
                  Add your first activity to start building the itinerary.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tripDays
                  .filter((tripDay) =>
                    selectedCategory === "All"
                      ? true
                      : groupedActivities[tripDay]?.length
                  )
                  .map((tripDay) => {
                    const dayActivities = groupedActivities[tripDay] || [];
                    const isExpanded = expandedDays[tripDay];

                    return (
                      <div
                        key={tripDay}
                        className={
                          darkMode
                            ? "border border-gray-700 rounded-2xl overflow-hidden bg-gray-800"
                            : "border border-gray-200 rounded-2xl overflow-hidden bg-gray-50"
                        }
                      >
                        <div className="flex items-center justify-between px-5 py-4">
                          <div>
                            <h3 className="text-lg font-bold">{tripDay}</h3>
                            <p className="text-sm opacity-70">
                              {dayActivities.length}{" "}
                              {dayActivities.length === 1
                                ? "activity"
                                : "activities"}
                            </p>
                          </div>

                          <button
                            onClick={() => toggleDay(tripDay)}
                            className={primaryBtn}
                            type="button"
                          >
                            {isExpanded ? "Hide activities" : "Show activities"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-5">
                            {dayActivities.length ? (
                              <div className="grid gap-4">
                                {dayActivities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className={
                                      darkMode
                                        ? "border border-gray-600 rounded-2xl p-5 bg-gray-900"
                                        : "border border-gray-200 rounded-2xl p-5 bg-white"
                                    }
                                  >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div>
                                        <h4 className="text-lg font-semibold">
                                          {activity.title}
                                        </h4>
                                        <p className="text-sm opacity-70 mt-1">
                                          {activity.category || "Other"}
                                        </p>
                                      </div>
                                      <div className="text-sm font-medium opacity-80">
                                        {activity.time || "No time"}
                                      </div>
                                    </div>

                                    <div className="space-y-2 text-sm mb-4">
                                      <p>
                                        <span className="opacity-70">
                                          Location:
                                        </span>{" "}
                                        {activity.location ? (
                                          <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                              activity.location
                                            )}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            {activity.location}
                                          </a>
                                        ) : (
                                          "Not set"
                                        )}
                                      </p>

                                      <p>
                                        <span className="opacity-70">Cost:</span>{" "}
                                        €{activity.cost || 0}
                                      </p>

                                      {activity.notes && (
                                        <p>
                                          <span className="opacity-70">
                                            Notes:
                                          </span>{" "}
                                          {activity.notes}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex gap-3">
                                      <button
                                        onClick={() =>
                                          handleEditClick(activity)
                                        }
                                        className={secondaryBtn}
                                      >
                                        Edit
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteActivity(activity.id)
                                        }
                                        className={dangerBtn}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="opacity-60">No activities planned.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className={`p-6 ${mainCardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-70 mb-1">Saved places</p>
                <h2 className="text-2xl font-bold">Map & Locations</h2>
              </div>
              <div className="text-3xl">🗺️</div>
            </div>

            {locationPoints.length > 0 && (
              <div className="mb-6 overflow-hidden rounded-2xl">
                <MapContainer
                  center={[locationPoints[0].lat, locationPoints[0].lon]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-80 w-full"
                >
                  <TileLayer
                    attribution="© OpenStreetMap contributors"
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
              <p className="mb-4 text-sm opacity-70">Loading map locations...</p>
            )}

            {!mapLoading && uniqueLocations.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">📍</div>
                <h3 className="text-xl font-bold mb-2">No locations yet</h3>
                <p className="opacity-75">
                  Add activity locations and they will appear here.
                </p>
              </div>
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
                    className={`rounded-2xl p-4 border transition ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-800 text-blue-400"
                        : "border-gray-200 hover:bg-gray-50 text-blue-600"
                    }`}
                  >
                    {loc}
                  </a>
                ))}
              </div>
            )}
          </div>
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

export default TripDetails;