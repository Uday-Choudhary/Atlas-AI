import { Link } from "react-router-dom";
import { Github, Twitter, Mail, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[var(--color-ocean-900)] border-t border-white/10 pt-16 pb-8">
            <div className="max-w-[1280px] mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-lime-400)] flex items-center justify-center shadow-ai">
                                <MapPin className="h-5 w-5 text-gray-900" />
                            </div>
                            <h2 className="font-display font-bold text-[24px] text-white tracking-tight">
                                Atlas<span className="text-[var(--color-lime-400)]">AI</span>
                            </h2>
                        </Link>
                        <p className="text-[15px] font-body text-white/60 max-w-sm leading-relaxed">
                            Your intelligent Travel Operating System. Plan trips with generative AI, visualize routes on 3D maps, and sync everything to your calendar instantly.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-[14px] font-display font-bold text-white mb-6 uppercase tracking-wider">
                            Platform
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { name: "Create Trip", path: "/create-new-trip" },
                                { name: "Community", path: "/community" },
                                { name: "My Trips", path: "/my-trips" },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-[14px] font-body text-white/60 hover:text-[var(--color-lime-400)] transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-[14px] font-display font-bold text-white mb-6 uppercase tracking-wider">
                            Connect
                        </h4>
                        <div className="flex gap-4">
                            {[
                                { icon: <Github className="h-5 w-5" />, href: "#" },
                                { icon: <Twitter className="h-5 w-5" />, href: "#" },
                                { icon: <Mail className="h-5 w-5" />, href: "#" },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-[var(--color-lime-400)] hover:text-gray-900 hover:border-transparent transition-all"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[13px] font-body text-white/40">
                        © {new Date().getFullYear()} Atlas AI Travel Operating System. All rights reserved.
                    </p>
                    <p className="text-[13px] font-body text-white/40">
                        Built with ❤️ using React, Express & Gemini AI
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
