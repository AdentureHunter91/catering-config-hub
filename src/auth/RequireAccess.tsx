import React from "react";
import { useAccess } from "./useAccess";

export const RequireAccess = ({
                                  page,
                                  children
                              }: {
    page: string;
    children: React.ReactNode;
}) => {
    const { view } = useAccess(page);

    if (!view) {
        return (
            <div style={{ padding: 32 }}>
                <h2>Brak dostępu</h2>
                <p>Nie posiadasz uprawnień do tej strony.</p>
            </div>
        );
    }

    return <>{children}</>;
};
