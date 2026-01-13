import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AUTH_API } from "./authConfig";

type AccessMap = Record<
    string,
    { view: boolean; read: boolean; edit: boolean }
>;

interface AccessContextType {
    me: any | null;
    access: AccessMap;
    loading: boolean;
}

const AccessContext = createContext<AccessContextType>({
    me: null,
    access: {},
    loading: true,
});

export const AccessProvider = ({ children }: { children: React.ReactNode }) => {
    const meQuery = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await fetch(AUTH_API.me, { credentials: "include" });
            return res.json();
        }
    });

    const accessQuery = useQuery({
        queryKey: ["access"],
        queryFn: async () => {
            const res = await fetch(AUTH_API.access, { credentials: "include" });
            return res.json();
        }
    });

    const loading = meQuery.isLoading || accessQuery.isLoading;

    return (
        <AccessContext.Provider
            value={{
                me: meQuery.data?.data || null,
                access: accessQuery.data?.pages || {},
                loading
            }}
        >
            {children}
        </AccessContext.Provider>
    );
};

export const useAccessContext = () => useContext(AccessContext);
