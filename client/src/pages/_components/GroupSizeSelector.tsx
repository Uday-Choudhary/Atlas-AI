import { motion } from "framer-motion";
import { User, Heart, Users, PartyPopper } from "lucide-react";

const groupOptions = [
    {
        label: "Solo",
        value: "Solo",
        icon: <User className="h-6 w-6" />,
        emoji: "🧑",
        color: "from-violet-400 to-purple-500",
    },
    {
        label: "Couple",
        value: "Couple",
        icon: <Heart className="h-6 w-6" />,
        emoji: "💑",
        color: "from-pink-400 to-rose-500",
    },
    {
        label: "Family",
        value: "Family",
        icon: <Users className="h-6 w-6" />,
        emoji: "👨‍👩‍👧‍👦",
        color: "from-sky-400 to-blue-500",
    },
    {
        label: "Friends",
        value: "Friends",
        icon: <PartyPopper className="h-6 w-6" />,
        emoji: "🎉",
        color: "from-orange-400 to-amber-500",
    },
];

interface GroupSizeSelectorProps {
    onSelect: (value: string) => void;
}

const GroupSizeSelector = ({ onSelect }: GroupSizeSelectorProps) => {
    return (
        <div className="my-3">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                Who's traveling?
            </p>
            <div className="grid grid-cols-2 gap-3">
                {groupOptions.map((option, i) => (
                    <motion.button
                        key={option.value}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => onSelect(option.value)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                            <span className="text-2xl">{option.emoji}</span>
                        </div>
                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                            {option.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default GroupSizeSelector;
