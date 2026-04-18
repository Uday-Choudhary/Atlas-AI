import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CircleCheckBig, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const navigate = useNavigate();
    const { refreshPlanStatus } = useAuth();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            navigate("/");
            return;
        }

        const verifySubscription = async () => {
            // Give stripe webhook a second to process and update our DB
            setTimeout(async () => {
                await refreshPlanStatus();
                setVerifying(false);
            }, 3000);
        };

        verifySubscription();
    }, [sessionId, navigate, refreshPlanStatus]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[var(--color-sky-50)] px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                {verifying ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-sky-50)] flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-[var(--color-ocean-500)] animate-spin" />
                        </div>
                        <h2 className="text-[24px] font-display font-bold text-gray-900 mb-2">
                            Verifying your payment...
                        </h2>
                        <p className="text-gray-500 font-body">
                            Please wait while we set up your Pro account.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                            <CircleCheckBig className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-[28px] font-display font-bold text-gray-900 mb-4">
                            You're all set!
                        </h2>
                        <p className="text-gray-500 font-body mb-8">
                            Thank you for upgrading to Atlas Pro. You now have unlimited access to AI trip generation.
                        </p>
                        <Button 
                            onClick={() => navigate("/create-new-trip")}
                            className="w-full bg-[var(--color-ocean-600)] hover:bg-[var(--color-ocean-700)] rounded-xl py-6 text-[15px] shadow-sm"
                        >
                            Start Planning
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessPage;
