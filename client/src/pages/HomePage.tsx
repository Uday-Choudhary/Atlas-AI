import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Map, Calendar, Plane, ShieldCheck } from "lucide-react";
import Hero from "../components/layout/Hero";
import { AppleCardsCarouselDemo } from "../components/ui/apple-cards-carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            <Hero />

            {/* 9.3 AI Features Showcase (The "Magic" Section) */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="max-w-[1280px] mx-auto px-4 md:px-12 relative z-10">
                    <div className="text-center mb-16 max-w-[700px] mx-auto">
                        <h2 className="text-[36px] md:text-[42px] font-display font-bold text-gray-900 leading-tight mb-4">
                            Intelligent Planning, <br className="hidden md:block"/>
                            <span className="text-[var(--color-ocean-600)]">Effortless Execution</span>
                        </h2>
                        <p className="text-[16px] md:text-[18px] font-body text-gray-500 leading-relaxed">
                            Atlas AI doesn't just give you a list of links. It builds a complete, day-by-day itinerary optimized for travel time, pacing, and your unique preferences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div 
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-full bg-[var(--color-sky-50)] flex items-center justify-center mb-6">
                                <Sparkles className="h-6 w-6 text-[var(--color-ocean-500)]" />
                            </div>
                            <h3 className="text-[20px] font-display font-bold text-gray-900 mb-3">
                                Generative AI Itineraries
                            </h3>
                            <p className="text-[15px] font-body text-gray-500 leading-relaxed mb-6">
                                Tell us your vibe, budget, and destination. In seconds, we generate a highly detailed, realistic schedule factoring in travel times.
                            </p>
                            <ul className="space-y-2">
                                {["Personalized pacing", "Hidden gems included", "Real-time adjustments"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[14px] font-body text-gray-600">
                                        <CheckCircle2 className="h-4 w-4 text-[var(--color-lime-500)]" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div 
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-full bg-[var(--color-sky-50)] flex items-center justify-center mb-6">
                                <Map className="h-6 w-6 text-[var(--color-ocean-500)]" />
                            </div>
                            <h3 className="text-[20px] font-display font-bold text-gray-900 mb-3">
                                3D Mapbox Integrations
                            </h3>
                            <p className="text-[15px] font-body text-gray-500 leading-relaxed mb-6">
                                Visualize your entire trip on a gorgeous 3D map. See exactly where your hotels and activities are located before you go.
                            </p>
                            <ul className="space-y-2">
                                {["Interactive 3D buildings", "Optimized routing", "Location-aware recommendations"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[14px] font-body text-gray-600">
                                        <CheckCircle2 className="h-4 w-4 text-[var(--color-lime-500)]" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div 
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-full bg-[var(--color-sky-50)] flex items-center justify-center mb-6">
                                <Calendar className="h-6 w-6 text-[var(--color-ocean-500)]" />
                            </div>
                            <h3 className="text-[20px] font-display font-bold text-gray-900 mb-3">
                                Unified Booking Hub
                            </h3>
                            <p className="text-[15px] font-body text-gray-500 leading-relaxed mb-6">
                                Say goodbye to having 50 browser tabs open. View your flights, accommodations, and activities in a single dashboard.
                            </p>
                            <ul className="space-y-2">
                                {["Smart budget tracking", "Export to calendar", "Share with friends"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[14px] font-body text-gray-600">
                                        <CheckCircle2 className="h-4 w-4 text-[var(--color-lime-500)]" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Explore Destinations - Keep existing carousel */}
            <section className="py-20 bg-white">
                <div className="max-w-[1280px] mx-auto px-4 md:px-12 text-center mb-8">
                    <h2 className="text-[32px] md:text-[36px] font-display font-bold text-gray-900">
                        Popular Destinations
                    </h2>
                    <p className="text-[16px] font-body text-gray-500 mt-2">
                        Get inspired by trending locations around the globe.
                    </p>
                </div>
                <AppleCardsCarouselDemo />
            </section>

            {/* 9.4 Social Proof & Testimonials */}
            <section className="py-24 bg-[var(--color-ocean-50)]">
                <div className="max-w-[1280px] mx-auto px-4 md:px-12 text-center">
                    <h2 className="text-[32px] md:text-[36px] font-display font-bold text-[var(--color-ocean-900)] mb-12">
                        Loved by thousands of travelers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {[
                            { name: "Sarah Jenkins", role: "Solo Backpacker", text: "Atlas AI saved me at least 15 hours of planning for my Europe trip. The map integration is brilliant, it exactly showed how far things were!" },
                            { name: "The Miller Family", role: "Family Vacationers", text: "We needed a relaxing 7-day trip to Hawaii that kept two toddlers entertained but also gave us some beach time. The AI nailed the balance perfectly." },
                            { name: "David Kim", role: "Business Traveler", text: "I often have 2 free days after a conference in a new city. I just pop the city into Atlas, specify my free hours, and I get a realistic mini-tour instantly." }
                        ].map((review, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                                <div className="flex text-amber-400 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    ))}
                                </div>
                                <p className="text-[15px] font-body text-gray-600 leading-relaxed mb-6 italic">
                                    "{review.text}"
                                </p>
                                <div className="flex flex-col">
                                    <span className="font-display font-bold text-gray-900">{review.name}</span>
                                    <span className="text-[13px] font-body text-gray-500">{review.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9.5 Call to Action */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-ai opacity-10" />
                <div className="max-w-[800px] mx-auto px-4 text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-lime-100)] flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Plane className="h-10 w-10 text-[var(--color-lime-700)]" />
                    </div>
                    <h2 className="text-[40px] md:text-[48px] font-display font-extrabold text-gray-900 mb-6 leading-tight">
                        Ready to pack your bags?
                    </h2>
                    <p className="text-[18px] font-body text-gray-600 mb-10 max-w-[600px] mx-auto">
                        Stop spending weeks reading blogs and reviews. Get a complete, optimized itinerary in less than 60 seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/create-new-trip">
                            <Button variant="ai" className="h-[60px] px-8 text-[16px] w-full sm:w-auto shadow-ai">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Start Planning for Free
                            </Button>
                        </Link>
                        <Link to="/community">
                            <Button variant="outline" className="h-[60px] px-8 text-[16px] w-full sm:w-auto bg-white">
                                View Community Trips
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Generate up to 3 trips free</span>
                    </div>
                </div>
            </section>

        </div>
    );
}
