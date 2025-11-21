import { ReactNode } from "react";
import { usePageAccess } from "./usePageAccess";

export const ProtectedWrapper = ({
                                     page,
                                     children,
                                 }: {
    page: string;
    children: ReactNode;
}) => {
    const { canEdit } = usePageAccess(page);

    if (canEdit) return <>{children}</>;

    return (
        <div style={{ opacity: 0.6, pointerEvents: "none" }}>
            {children}
        </div>
    );
};