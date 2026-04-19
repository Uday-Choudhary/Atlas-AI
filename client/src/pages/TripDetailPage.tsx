import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MapView from "@/components/map/MapView";
import PlaceCard from "./_components/PlaceCard";
import { Button } from "@/components/ui/button";
import {
    MapPin, Calendar, DollarSign, Users, Download,
    Share2, GitFork,
    Loader2, Hotel, Route, ArrowLeft, Star, Sparkles
} from "lucide-react";

const getHotelImage = (name: string) => {
    const query = name ? encodeURIComponent(name.split(" ")[0].replace(/[^a-zA-Z]/g, "")) : "hotel";
    return `https://loremflickr.com/600/400/${query},hotel/all`;
};

const TripDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
    const [optimizing, setOptimizing] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => { fetchTrip(); }, [id]);

    const fetchTrip = async () => {
        try {
            const res = await api.get(`/api/trips/${id}`);
            setTrip(res.data);
        } catch (error) {
            console.error("Failed to fetch trip:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const res = await api.get(`/api/trips/${id}/pdf`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `atlas-ai-${trip?.destination || "trip"}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF download failed:", error);
        } finally {
            setDownloading(false);
        }
    };

    const handleOptimize = async () => {
        setOptimizing(true);
        try {
            const res = await api.post(`/api/trips/${id}/optimize`);
            setTrip(res.data);
        } catch (error) {
            console.error("Optimization failed:", error);
        } finally {
            setOptimizing(false);
        }
    };

    const handleTogglePublic = async () => {
        try {
            const res = await api.patch(`/api/trips/${id}/publish`);
            setTrip(res.data);
        } catch (error) {
            console.error("Toggle public failed:", error);
        }
    };

    const handleFork = async () => {
        if (!token) { navigate("/login"); return; }
        try {
            const res = await api.post(`/api/trips/fork/${id}`);
            navigate(`/trip/${res.data.id}`);
        } catch (error) {
            console.error("Fork failed:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-ocean-600)]" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <p className="text-[16px] font-body text-gray-500">Trip not found</p>
                <Button onClick={() => navigate("/my-trips")} variant="outline">
                    Go to My Trips
                </Button>
            </div>
        );
    }

    const itinerary = trip.itinerary?.trip_plan || trip.itinerary;
    const days = itinerary?.itinerary || [];
    const hotels = itinerary?.hotels || [];
    const isOwner = user?.id === trip.userId;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="relative h-[42vh] bg-[var(--color-ocean-900)] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-12 h-full flex flex-col justify-end pb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-4 md:left-12 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-[14px] font-body"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-[36px] md:text-[48px] font-display font-extrabold text-white mb-4 leading-tight">
                            {trip.title}
                        </h1>
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-body bg-white/15 backdrop-blur-sm text-white rounded-full px-4 py-1.5">
                                <MapPin className="h-4 w-4" /> {trip.destination}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-body bg-white/15 backdrop-blur-sm text-white rounded-full px-4 py-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-body bg-white/15 backdrop-blur-sm text-white rounded-full px-4 py-1.5">
                                <DollarSign className="h-4 w-4" /> {trip.budget}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-body bg-white/15 backdrop-blur-sm text-white rounded-full px-4 py-1.5">
                                <Users className="h-4 w-4" /> {trip.groupSize}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border-b border-gray-100 sticky top-[72px] z-30">
                <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-3 flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                    >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download PDF
                    </Button>

                    {isOwner && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleOptimize}
                                disabled={optimizing}
                            >
                                {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
                                Optimize Route
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleTogglePublic}
                            >
                                <Share2 className="h-4 w-4" />
                                {trip.isPublic ? "Make Private" : "Publish"}
                            </Button>
                        </>
                    )}

                    {!isOwner && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFork}
                        >
                            <GitFork className="h-4 w-4" />
                            Fork This Trip
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Itinerary */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Hotels Section */}
                        {hotels.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="flex items-center gap-2 text-[22px] font-display font-bold text-gray-900 mb-5">
                                    <Hotel className="h-5 w-5 text-[var(--color-ocean-600)]" />
                                    Recommended Hotels
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {hotels.map((hotel: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow group"
                                        >
                                            <div className="relative h-40 overflow-hidden">
                                                <img
                                                    src={hotel.hotel_image_url || getHotelImage(hotel.hotel_name || "hotel")}
                                                    alt={hotel.hotel_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = getHotelImage(hotel.hotel_name || "resort") + `?random=${i}`;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-card-overlay" />
                                                {hotel.rating && (
                                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        <span className="text-[12px] font-bold text-amber-600">{hotel.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-display font-bold text-[16px] text-gray-900">
                                                    {hotel.hotel_name}
                                                </h4>
                                                <p className="text-[13px] font-body text-gray-500 mt-1 truncate">
                                                    {hotel.hotel_address}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[13px] font-body font-bold text-[var(--color-lime-700)] bg-[var(--color-lime-300)]/30 rounded-full px-3 py-1">
                                                        {hotel.price_per_night}/night
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Day-by-Day Section */}
                        <div>
                            <h2 className="text-[22px] font-display font-bold text-gray-900 mb-5">
                                📅 Day-by-Day Itinerary
                            </h2>

                            {/* Day filter pills */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                                <button
                                    onClick={() => setSelectedDay(undefined)}
                                    className={`px-4 py-2 rounded-full text-[13px] font-body font-semibold transition-all whitespace-nowrap ${
                                        !selectedDay
                                            ? "bg-[var(--color-ocean-600)] text-white shadow-blue"
                                            : "bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-ocean-400)] hover:text-[var(--color-ocean-600)]"
                                    }`}
                                >
                                    All Days
                                </button>
                                {days.map((day: any) => (
                                    <button
                                        key={day.day}
                                        onClick={() => setSelectedDay(day.day)}
                                        className={`px-4 py-2 rounded-full text-[13px] font-body font-semibold transition-all whitespace-nowrap ${
                                            selectedDay === day.day
                                                ? "bg-[var(--color-ocean-600)] text-white shadow-blue"
                                                : "bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-ocean-400)] hover:text-[var(--color-ocean-600)]"
                                        }`}
                                    >
                                        Day {day.day}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-8">
                                {days
                                    .filter((d: any) => !selectedDay || d.day === selectedDay)
                                    .map((day: any, dayIdx: number) => (
                                        <motion.div
                                            key={day.day}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: dayIdx * 0.08 }}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-11 h-11 rounded-full bg-[var(--color-ocean-600)] text-white flex items-center justify-center text-[18px] font-display font-bold shadow-blue flex-shrink-0">
                                                    {day.day}
                                                </div>
                                                <div>
                                                    <h3 className="font-display font-bold text-[18px] text-gray-900">
                                                        {day.day_plan || `Day ${day.day}`}
                                                    </h3>
                                                    {day.best_time_to_visit_day && (
                                                        <p className="text-[13px] font-body text-gray-500 mt-0.5">
                                                            🌤 {day.best_time_to_visit_day}
                                                        </p>
                                                    )}
                                                </div>
                                                {day.route_savings_km > 0 && (
                                                    <span className="ml-auto text-[12px] font-body bg-[var(--color-teal-50)] text-[var(--color-teal-600)] border border-[var(--color-teal-200)] px-3 py-1 rounded-full">
                                                        🛣️ {day.route_distance_km}km · saved {day.route_savings_km}km
                                                    </span>
                                                )}
                                            </div>

                                            {/* Activities Grid with left border timeline */}
                                            <div className="ml-5 pl-8 border-l-2 border-dashed border-[var(--color-sky-200)]">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {(day.activities || []).map((activity: any, actIdx: number) => (
                                                        <PlaceCard key={actIdx} place={activity} index={actIdx} />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Map */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-[140px]">
                            <h3 className="text-[16px] font-display font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[var(--color-lime-500)]" />
                                Trip Map
                            </h3>
                            <div className="h-[55vh] rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                                <MapView itinerary={trip.itinerary} selectedDay={selectedDay} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDetailPage;
