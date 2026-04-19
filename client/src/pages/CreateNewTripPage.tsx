import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "./_components/ChatBox";
import TripPreview from "./_components/TripPreview";
import MapView from "@/components/map/MapView";
import api from "@/lib/api";
import { MapPin, Map, LayoutList, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CreateNewTripPage = () => {
    const { user } = useAuth();
    const [tripData, setTripData] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [focusCoord, setFocusCoord] = useState<{ lat: number; lng: number; label: string } | null>(null);
    const navigate = useNavigate();

    const handleTripGenerated = (data: any) => {
        setTripData(data);
        setShowMap(false);
    };

    const handleSaveTrip = async () => {
        if (!tripData) return;
        setSaving(true);
        try {
            const plan = tripData?.trip_plan || tripData;
            const duration = parseInt(plan?.duration) || 3;
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);

            const res = await api.post("/api/trips/save", {
                tripPlan: tripData,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            navigate(`/trip/${res.data.id}`);
        } catch (error: any) {
            console.error("Failed to save trip:", error);
            if (error.response?.status === 402) {
                // Limit reached
                navigate("/pricing");
            } else {
                alert("Failed to save trip. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleViewOnMap = (lat: number, lng: number, label: string) => {
        setFocusCoord({ lat, lng, label });
        setShowMap(true);
    };

    return (
        <div className="min-h-[calc(100vh-72px)] bg-[var(--color-sky-50)]">
            {/* Top Bar */}
            <div className="px-4 md:px-8 py-3.5 border-b border-[var(--color-sky-100)] bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between max-w-[1280px] mx-auto">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-lime-400)] flex items-center justify-center shadow-ai">
                            <Sparkles className="h-4 w-4 text-gray-900" />
                        </div>
                        <h1 className="text-[18px] font-display font-bold text-gray-900">
                            Create New Trip
                        </h1>
                        {user?.planType === "free" && user?.freeTripsUsed !== undefined && (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-[12px] font-body text-gray-500">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {Math.max(0, 2 - user.freeTripsUsed)} free trips left
                            </div>
                        )}
                    </div>

                    {/* Mobile map/preview toggle */}
                    {tripData && (
                        <div className="md:hidden flex gap-1 bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => setShowMap(false)}
                                className={`px-3 py-1.5 rounded-full text-[13px] font-body font-medium transition-all flex items-center gap-1 ${
                                    !showMap
                                        ? "bg-white shadow-sm text-[var(--color-ocean-600)]"
                                        : "text-gray-500"
                                }`}
                            >
                                <LayoutList className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setShowMap(true)}
                                className={`px-3 py-1.5 rounded-full text-[13px] font-body font-medium transition-all flex items-center gap-1 ${
                                    showMap
                                        ? "bg-white shadow-sm text-[var(--color-ocean-600)]"
                                        : "text-gray-500"
                                }`}
                            >
                                <Map className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-[1280px] mx-auto h-[calc(100vh-120px)]">

                {/* Left: Chat */}
                <div className="border-r border-[var(--color-sky-100)] px-4 md:px-6 py-4 overflow-y-auto">
                    <ChatBox onTripGenerated={handleTripGenerated} />
                </div>

                {/* Right: Map / Preview */}
                <div className="hidden md:flex flex-col px-4 md:px-6 py-4 gap-4 overflow-hidden bg-[var(--color-sky-50)]">
                    <AnimatePresence mode="wait">
                        {tripData ? (
                            <motion.div
                                key="with-trip"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col h-full gap-3"
                            >
                                {/* Map — expands or stays mini */}
                                <div
                                    className={`rounded-2xl overflow-hidden border border-[var(--color-sky-100)] shadow-sm transition-all duration-500 ${
                                        showMap ? "flex-1" : "h-[200px]"
                                    }`}
                                >
                                    <MapView
                                        itinerary={tripData}
                                        focusCoord={focusCoord}
                                    />
                                </div>

                                {/* Trip Preview */}
                                {!showMap && (
                                    <div className="flex-1 overflow-hidden">
                                        <TripPreview
                                            tripData={tripData}
                                            onSave={handleSaveTrip}
                                            saving={saving}
                                            onViewOnMap={handleViewOnMap}
                                            onSwitchToMap={() => setShowMap(true)}
                                        />
                                    </div>
                                )}

                                {/* "Back to Trip" bar when map is expanded */}
                                {showMap && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setShowMap(false)}
                                        className="flex-shrink-0 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[var(--color-sky-200)] text-[14px] font-body font-semibold text-[var(--color-ocean-600)] hover:bg-[var(--color-ocean-50)] transition-all shadow-sm"
                                    >
                                        <LayoutList className="h-4 w-4" />
                                        Back to Trip Plan
                                    </motion.button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="map-placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-sky-200)] bg-white/60"
                            >
                                <div className="text-center px-8">
                                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-[var(--color-sky-50)] flex items-center justify-center border border-[var(--color-sky-100)]">
                                        <MapPin className="h-10 w-10 text-[var(--color-ocean-300)]" />
                                    </div>
                                    <h3 className="text-[20px] font-display font-bold text-gray-500 mb-2">
                                        Your trip will appear here
                                    </h3>
                                    <p className="text-[14px] font-body text-gray-400 max-w-xs mx-auto leading-relaxed">
                                        Chat with Atlas AI on the left to plan your perfect trip. The map and itinerary will show up right here.
                                    </p>

                                    {/* Animated dots to show its alive */}
                                    <div className="flex items-center justify-center gap-1.5 mt-6">
                                        <span className="w-2 h-2 bg-[var(--color-ocean-300)] rounded-full animate-ai-bounce" />
                                        <span className="w-2 h-2 bg-[var(--color-ocean-300)] rounded-full animate-ai-bounce animation-delay-200" />
                                        <span className="w-2 h-2 bg-[var(--color-ocean-300)] rounded-full animate-ai-bounce animation-delay-400" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CreateNewTripPage;
