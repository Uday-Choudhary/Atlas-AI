import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save, MapPin, Calendar, DollarSign, Users, ChevronDown, ChevronUp, Clock, Ticket, Star, Map, LayoutList, Hotel } from "lucide-react";

interface TripPreviewProps {
    tripData: any;
    onSave: () => void;
    saving?: boolean;
    onViewOnMap?: (lat: number, lng: number, label: string) => void;
    onSwitchToMap?: () => void;
}

// Dynamic fallback images by category keyword using LoremFlickr (real Flickr photos)
const getHotelImage = (name: string) => {
    const query = name ? encodeURIComponent(name.split(" ")[0].replace(/[^a-zA-Z]/g, "")) : "hotel";
    return `https://loremflickr.com/600/400/${query},hotel/all`;
};

const getPlaceImage = (name: string) => {
    const query = name ? encodeURIComponent(name.split(" ")[0].replace(/[^a-zA-Z]/g, "")) : "landmark";
    return `https://loremflickr.com/400/400/${query},landmark/all`;
};

const getRatingColor = (r: number) =>
    r >= 4.5 ? "text-amber-500" : r >= 4.0 ? "text-amber-400" : "text-amber-600";

const TripPreview = ({
    tripData,
    onSave,
    saving = false,
    onViewOnMap,
    onSwitchToMap,
}: TripPreviewProps) => {
    const plan = tripData?.trip_plan || tripData;
    const [activeView, setActiveView] = useState<"trip" | "map">("trip");
    const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]));

    if (!plan) return null;

    const itinerary = plan.itinerary || [];
    const hotels = plan.hotels || [];

    const toggleDay = (day: number) => {
        setOpenDays((prev) => {
            const next = new Set(prev);
            if (next.has(day)) next.delete(day);
            else next.add(day);
            return next;
        });
    };

    const handleViewOnMap = (lat: number, lng: number, label: string) => {
        onViewOnMap?.(lat, lng, label);
        onSwitchToMap?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col overflow-hidden bg-white/40 p-4 rounded-2xl border border-[var(--color-sky-100)]"
        >
            {/* ── Header ── */}
            <div className="flex-shrink-0 pb-5">
                <h2 className="text-[22px] font-display font-bold text-gray-900 leading-tight">
                    Your Trip Itinerary from{" "}
                    <span className="text-[var(--color-ocean-600)]">{plan.origin || "Home"}</span> to{" "}
                    <span className="text-[var(--color-ocean-600)]">{plan.destination || "Destination"}</span>
                </h2>
                <div className="flex flex-wrap gap-2 mt-3">
                    {plan.duration && (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-body font-medium bg-white border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 shadow-sm">
                            <Calendar className="h-4 w-4 text-[var(--color-ocean-500)]" /> {plan.duration}
                        </span>
                    )}
                    {plan.budget && (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-body font-medium bg-white border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 shadow-sm">
                            <DollarSign className="h-4 w-4 text-[var(--color-teal-500)]" /> {plan.budget}
                        </span>
                    )}
                    {plan.group_size && (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-body font-medium bg-white border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 shadow-sm">
                            <Users className="h-4 w-4 text-[var(--color-coral-500)]" /> {plan.group_size}
                        </span>
                    )}
                </div>

                {/* Switch Map / Trip */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setActiveView("trip")}
                        className={`flex items-center gap-1.5 text-[14px] font-body font-medium px-5 py-2.5 rounded-full border transition-all ${
                            activeView === "trip"
                                ? "bg-[var(--color-ocean-600)] text-white border-[var(--color-ocean-600)] shadow-blue"
                                : "bg-white border-gray-200 text-gray-600 hover:border-[var(--color-ocean-400)] hover:text-[var(--color-ocean-600)] hover:shadow-sm"
                        }`}
                    >
                        <LayoutList className="h-4 w-4" /> Trip Plan
                    </button>
                    <button
                        onClick={() => { setActiveView("map"); onSwitchToMap?.(); }}
                        className={`flex items-center gap-1.5 text-[14px] font-body font-medium px-5 py-2.5 rounded-full border transition-all ${
                            activeView === "map"
                                ? "bg-[var(--color-ocean-600)] text-white border-[var(--color-ocean-600)] shadow-blue"
                                : "bg-white border-gray-200 text-gray-600 hover:border-[var(--color-ocean-400)] hover:text-[var(--color-ocean-600)] hover:shadow-sm"
                        }`}
                    >
                        <Map className="h-4 w-4" /> View Map
                    </button>
                </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-8 pb-4">

                {/* ── Hotels ── */}
                {hotels.length > 0 && (
                    <section>
                        <h3 className="flex items-center gap-2 text-[18px] font-display font-semibold text-gray-900 mb-4">
                            <Hotel className="h-5 w-5 text-[var(--color-ocean-600)]" /> Recommended Hotels
                        </h3>
                        <div className="grid grid-cols-1 gap-5">
                            {hotels.map((hotel: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow group"
                                >
                                    {/* Hotel Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={hotel.hotel_image_url || getHotelImage(hotel.hotel_name || "hotel")}
                                            alt={hotel.hotel_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms] ease-out"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = getHotelImage(hotel.hotel_name || "resort") + `?random=${i}`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-card-overlay" />
                                        {hotel.rating && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                                <Star className={`h-3 w-3 fill-amber-400 ${getRatingColor(hotel.rating)}`} />
                                                <span className={`text-[12px] font-bold ${getRatingColor(hotel.rating)}`}>{hotel.rating}</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <p className="font-display font-bold text-[18px] leading-tight text-white drop-shadow-md">{hotel.hotel_name}</p>
                                            <p className="text-[13px] font-body text-white/90 truncate max-w-[250px] mt-1">{hotel.hotel_address}</p>
                                        </div>
                                    </div>

                                    {/* Hotel Info */}
                                    <div className="p-4 flex items-center justify-between gap-3 bg-white">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[14px] font-bold px-3 py-1 bg-[var(--color-lime-100)] text-[var(--color-lime-700)] rounded-full">
                                                {hotel.price_per_night}/night
                                            </span>
                                            {hotel.description && (
                                                <p className="text-[13px] font-body text-gray-500 line-clamp-1">{hotel.description}</p>
                                            )}
                                        </div>
                                        {hotel.geo_coordinates?.latitude && (
                                            <button
                                                onClick={() =>
                                                    handleViewOnMap(
                                                        hotel.geo_coordinates.latitude,
                                                        hotel.geo_coordinates.longitude,
                                                        hotel.hotel_name
                                                    )
                                                }
                                                className="flex-shrink-0 flex items-center gap-1 text-[13px] font-body font-medium text-[var(--color-teal-600)] bg-[var(--color-teal-50)] hover:bg-[var(--color-teal-500)] hover:text-white rounded-full px-3 py-1.5 transition-all"
                                            >
                                                <MapPin className="h-3.5 w-3.5" /> Map
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Day-by-Day Itinerary ── */}
                {itinerary.length > 0 && (
                    <section>
                        <h3 className="flex items-center gap-2 text-[18px] font-display font-semibold text-gray-900 mb-4">
                            📅 Day-by-Day Plan
                        </h3>
                        <div className="space-y-4">
                            {itinerary.map((day: any, dayIdx: number) => (
                                <div
                                    key={dayIdx}
                                    className="rounded-2xl border border-[var(--color-sky-200)] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Day Header */}
                                    <button
                                        className="w-full flex items-center justify-between px-5 py-4 bg-[var(--color-ocean-50)] hover:bg-[var(--color-ocean-100)] transition-colors"
                                        onClick={() => toggleDay(day.day)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-[40px] h-[40px] rounded-full bg-[var(--color-ocean-600)] text-white flex items-center justify-center font-display text-[18px] font-bold shadow-sm">
                                                {day.day}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-display font-bold text-[16px] text-gray-900">
                                                    {day.day_plan || `Day ${day.day}`}
                                                </p>
                                                {day.best_time_to_visit_day && (
                                                    <p className="text-[13px] font-body text-gray-500 mt-0.5">
                                                        🌤 {day.best_time_to_visit_day}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[var(--color-ocean-600)] bg-white rounded-full p-1 shadow-sm">
                                            {openDays.has(day.day) ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </span>
                                    </button>

                                    {/* Activities with Timeline */}
                                    <AnimatePresence>
                                        {openDays.has(day.day) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-5 bg-white relative">
                                                    {/* Vertical dashed timeline line */}
                                                    <div className="absolute left-[38px] top-6 bottom-6 w-[2px] border-l-2 border-dashed border-[var(--color-sky-200)]" />

                                                    <div className="space-y-6 relative ml-6">
                                                        {(day.activities || []).map((activity: any, actIdx: number) => (
                                                            <motion.div
                                                                key={actIdx}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: actIdx * 0.08 }}
                                                                className="relative flex gap-4 pl-8"
                                                            >
                                                                {/* Timeline Dot */}
                                                                <div className="absolute left-[-29px] top-4 w-4 h-4 rounded-full bg-white border-4 border-[var(--color-ocean-400)] shadow-sm z-10" />

                                                                {/* Activity Image */}
                                                                <div className="w-[100px] h-[100px] flex-shrink-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 mt-1">
                                                                    <img
                                                                        src={activity.place_image_url || getPlaceImage(activity.place_name || "landmark")}
                                                                        alt={activity.place_name}
                                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = getPlaceImage(activity.place_name || "city") + `?random=${actIdx}`;
                                                                        }}
                                                                    />
                                                                </div>

                                                                {/* Activity Info */}
                                                                <div className="flex-1 py-1 pr-2 min-w-0">
                                                                    <h4 className="font-display font-semibold text-[16px] text-gray-900 leading-tight">
                                                                        {activity.place_name}
                                                                    </h4>
                                                                    {activity.place_details && (
                                                                        <p className="text-[13px] font-body text-gray-500 mt-1 line-clamp-2">
                                                                            {activity.place_details}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-x-3 gap-y-2 mt-2">
                                                                        {activity.ticket_pricing && (
                                                                            <span className="flex items-center gap-1 text-[12px] font-body font-bold text-[var(--color-emerald-600)] bg-[var(--color-emerald-50)] px-2 py-0.5 rounded-md">
                                                                                <Ticket className="h-3.5 w-3.5" /> {activity.ticket_pricing}
                                                                            </span>
                                                                        )}
                                                                        {activity.time_travel_each_location && (
                                                                            <span className="flex items-center gap-1 text-[12px] font-body font-medium text-[var(--color-ocean-600)] bg-[var(--color-ocean-50)] px-2 py-0.5 rounded-md">
                                                                                <Clock className="h-3.5 w-3.5" /> {activity.time_travel_each_location}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {activity.geo_coordinates?.latitude && (
                                                                        <button
                                                                            onClick={() =>
                                                                                handleViewOnMap(
                                                                                    activity.geo_coordinates.latitude,
                                                                                    activity.geo_coordinates.longitude,
                                                                                    activity.place_name
                                                                                )
                                                                            }
                                                                            className="mt-2.5 flex items-center gap-1.5 text-[12px] font-body text-[var(--color-teal-600)] hover:text-[var(--color-teal-700)] font-bold transition-colors"
                                                                        >
                                                                            <MapPin className="h-3.5 w-3.5" /> Locate
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ── Save Button ── */}
            <div className="flex-shrink-0 pt-4 pb-1">
                <Button
                    onClick={onSave}
                    disabled={saving}
                    variant="ai"
                    className="w-full text-[16px] shadow-ai"
                >
                    {saving ? (
                        <div className="flex items-center gap-2 text-gray-900">
                            <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                            Saving trip...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-900">
                            <Save className="h-5 w-5" /> Save Itinerary
                        </div>
                    )}
                </Button>
            </div>
        </motion.div>
    );
};

export default TripPreview;
