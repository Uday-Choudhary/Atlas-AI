import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import api from "@/lib/api";

const PricingPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) {
            window.location.href = "/login?redirect=/pricing";
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/api/stripe/checkout");
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error(error);
            alert("Failed to start checkout. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-sky-50)] py-20 px-4 md:px-8">
            <div className="max-w-[1000px] mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-[32px] md:text-[40px] font-display font-bold text-gray-900 mb-4">
                        Unlock Unlimited Travel Planning
                    </h1>
                    <p className="text-[16px] font-body text-gray-600 max-w-[500px] mx-auto">
                        Join Pro to generate unlimited AI-powered itineraries, access exclusive community tips, and export your plans directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="mb-8">
                            <h3 className="text-[20px] font-display font-bold text-gray-900 mb-2">Explorer</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[36px] font-bold text-gray-900">$0</span>
                                <span className="text-gray-500 font-body">/ forever</span>
                            </div>
                            <p className="text-[14px] text-gray-500 font-body mt-2">
                                Perfect for trying out Atlas AI.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {["2 AI-generated trips", "Basic destination insights", "Save your trips", "Standard support"].map((ft) => (
                                <li key={ft} className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-gray-600" />
                                    </div>
                                    <span className="font-body text-[15px] text-gray-700">{ft}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto">
                            <Button 
                                variant="outline" 
                                className="w-full rounded-xl py-6 font-bold text-[15px] border-gray-200 bg-gray-50 text-gray-500 cursor-default hover:bg-gray-50 hover:text-gray-500"
                            >
                                Your Current Plan
                            </Button>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-[var(--color-ocean-900)] rounded-3xl p-8 border border-[var(--color-ocean-800)] shadow-xl relative overflow-hidden text-white flex flex-col">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-[12px] font-bold backdrop-blur-md">
                                <Sparkles className="h-3 w-3 text-[var(--color-lime-400)]" />
                                Most Popular
                            </div>
                        </div>

                        <div className="mb-8 relative z-10">
                            <h3 className="text-[20px] font-display font-bold text-white mb-2">Atlas Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[36px] font-bold text-white">$9.99</span>
                                <span className="text-[var(--color-ocean-300)] font-body">/ month</span>
                            </div>
                            <p className="text-[14px] text-[var(--color-ocean-200)] font-body mt-2">
                                Unlimited planning for frequent travelers.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 relative z-10 flex-1">
                            {["Unlimited AI trips", "Advanced route optimization", "Export to PDF & Calendar", "Priority community access"].map((ft) => (
                                <li key={ft} className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--color-lime-400)] flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3 w-3 text-gray-900" />
                                    </div>
                                    <span className="font-body text-[15px] text-white">{ft}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto relative z-10">
                            <Button 
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full rounded-xl py-6 font-bold text-[15px] bg-[var(--color-lime-400)] text-gray-900 hover:bg-[var(--color-lime-500)] shadow-glass transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" /> Upgrade to Pro
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Background flare */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-br from-[var(--color-ocean-500)] to-[var(--color-ocean-700)] rounded-full blur-[80px] opacity-50 z-0"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
