import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, MapPin, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Home", path: "/" },
    { name: "My Trips", path: "/my-trips", auth: true },
    { name: "Community", path: "/community" },
    { name: "Pricing", path: "/pricing" },
];

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            style={{
                background: scrolled ? "rgba(7,9,15,0.82)" : "transparent",
                backdropFilter: scrolled ? "blur(18px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
            }}
        >
            <div className="max-w-[1280px] mx-auto px-4 md:px-12">
                <div className="flex justify-between items-center h-[72px]">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <MapPin className="h-6 w-6 text-white" />
                        <h2 className="font-display font-bold text-[22px] tracking-tight text-white">
                            Atlas<span style={{ color: "rgba(255,255,255,0.55)" }}>AI</span>
                        </h2>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks
                            .filter((link) => !link.auth || user)
                            .map((link) => (
                                <Link key={link.path} to={link.path} className="relative py-1">
                                    <span
                                        className="font-body text-[15px] font-medium transition-colors"
                                        style={{ color: isActive(link.path) ? "white" : "rgba(255,255,255,0.60)" }}
                                        onMouseEnter={e => (e.currentTarget.style.color = "white")}
                                        onMouseLeave={e => (e.currentTarget.style.color = isActive(link.path) ? "white" : "rgba(255,255,255,0.60)")}
                                    >
                                        {link.name}
                                    </span>
                                    {isActive(link.path) && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute left-0 right-0 h-[2px]"
                                            style={{ bottom: -18, background: "white" }}
                                        />
                                    )}
                                </Link>
                            ))}
                    </nav>

                    {/* Right side Actions */}
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        className="font-body font-semibold rounded-full"
                                        style={{ padding: "8px 20px", fontSize: 14, color: "rgba(255,255,255,0.70)", background: "transparent" }}
                                    >
                                        Sign In
                                    </motion.button>
                                </Link>
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        className="inline-flex items-center gap-2 font-body font-bold rounded-full"
                                        style={{ padding: "9px 22px", fontSize: 14, background: "white", color: "#07090f" }}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Start Planning
                                    </motion.button>
                                </Link>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/create-new-trip">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        className="inline-flex items-center gap-2 font-body font-bold rounded-full"
                                        style={{ padding: "9px 22px", fontSize: 14, background: "white", color: "#07090f" }}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Create Trip
                                    </motion.button>
                                </Link>
                                {user.planType === "free" && (
                                    <Link to="/pricing">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            className="inline-flex items-center gap-1 font-body font-bold rounded-full border border-[rgba(255,255,255,0.2)]"
                                            style={{ padding: "8px 16px", fontSize: 13, background: "transparent", color: "white" }}
                                        >
                                            <Zap className="w-3 h-3 text-[var(--color-lime-400)]" />
                                            Upgrade
                                        </motion.button>
                                    </Link>
                                )}

                                {/* User Avatar */}
                                <div className="relative group">
                                    <button
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] transition-all relative"
                                        style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
                                    >
                                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        {user.planType === "pro" && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-lime-400)] border-2 border-[var(--color-ocean-900)] rounded-full flex items-center justify-center">
                                                <Sparkles className="w-2.5 h-2.5 text-black" />
                                            </span>
                                        )}
                                    </button>
                                    {/* Dropdown */}
                                    <div
                                        className="absolute right-0 top-12 rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                                        style={{ width: 192, background: "rgba(12,15,24,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 50px rgba(0,0,0,0.50)" }}
                                    >
                                        <div className="px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                            <p className="text-[14px] font-body font-semibold truncate" style={{ color: "rgba(255,255,255,0.90)" }}>
                                                {user.name || user.email}
                                            </p>
                                            <p className="text-[12px] font-body truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <Link
                                            to="/my-trips"
                                            className="block px-4 py-2.5 text-[14px] font-body transition-colors hover:bg-white/5"
                                            style={{ color: "rgba(255,255,255,0.65)" }}
                                        >
                                            My Trips
                                        </Link>
                                        <button
                                            onClick={() => logout()}
                                            className="w-full text-left px-4 py-2.5 text-[14px] font-body transition-colors hover:bg-red-500/10"
                                            style={{ color: "rgba(248,113,113,0.80)" }}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 rounded-xl transition-colors"
                            style={{ color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.08)" }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-[72px] left-0 right-0 h-screen bg-[var(--color-ocean-900)] overflow-hidden"
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex-1 px-6 py-8 flex flex-col">
                                {navLinks
                                    .filter((link) => !link.auth || user)
                                    .map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block w-full py-4 text-[20px] font-display font-semibold border-b border-white/10 ${
                                                isActive(link.path) ? "text-[var(--color-lime-400)]" : "text-white"
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}

                                {!user && (
                                     <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full py-4 text-[20px] font-display font-semibold border-b border-white/10 text-white"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>

                            <div className="p-6 pb-32">
                                {!user ? (
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            className="w-full inline-flex items-center justify-center gap-2 font-body font-bold rounded-full"
                                            style={{ padding: "14px 28px", fontSize: 16, background: "white", color: "#07090f" }}
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Start Planning
                                        </motion.button>
                                    </Link>
                                ) : (
                                    <div className="space-y-4">
                                        <Link to="/create-new-trip" onClick={() => setMobileMenuOpen(false)}>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                className="w-full inline-flex items-center justify-center gap-2 font-body font-bold rounded-full"
                                                style={{ padding: "14px 28px", fontSize: 16, background: "white", color: "#07090f" }}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Create Trip
                                            </motion.button>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full py-4 text-[16px] font-body font-medium text-white/70 hover:text-white"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
