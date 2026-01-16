import React from "react";
import { useMe } from "./useMe";
import { buildAuthUrl } from "@/api/apiBase";

export const RequireLogin = ({ children }: { children: React.ReactNode }) => {
    const { me, loading } = useMe();

    if (loading) return <div>Ładowanie...</div>;
    if (!me) {
        // Redirect to login, po zalogowaniu wróć do dashboard zamiast bieżącej strony
        const returnUrl = window.location.origin + "/dashboard";
        window.location.href = buildAuthUrl(
            `Login?returnUrl=${encodeURIComponent(returnUrl)}`
        );
        return null;
    }

    return <>{children}</>;
};
