import { useAccessContext } from "./AccessContext";

export const useMe = () => {
    const { me, loading } = useAccessContext();
    return { me, loading };
};
