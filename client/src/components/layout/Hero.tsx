import { Button } from '@/components/ui/button'
import { Sparkles, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const onStart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate('/create-new-trip');
    }

    return (
        <div className="relative min-h-[90vh] bg-[var(--color-ocean-900)] bg-gradient-hero flex flex-col justify-center overflow-hidden">
            {/* Background Decorative Assets */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <img 
                    src="/tripBackimg.webp" 
                    alt="Background Landscape" 
                    className="absolute bottom-0 left-0 w-full h-[100%] object-cover opacity-50"
                />
            </div>

            <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-12 pt-20 pb-32">
                <div className="max-w-[800px] mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                            <Sparkles className="w-4 h-4 text-[var(--color-lime-400)]" />
                            <span className="text-white text-[14px] font-body font-medium tracking-wide">
                                Atlas AI • Intelligent Travel Operating System
                            </span>
                        </div>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-[48px] md:text-[64px] font-display font-extrabold text-white leading-[1.1] tracking-tight mb-6"
                    >
                        Discover Your Next <br/> 
                        <span className="text-gradient-ai">Adventure with AI</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-[18px] md:text-[20px] font-body text-white/80 leading-relaxed mb-12 max-w-[600px] mx-auto"
                    >
                        Plan personalized itineraries, explore 3D maps, and book your dream vacation in seconds. Simply tell us where you want to go.
                    </motion.p>
                </div>

                {/* Floating Search Tab */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-[860px] mx-auto bg-white/10 backdrop-blur-[24px] border border-white/20 p-3 rounded-full shadow-float"
                >
                    <div className="bg-white rounded-full p-2 flex flex-col md:flex-row items-center gap-2">
                        {/* Destination Input */}
                        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-100">
                            <MapPin className="w-5 h-5 text-[var(--color-ocean-400)] flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                                <span className="text-[12px] font-body font-bold text-gray-800 uppercase tracking-wider">Where</span>
                                <input 
                                    type="text" 
                                    placeholder="Search destinations..." 
                                    className="w-full bg-transparent border-none p-0 text-[16px] font-body text-gray-900 placeholder:text-gray-400 focus:ring-0 h-6"
                                />
                            </div>
                        </div>

                        {/* Dates Input */}
                        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full">
                            <Calendar className="w-5 h-5 text-[var(--color-ocean-400)] flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                                <span className="text-[12px] font-body font-bold text-gray-800 uppercase tracking-wider">When</span>
                                <input 
                                    type="text" 
                                    placeholder="Add dates" 
                                    className="w-full bg-transparent border-none p-0 text-[16px] font-body text-gray-900 placeholder:text-gray-400 focus:ring-0 h-6"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="w-full md:w-auto mt-2 md:mt-0">
                            <Button 
                                onClick={onStart}
                                variant="ai" 
                                className="w-full md:w-auto h-[60px] rounded-full px-8 text-[16px]"
                            >
                                <Sparkles className="w-5 h-5 mr-2 text-gray-900" />
                                Start Planning
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Foreground Character/Asset if provided */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-0 right-10 md:right-32 pointer-events-none hidden lg:block"
                >
    
                </motion.div>
            </div>
            
            {/* Bottom Gradient Fade to next section */}
            <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
        </div>
    )
}

export default Hero
