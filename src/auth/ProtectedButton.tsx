import { Button } from "@/components/ui/button";
import { usePageAccess } from "./usePageAccess";

export const ProtectedButton = ({
                                    page,
                                    children,
                                    perm = "edit",
                                    ...props
                                }: any) => {
    const { canEdit } = usePageAccess(page);

    if (!canEdit) return null;

    return (
        <Button {...props}>
            {children}
        </Button>
    );
};
