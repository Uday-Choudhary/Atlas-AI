import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BudgetSelector from "./BudgetSelector";
import GroupSizeSelector from "./GroupSizeSelector";
import TripDurationSelector from "./TripDurationSelector";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type Message = {
    role: string;
    content: string;
    ui?: string;
};

interface ChatBoxProps {
    onTripGenerated?: (tripData: any) => void;
}

const ChatBox = ({ onTripGenerated }: ChatBoxProps) => {
    const { refreshPlanStatus } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || loading) return;
        setLoading(true);

        const newMessage: Message = { role: "user", content };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setUserInput("");

        try {
            const token = localStorage.getItem("token");
            const result = await axios.post("/api/chat", {
                messages: updatedMessages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = result.data;

            if (data?.trip_plan) {
                await refreshPlanStatus();
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "✨ Your trip plan is ready! Check the preview on the right.",
                        ui: "Final",
                    },
                ]);
                onTripGenerated?.(data);
            } else {
                const aiResp = data?.resp || "I didn't understand that. Could you try again?";
                const uiComponent = data?.ui || null;
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: aiResp, ui: uiComponent },
                ]);
            }
        } catch (error) {
            console.error(error);
            const axiosError = error as any;
            const status = axiosError.response?.status;
            const errorMessage =
                status === 402
                    ? axiosError.response?.data?.message || "You have used your 2 free AI trips. Upgrade to keep planning."
                    : status === 429
                    ? axiosError.response?.data?.error || "AI quota exhausted. Wait a minute."
                    : "Sorry, something went wrong. Please try again.";

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: errorMessage },
            ]);

            if (status === 402) {
                setTimeout(() => navigate("/pricing"), 900);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUISelect = (value: string) => {
        sendMessage(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(userInput);
        }
    };

    const renderUIComponent = (ui: string | undefined) => {
        if (!ui) return null;
        switch (ui.toLowerCase()) {
            case "budget":
                return <BudgetSelector onSelect={handleUISelect} />;
            case "groupsize":
                return <GroupSizeSelector onSelect={handleUISelect} />;
            case "tripduration":
                return <TripDurationSelector onSelect={handleUISelect} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-[85vh] flex flex-col glass-ai overflow-hidden shadow-glass relative">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--color-sky-200)] flex items-center justify-between bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[var(--color-ocean-600)]" />
                    <h3 className="font-display font-semibold text-[16px] text-gray-900">Atlas AI</h3>
                </div>
                <div className="bg-[var(--color-lime-400)] text-gray-900 px-3 py-1 rounded-full text-[12px] font-bold shadow-ai flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Powered by AI
                </div>
            </div>

            {/* Messages Area */}
            <section className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center gap-4 mt-12"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-ai">
                            <Sparkles className="h-8 w-8 text-gray-900" />
                        </div>
                        <div>
                            <h3 className="text-[20px] font-display font-bold text-gray-900">
                                Where to next?
                            </h3>
                            <p className="text-[15px] font-body text-gray-500 max-w-[280px] mx-auto mt-2 leading-relaxed">
                                Tell me your dream destination, and I'll craft the perfect itinerary.
                            </p>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                    <Sparkles className="h-4 w-4 text-gray-900" />
                                </div>
                            )}
                            <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`px-[16px] py-[12px] text-[15px] font-body leading-relaxed max-w-full overflow-hidden ${
                                        msg.role === "user"
                                            ? "bg-[var(--color-ocean-600)] text-white rounded-2xl rounded-tr-sm shadow-sm"
                                            : "bg-[var(--color-sky-50)] text-[var(--color-ocean-900)] border border-[var(--color-sky-100)] rounded-2xl rounded-tl-sm shadow-sm"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === "assistant" && index === messages.length - 1 && renderUIComponent(msg.ui)}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                            <Sparkles className="h-4 w-4 text-gray-900" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-[var(--color-sky-50)] border border-[var(--color-sky-100)] shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-[var(--color-ocean-500)] rounded-full animate-ai-bounce" />
                                <span className="w-2 h-2 bg-[var(--color-ocean-500)] rounded-full animate-ai-bounce animation-delay-200" />
                                <span className="w-2 h-2 bg-[var(--color-ocean-500)] rounded-full animate-ai-bounce animation-delay-400" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </section>

            {/* Quick Actions (only when empty) */}
            {messages.length === 0 && (
                <div className="px-4 pb-0 flex overflow-x-auto gap-2 no-scrollbar mb-2">
                    {["Plan a trip to Bali 🌴", "Weekend in Paris 🥐", "Tokyo for 5 days 🍣", "Budget trip to Goa 💰"].map((s) => (
                        <button
                            key={s}
                            onClick={() => sendMessage(s.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim())}
                            className="whitespace-nowrap px-4 py-2 text-[13px] font-body rounded-full bg-[var(--color-sky-100)] text-[var(--color-ocean-700)] hover:bg-[var(--color-sky-200)] transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <section className="p-4 bg-white/70 backdrop-blur-md border-t border-[var(--color-sky-100)]">
                <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:border-[var(--color-ocean-400)] focus-within:ring-2 focus-within:ring-ocean-100 overflow-hidden pr-2">
                    <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 shadow-none text-[15px] font-body px-5 py-4 h-[56px] text-gray-900 placeholder:text-gray-400"
                        placeholder="Type your message..."
                        onChange={(e) => setUserInput(e.target.value)}
                        value={userInput}
                        disabled={loading}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        size="icon"
                        variant={"default"}
                        className="rounded-full w-10 h-10 flex-shrink-0"
                        onClick={() => sendMessage(userInput)}
                        disabled={loading || !userInput.trim()}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 ml-0.5" />
                        )}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default ChatBox;
