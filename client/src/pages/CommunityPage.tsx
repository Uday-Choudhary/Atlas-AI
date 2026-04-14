import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, GitFork, Search, Loader2, Globe, Users, Sparkles } from "lucide-react";

const getDestinationImage = (destination: string) => {
    const images: Record<string, string> = {
        paris: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
        tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
        london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600",
        dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
        bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
        rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600",
        agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600",
        default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600",
    };
    const key = Object.keys(images).find((k) => destination.toLowerCase().includes(k));
    return images[key || "default"];
};

const CommunityPage = () => {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { fetchCommunityTrips(); }, []);

    const fetchCommunityTrips = async () => {
        try {
            const res = await api.get("/trips/community?limit=50");
            setTrips(res.data);
        } catch (error) {
            console.error("Failed to fetch community trips:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFork = async (tripId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) { navigate("/login"); return; }
        try {
            const res = await api.post(`/trips/fork/${tripId}`);
            navigate(`/trip/${res.data.id}`);
        } catch (error) {
            console.error("Fork failed:", error);
        }
    };

    const filteredTrips = searchQuery
        ? trips.filter((t) =>
            t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : trips;

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-ocean-600)]" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="bg-[var(--color-ocean-900)] py-16 px-4 text-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                        <Globe className="h-4 w-4 text-[var(--color-lime-400)]" />
                        <span className="text-white text-[14px] font-body font-medium">Community Trips</span>
                    </div>
                    <h1 className="text-[36px] md:text-[44px] font-display font-bold text-white leading-tight mb-4">
                        Discover the World Together
                    </h1>
                    <p className="text-[16px] font-body text-white/70 max-w-lg mx-auto mb-8">
                        Explore incredible travel itineraries created by the Atlas AI community.
                        Fork any trip to make it your own!
                    </p>

                    {/* Search */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search destinations or trip names..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-full border border-transparent bg-white focus:ring-2 focus:ring-[var(--color-ocean-300)] outline-none transition-all text-[15px] font-body text-gray-900 shadow-md"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Trips Grid */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10">
                {filteredTrips.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-[18px] font-display font-semibold text-gray-400">No community trips yet</p>
                        <p className="text-[14px] font-body text-gray-400 mt-2">Be the first to share a trip!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrips.map((trip, index) => (
                            <motion.div
                                key={trip.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => navigate(`/trip/${trip.id}`)}
                                className="group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={getDestinationImage(trip.destination)}
                                        alt={trip.destination}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-card-overlay" />

                                    {trip.forkCount > 0 && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[12px] font-body px-2.5 py-1 rounded-full">
                                            <GitFork className="h-3 w-3" />
                                            {trip.forkCount}
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-[18px] font-display font-bold text-white leading-tight">
                                            {trip.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-white/80 text-[13px] mt-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {trip.destination}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-ocean-600)] flex items-center justify-center text-white text-[13px] font-display font-bold">
                                                {trip.user?.firstName?.[0] || "A"}
                                            </div>
                                            <span className="text-[14px] font-body text-gray-600">
                                                {trip.user?.firstName || "Atlas"} {trip.user?.lastName?.[0] || ""}
                                            </span>
                                        </div>
                                        <span className="text-[12px] font-body text-gray-400">
                                            {new Date(trip.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1 text-[12px] font-body font-bold text-[var(--color-lime-700)] bg-[var(--color-lime-300)]/30 rounded-full px-3 py-1">
                                            💰 {trip.budget}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[12px] font-body text-[var(--color-ocean-600)] bg-[var(--color-ocean-50)] rounded-full px-3 py-1">
                                            <Users className="h-3.5 w-3.5" /> {trip.groupSize}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => handleFork(trip.id, e)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-[var(--color-ocean-200)] text-[var(--color-ocean-600)] text-[14px] font-body font-semibold hover:bg-[var(--color-ocean-600)] hover:text-white hover:border-[var(--color-ocean-600)] transition-all"
                                    >
                                        <GitFork className="h-4 w-4" />
                                        Fork This Trip
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
