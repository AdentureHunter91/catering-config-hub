import { useAccessContext } from "./AccessContext";

export const usePageAccess = (pageKey: string) => {
    const { access } = useAccessContext();

    const page = access[pageKey] || {
        view: false,
        read: false,
        edit: false,
    };

    return {
        canView: page.view === true,
        canRead: page.read === true,
        canEdit: page.edit === true,
    };
};