import { useAccessContext } from "./AccessContext";

export const useAccess = (pageKey: string) => {
    const { access } = useAccessContext();
    return access[pageKey] || { view: false, read: false, edit: false };
};
