import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, MapPin, Sparkles } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("/api/auth/login", { email, password });
            login(res.data.token, res.data.user);
            navigate("/");
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 bg-gradient-to-br from-[var(--color-ocean-50)] to-[var(--color-sky-100)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="p-8 bg-white rounded-3xl shadow-float border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <MapPin className="h-5 w-5 text-[var(--color-ocean-600)]" />
                            <span className="font-display font-bold text-[20px] text-gray-900">
                                Atlas<span className="text-[var(--color-ocean-600)]">AI</span>
                            </span>
                        </Link>
                        <h2 className="text-[30px] font-display font-bold text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="text-[15px] font-body text-gray-500 mt-2">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-xl mb-4"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[12px] font-body font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ocean-400)]" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-ocean-300)] focus:border-[var(--color-ocean-500)] outline-none transition-all bg-white text-[15px] font-body text-gray-900"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-body font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ocean-400)]" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-ocean-300)] focus:border-[var(--color-ocean-500)] outline-none transition-all bg-white text-[15px] font-body text-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            variant="ai"
                            className="w-full shadow-ai"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2 text-gray-900">
                                    <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Sparkles className="h-4 w-4" />
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-[14px] font-body text-gray-500 mt-6">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-[var(--color-ocean-600)] font-semibold hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
