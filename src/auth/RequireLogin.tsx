import React from "react";
import { useMe } from "./useMe";

export const RequireLogin = ({ children }: { children: React.ReactNode }) => {
    const { me, loading } = useMe();

    if (loading) return <div>Ładowanie...</div>;
    if (!me) {
        window.location.href = `/Login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`;
        return null;
    }

    return <>{children}</>;
};
