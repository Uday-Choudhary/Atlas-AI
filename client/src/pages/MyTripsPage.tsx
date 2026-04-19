import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import api from "@/lib/api";
import {
    MapPin, Calendar, Plus, Trash2, Eye, Globe, Lock,
    Plane, Sparkles, ChevronLeft, ChevronRight,
    ArrowUpRight, Wallet, Clock, Search, TrendingUp, Star, MoreVertical
} from "lucide-react";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const HERO_BG = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90";

const DEST_IMGS: Record<string, string> = {
    paris: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    barcelona: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
    maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    new_york: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=800&q=80",
    kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    prague: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
    default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
};

const FLAGS: Record<string, string> = {
    paris: "🇫🇷", france: "🇫🇷", tokyo: "🇯🇵", japan: "🇯🇵",
    london: "🇬🇧", uk: "🇬🇧", dubai: "🇦🇪", uae: "🇦🇪",
    bali: "🇮🇩", indonesia: "🇮🇩", rome: "🇮🇹", italy: "🇮🇹",
    barcelona: "🇪🇸", spain: "🇪🇸", maldives: "🇲🇻",
    santorini: "🇬🇷", greece: "🇬🇷", kyoto: "🇯🇵", prague: "🇨🇿",
};

const getImg = (dest: string): string => {
    const k = Object.keys(DEST_IMGS).find(k => dest.toLowerCase().includes(k));
    return DEST_IMGS[k ?? "default"];
};

const getFlag = (dest: string): string => {
    const k = Object.keys(FLAGS).find(k => dest.toLowerCase().includes(k));
    return k ? FLAGS[k] : "🌍";
};

const fmtDate = (d: string): string =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

const fmtDateFull = (d: string): string =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

const nights = (s: string, e: string): number =>
    s && e ? Math.max(0, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000)) : 0;

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const MyTripsPage = () => {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { scrollY } = useScroll();
    const heroBgY = useTransform(scrollY, [0, 500], ["0%", "20%"]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => { fetchTrips(); }, []);

    const fetchTrips = async () => {
        try {
            const res = await api.get("/api/trips/user");
            setTrips(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(null);
        if (!confirm("Delete this trip?")) return;
        try {
            await api.delete(`/api/trips/${id}`);
            setTrips(p => p.filter(t => t.id !== id));
        } catch (err) { console.error(err); }
    };

    const handleTogglePublic = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(null);
        try {
            const res = await api.patch(`/api/trips/${id}/publish`);
            setTrips(p => p.map(t => t.id === id ? { ...t, isPublic: res.data.isPublic } : t));
        } catch (err) { console.error(err); }
    };

    const scrollCarousel = (dir: "left" | "right") => {
        carouselRef.current?.scrollBy({ left: dir === "right" ? 400 : -400, behavior: "smooth" });
    };

    const now = new Date();
    const upcoming = trips.filter(t => t.startDate && new Date(t.startDate) >= now);
    const past = trips.filter(t => t.startDate && new Date(t.startDate) < now);
    const nextTrip = [...upcoming].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

    const filtered = trips
        .filter(t => {
            if (filter === "upcoming") return t.startDate && new Date(t.startDate) >= now;
            if (filter === "past") return t.startDate && new Date(t.startDate) < now;
            return true;
        })
        .filter(t =>
            !search ||
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.destination?.toLowerCase().includes(search.toLowerCase())
        );

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#07090f" }}>
                <div className="flex flex-col items-center gap-5">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        style={{
                            width: 56, height: 56, borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.08)",
                            borderTopColor: "rgba(255,255,255,0.70)"
                        }}
                    />
                    <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 12, letterSpacing: "0.2em", fontFamily: "var(--font-body)", textTransform: "uppercase" }}>
                        Loading adventures
                    </p>
                </div>
            </div>
        );
    }

    /* ── Empty State ── */
    if (trips.length === 0) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: "#07090f" }}>
                <div className="absolute inset-0">
                    <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-25" />
                    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(7,9,15,0.4) 0%, rgba(7,9,15,0.97) 100%)" }} />
                </div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center px-6 max-w-lg">
                    <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                        <Plane className="h-12 w-12" style={{ color: "rgba(255,255,255,0.35)" }} />
                    </div>
                    <h1 className="font-display font-extrabold text-white mb-4 leading-tight" style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)" }}>
                        No trips yet
                    </h1>
                    <p className="font-body text-lg mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
                        Let Atlas AI craft your perfect itinerary. Unforgettable travel moments await.
                    </p>
                    <Link to="/create-new-trip">
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-bold text-base"
                            style={{ background: "white", color: "#07090f" }}>
                            <Sparkles className="h-5 w-5" />
                            Plan Your First Trip
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    /* ── Dashboard ── */
    return (
        <div style={{ background: "#07090f", minHeight: "100vh" }}>

            {/* ═══════════════════════════════════════
                HERO — Cinematic full-bleed
            ═══════════════════════════════════════ */}
            <div className="relative overflow-hidden" style={{ height: "100vh", minHeight: 620 }}>

                {/* Parallax BG */}
                <motion.div className="absolute inset-0" style={{ y: heroBgY }}>
                    <img
                        src={nextTrip ? getImg(nextTrip.destination) : HERO_BG}
                        alt="hero"
                        className="w-full h-full object-cover"
                        style={{ transform: "scale(1.10)" }}
                    />
                </motion.div>

                {/* Cinematic overlays */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(7,9,15,0.25) 0%, rgba(7,9,15,0.15) 40%, rgba(7,9,15,0.82) 75%, rgba(7,9,15,1) 100%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(7,9,15,0.68) 0%, transparent 55%)" }} />

                {/* Content — NOTE: only ONE style prop on motion.div */}
                <motion.div
                    className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24"
                    style={{ opacity: heroOpacity as unknown as number }}
                >
                    {/* Overline */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-5">
                        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.38)" }} />
                        <span className="font-body" style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                            My Adventures
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.75 }}
                        className="font-display font-extrabold text-white"
                        style={{ fontSize: "clamp(3rem, 7.5vw, 6.5rem)", lineHeight: 0.93, maxWidth: 680, marginBottom: 24 }}
                    >
                        {nextTrip ? (
                            <>Your Next<br /><span style={{ color: "rgba(255,255,255,0.40)" }}>Adventure</span><br />Awaits</>
                        ) : (
                            <>Unforgettable<br /><span style={{ color: "rgba(255,255,255,0.40)" }}>Journeys</span></>
                        )}
                    </motion.h1>

                    {/* Destination info */}
                    {nextTrip && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                            style={{ marginBottom: 36 }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                                <MapPin className="h-4 w-4" style={{ color: "rgba(255,255,255,0.50)" }} />
                                <span className="font-body" style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>{nextTrip.destination}</span>
                            </div>
                            <p className="font-body" style={{ color: "rgba(255,255,255,0.30)", fontSize: 13 }}>
                                {nextTrip.startDate && fmtDateFull(nextTrip.startDate)}
                                {nextTrip.endDate && ` – ${fmtDateFull(nextTrip.endDate)}`}
                                {nextTrip.budget && `  ·  ${nextTrip.budget}`}
                            </p>
                        </motion.div>
                    )}

                    {/* CTA Buttons */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                        className="flex items-center gap-4 flex-wrap">
                        {nextTrip && (
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => navigate(`/trip/${nextTrip.id}`)}
                                className="inline-flex items-center gap-2.5 font-body font-bold rounded-full"
                                style={{ background: "white", color: "#07090f", padding: "14px 28px", fontSize: 15 }}>
                                View Itinerary
                                <ArrowUpRight className="h-4 w-4" />
                            </motion.button>
                        )}
                        <Link to="/create-new-trip">
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2.5 font-body font-bold rounded-full"
                                style={{
                                    background: "rgba(255,255,255,0.10)",
                                    color: "white",
                                    border: "1px solid rgba(255,255,255,0.20)",
                                    backdropFilter: "blur(12px)",
                                    padding: "14px 28px",
                                    fontSize: 15
                                }}>
                                <Plus className="h-4 w-4" />
                                Plan New Trip
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Stats pills */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                        className="flex items-center gap-3 flex-wrap" style={{ marginTop: 44 }}>
                        {[
                            { value: trips.length, label: "Total Trips" },
                            { value: upcoming.length, label: "Upcoming" },
                            { value: past.length, label: "Completed" },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-2 rounded-full px-4 py-2"
                                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}>
                                <span className="font-display font-bold text-white" style={{ fontSize: 14 }}>{s.value}</span>
                                <span className="font-body" style={{ color: "rgba(255,255,255,0.40)", fontSize: 12 }}>{s.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute bottom-8 right-10 rounded-full flex items-center justify-center"
                    style={{ width: 40, height: 40, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    <ChevronRight className="h-4 w-4 text-white rotate-90" />
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                CAROUSEL
            ═══════════════════════════════════════ */}
            <div className="px-8 md:px-16 lg:px-24 py-16">

                {/* Header */}
                <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <p className="font-body mb-2" style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, letterSpacing: "0.20em", textTransform: "uppercase" }}>
                            All Trips · {trips.length}
                        </p>
                        <h2 className="font-display font-extrabold text-white" style={{ fontSize: 30 }}>Your Journeys</h2>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.28)" }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search trips…"
                                className="outline-none bg-transparent font-body text-white"
                                style={{
                                    paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                                    borderRadius: 999, fontSize: 14, width: 180,
                                    background: "rgba(255,255,255,0.07)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                }}
                            />
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-1 rounded-full p-1"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                            {(["all", "upcoming", "past"] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className="rounded-full font-body font-semibold capitalize"
                                    style={{
                                        padding: "6px 16px", fontSize: 12,
                                        background: filter === f ? "white" : "transparent",
                                        color: filter === f ? "#07090f" : "rgba(255,255,255,0.38)",
                                        transition: "all 0.15s"
                                    }}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Nav arrows */}
                        <div className="flex items-center gap-2">
                            <motion.button whileHover={{ scale: 1.10 }} whileTap={{ scale: 0.92 }}
                                onClick={() => scrollCarousel("left")}
                                className="rounded-full flex items-center justify-center"
                                style={{ width: 40, height: 40, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}>
                                <ChevronLeft className="h-4 w-4 text-white" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.10 }} whileTap={{ scale: 0.92 }}
                                onClick={() => scrollCarousel("right")}
                                className="rounded-full flex items-center justify-center"
                                style={{ width: 40, height: 40, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}>
                                <ChevronRight className="h-4 w-4 text-white" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Carousel scroll */}
                <AnimatePresence mode="wait">
                    {filtered.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20">
                            <Plane className="h-12 w-12 mb-4" style={{ color: "rgba(255,255,255,0.09)" }} />
                            <p className="font-body" style={{ color: "rgba(255,255,255,0.22)", fontSize: 15 }}>
                                {search ? `No trips matching "${search}"` : `No ${filter} trips`}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div ref={carouselRef} className="flex gap-5 overflow-x-auto pb-4"
                                style={{ scrollbarWidth: "none" }}>
                                {filtered.map((trip, i) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        index={i}
                                        now={now}
                                        menuOpen={menuOpen}
                                        setMenuOpen={setMenuOpen}
                                        onNavigate={() => navigate(`/trip/${trip.id}`)}
                                        onDelete={e => handleDelete(trip.id, e)}
                                        onToggle={e => handleTogglePublic(trip.id, e)}
                                    />
                                ))}

                                {/* Add trip card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: filtered.length * 0.04 + 0.1 }}
                                    className="flex-shrink-0 flex flex-col items-center justify-center rounded-3xl cursor-pointer group"
                                    style={{
                                        width: 280, height: 380,
                                        background: "rgba(255,255,255,0.025)",
                                        border: "1px dashed rgba(255,255,255,0.11)",
                                    }}
                                    whileHover={{ borderColor: "rgba(255,255,255,0.24)" } as any}
                                    onClick={() => navigate("/create-new-trip")}>
                                    <div className="flex items-center justify-center rounded-2xl mb-4 transition-all group-hover:scale-110"
                                        style={{ width: 52, height: 52, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
                                        <Plus className="h-6 w-6" style={{ color: "rgba(255,255,255,0.45)" }} />
                                    </div>
                                    <p className="font-body text-center" style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, lineHeight: 1.6, paddingLeft: 24, paddingRight: 24 }}>
                                        Plan new<br />adventure
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════
                BENTO GRID
            ═══════════════════════════════════════ */}
            <div className="px-8 md:px-16 lg:px-24 pb-24">
                <div className="grid grid-cols-12 gap-4">

                    {/* Featured next trip */}
                    {nextTrip && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="col-span-12 md:col-span-7 relative overflow-hidden rounded-3xl cursor-pointer group"
                            style={{ height: 340 }}
                            onClick={() => navigate(`/trip/${nextTrip.id}`)}>
                            <img src={getImg(nextTrip.destination)} alt=""
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(7,9,15,0.18) 0%, rgba(7,9,15,0.72) 100%)" }} />

                            {/* Top-left badge */}
                            <div className="absolute top-5 left-5">
                                <span className="inline-flex items-center gap-1.5 rounded-full font-body font-semibold text-white"
                                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.24)", padding: "6px 12px", fontSize: 12 }}>
                                    <Sparkles className="h-3 w-3" />
                                    Next Destination
                                </span>
                            </div>

                            {/* Top-right arrow */}
                            <div className="absolute top-5 right-5 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                                style={{ width: 40, height: 40, background: "white" }}>
                                <ArrowUpRight className="h-4 w-4" style={{ color: "#07090f" }} />
                            </div>

                            {/* Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-7">
                                <p className="font-body mb-1" style={{ color: "rgba(255,255,255,0.48)", fontSize: 14 }}>
                                    {getFlag(nextTrip.destination)} {nextTrip.destination}
                                </p>
                                <h3 className="font-display font-extrabold text-white leading-tight mb-4" style={{ fontSize: "clamp(1.4rem,3vw,2rem)" }}>
                                    {nextTrip.title}
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {nextTrip.startDate && (
                                        <div className="inline-flex items-center gap-1.5 rounded-full font-body text-white"
                                            style={{ background: "rgba(255,255,255,0.11)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.16)", padding: "6px 12px", fontSize: 12 }}>
                                            <Calendar className="h-3 w-3" />
                                            {fmtDate(nextTrip.startDate)}{nextTrip.endDate && ` – ${fmtDate(nextTrip.endDate)}`}
                                        </div>
                                    )}
                                    {nextTrip.budget && (
                                        <div className="inline-flex items-center gap-1.5 rounded-full font-body text-white"
                                            style={{ background: "rgba(255,255,255,0.11)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.16)", padding: "6px 12px", fontSize: 12 }}>
                                            <Wallet className="h-3 w-3" />
                                            {nextTrip.budget}
                                        </div>
                                    )}
                                    {nextTrip.startDate && nextTrip.endDate && (
                                        <div className="inline-flex items-center gap-1.5 rounded-full font-body text-white"
                                            style={{ background: "rgba(255,255,255,0.11)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.16)", padding: "6px 12px", fontSize: 12 }}>
                                            <Clock className="h-3 w-3" />
                                            {nights(nextTrip.startDate, nextTrip.endDate)} nights
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats */}
                    <div className={`col-span-12 ${nextTrip ? "md:col-span-5" : "md:col-span-12"}`}>
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {[
                                { icon: Plane, label: "Total Trips", value: trips.length, color: "#60A5FA" },
                                { icon: TrendingUp, label: "Upcoming", value: upcoming.length, color: "#34D399" },
                                { icon: Star, label: "Completed", value: past.length, color: "#F59E0B" },
                                { icon: Globe, label: "Destinations", value: new Set(trips.map(t => t.destination?.split(",").pop()?.trim())).size, color: "#F472B6" },
                            ].map((s, i) => (
                                <motion.div key={s.label}
                                    initial={{ opacity: 0, scale: 0.94 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 + i * 0.07 }}
                                    className="rounded-2xl p-5 flex flex-col justify-between"
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", minHeight: 130 }}>
                                    <div className="rounded-xl flex items-center justify-center mb-4"
                                        style={{ width: 36, height: 36, background: `${s.color}18` }}>
                                        <s.icon className="h-4 w-4" style={{ color: s.color }} />
                                    </div>
                                    <div>
                                        <div className="font-display font-extrabold text-white" style={{ fontSize: 38, lineHeight: 1 }}>{s.value}</div>
                                        <div className="font-body mt-1.5" style={{ color: "rgba(255,255,255,0.30)", fontSize: 12 }}>{s.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Past trips strip */}
                    {past.length >= 2 && past.slice(0, 3).map((trip, i) => (
                        <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.09 }}
                            className={`col-span-12 ${past.length >= 3 ? "md:col-span-4" : "md:col-span-6"} relative overflow-hidden rounded-2xl cursor-pointer group`}
                            style={{ height: 210 }}
                            onClick={() => navigate(`/trip/${trip.id}`)}>
                            <img src={getImg(trip.destination)} alt=""
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 25%, rgba(7,9,15,0.90) 100%)" }} />
                            <div className="absolute bottom-5 left-5 right-5">
                                <p className="font-display font-bold text-white mb-2 truncate" style={{ fontSize: 17 }}>{trip.title}</p>
                                {/* Voyare frosted glass location tag */}
                                <div className="inline-flex items-center gap-1.5 rounded-full font-body text-white"
                                    style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.20)", padding: "6px 12px", fontSize: 12 }}>
                                    <MapPin className="h-3 w-3" />
                                    {getFlag(trip.destination)} {trip.destination}
                                </div>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className="font-body rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", backdropFilter: "blur(8px)", padding: "4px 10px", fontSize: 10 }}>
                                    Visited
                                </span>
                            </div>
                        </motion.div>
                    ))}

                </div>
            </div>

        </div>
    );
};

/* ─────────────────────────────────────────
   TRIP CARD — Carousel item
───────────────────────────────────────── */
interface TripCardProps {
    trip: any;
    index: number;
    now: Date;
    menuOpen: string | null;
    setMenuOpen: (id: string | null) => void;
    onNavigate: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onToggle: (e: React.MouseEvent) => void;
}

const TripCard = ({ trip, index, now, menuOpen, setMenuOpen, onNavigate, onDelete, onToggle }: TripCardProps) => {
    const isUpcoming = trip.startDate && new Date(trip.startDate) >= now;
    const n = nights(trip.startDate, trip.endDate);

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 relative rounded-3xl overflow-hidden cursor-pointer group"
            style={{ width: 280, height: 380 }}
            whileHover={{ y: -7 }}
            onClick={onNavigate}
        >
            {/* Photo */}
            <img
                src={getImg(trip.destination)}
                alt={trip.destination}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,9,15,0.12) 0%, rgba(7,9,15,0.12) 30%, rgba(7,9,15,0.93) 100%)" }} />

            {/* Status + Menu */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <span className="rounded-full font-body font-semibold"
                    style={{
                        padding: "4px 10px", fontSize: 10,
                        ...(isUpcoming
                            ? { background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.24)" }
                            : { background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.50)", backdropFilter: "blur(8px)" }
                        )
                    }}>
                    {isUpcoming ? "● Upcoming" : "✓ Visited"}
                </span>

                {/* Kebab */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => setMenuOpen(menuOpen === trip.id ? null : trip.id)}
                        className="rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.20)" }}>
                        <MoreVertical className="h-3.5 w-3.5 text-white" />
                    </button>
                    <AnimatePresence>
                        {menuOpen === trip.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute right-0 top-9 rounded-2xl py-1.5 z-50 overflow-hidden"
                                style={{ width: 176, background: "rgba(12,15,24,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.11)", boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}>
                                <button onClick={onToggle}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-left hover:bg-white/5 transition-colors"
                                    style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                                    {trip.isPublic ? <><Lock className="h-3.5 w-3.5" />Make Private</> : <><Globe className="h-3.5 w-3.5" />Make Public</>}
                                </button>
                                <button onClick={e => { e.stopPropagation(); onNavigate(); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-left hover:bg-white/5 transition-colors"
                                    style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                                    <Eye className="h-3.5 w-3.5" />View Trip
                                </button>
                                <div style={{ margin: "4px 12px", height: 1, background: "rgba(255,255,255,0.07)" }} />
                                <button onClick={onDelete}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-left hover:bg-red-500/10 transition-colors"
                                    style={{ fontSize: 13, color: "rgba(248,113,113,0.80)" }}>
                                    <Trash2 className="h-3.5 w-3.5" />Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
                {/* Voyare frosted glass location tag */}
                <div className="inline-flex items-center gap-1.5 rounded-full font-body text-white mb-3"
                    style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.20)", padding: "6px 12px", fontSize: 12 }}>
                    <MapPin className="h-3 w-3" />
                    {getFlag(trip.destination)} {trip.destination}
                </div>
                <h3 className="font-display font-bold text-white leading-tight mb-3 line-clamp-2" style={{ fontSize: 17 }}>
                    {trip.title}
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        {trip.startDate && (
                            <div className="font-body" style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
                                {fmtDate(trip.startDate)}{trip.endDate && ` – ${fmtDate(trip.endDate)}`}
                            </div>
                        )}
                        {n > 0 && <div className="font-body mt-0.5" style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>{n} nights</div>}
                    </div>
                    {trip.budget && (
                        <span className="font-display font-bold text-white" style={{ fontSize: 14 }}>{trip.budget}</span>
                    )}
                </div>
            </div>

            {/* Hover overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(7,9,15,0.28)" }}>
                <div className="rounded-full flex items-center justify-center" style={{ width: 48, height: 48, background: "white" }}>
                    <ArrowUpRight className="h-5 w-5" style={{ color: "#07090f" }} />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MyTripsPage;
