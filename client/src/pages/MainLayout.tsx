import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
    const location = useLocation();
    // Don't show header/footer on create-trip page (full-height layout)
    const isFullScreenApp = location.pathname === "/create-new-trip";

    return (
        <div className="min-h-screen flex flex-col">
            {!isFullScreenApp && <Header />}
            <main className="flex-1">
                <Outlet />
            </main>
            {!isFullScreenApp && <Footer />}
        </div>
    );
};

export default MainLayout;
