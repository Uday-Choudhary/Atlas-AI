import { motion } from "framer-motion";
import { DollarSign, Wallet, Crown } from "lucide-react";

const budgetOptions = [
    {
        label: "Budget",
        value: "Low",
        icon: <DollarSign className="h-6 w-6" />,
        description: "Hostels, street food, public transport",
        color: "from-emerald-400 to-green-500",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
    },
    {
        label: "Moderate",
        value: "Medium",
        icon: <Wallet className="h-6 w-6" />,
        description: "3-star hotels, restaurants, mixed transport",
        color: "from-blue-400 to-indigo-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
    },
    {
        label: "Luxury",
        value: "High",
        icon: <Crown className="h-6 w-6" />,
        description: "5-star hotels, fine dining, private transfers",
        color: "from-amber-400 to-orange-500",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
    },
];

interface BudgetSelectorProps {
    onSelect: (value: string) => void;
}

const BudgetSelector = ({ onSelect }: BudgetSelectorProps) => {
    return (
        <div className="flex flex-col gap-3 my-3">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Select your budget
            </p>
            {budgetOptions.map((option, i) => (
                <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onSelect(option.value)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${option.border} ${option.bg} hover:shadow-lg transition-all duration-300 cursor-pointer group text-left`}
                >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        {option.icon}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                            {option.label}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {option.description}
                        </p>
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default BudgetSelector;
