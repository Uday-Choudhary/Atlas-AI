import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripDurationSelectorProps {
    onSelect: (value: string) => void;
}

const TripDurationSelector = ({ onSelect }: TripDurationSelectorProps) => {
    const [days, setDays] = useState(3);

    const increment = () => setDays((d) => Math.min(d + 1, 30));
    const decrement = () => setDays((d) => Math.max(d - 1, 1));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-3"
        >
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                Trip duration
            </p>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={decrement}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <div className="text-center">
                        <span className="text-4xl font-bold text-gray-800 dark:text-white">
                            {days}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {days === 1 ? "day" : "days"}
                        </p>
                    </div>
                    <button
                        onClick={increment}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2">
                    {[2, 3, 5, 7, 14].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${days === d
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>

                <Button
                    onClick={() => onSelect(`${days} days`)}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                    Confirm {days} {days === 1 ? "day" : "days"}
                </Button>
            </div>
        </motion.div>
    );
};

export default TripDurationSelector;
