import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./pages/MainLayout";
import HomePage from "./pages/HomePage";
import CreateNewTripPage from "./pages/CreateNewTripPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyTripsPage from "./pages/MyTripsPage";
import TripDetailPage from "./pages/TripDetailPage";
import CommunityPage from "./pages/CommunityPage";
import PricingPage from "./pages/PricingPage";
import SuccessPage from "./pages/SuccessPage";

/**
 * Protected route wrapper — redirects to login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/trip/:id" element={<TripDetailPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/success" element={<SuccessPage />} />
                        <Route path="/success/*" element={<SuccessPage />} /> {/* Catch-all for success to handle query params defensively */}

                        {/* Protected routes */}
                        <Route
                            path="/create-new-trip"
                            element={
                                <ProtectedRoute>
                                    <CreateNewTripPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-trips"
                            element={
                                <ProtectedRoute>
                                    <MyTripsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
