import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
    id: string;
    email: string;
    name: string;
    planType?: string;
    subscriptionStatus?: string;
    freeTripsUsed?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
    refreshPlanStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data.user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const refreshPlanStatus = async () => {
        if (!token || !user) return;
        try {
            const res = await axios.get("/api/stripe/status", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser({
                ...user,
                planType: res.data.planType,
                subscriptionStatus: res.data.subscriptionStatus,
                freeTripsUsed: res.data.freeTripsUsed
            });
        } catch (error) {
            console.error("Failed to refresh plan status", error);
        }
    };

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, refreshPlanStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
