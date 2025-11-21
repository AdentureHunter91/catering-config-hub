import { Input } from "@/components/ui/input";
import { usePageAccess } from "./usePageAccess";

export const ProtectedInput = ({
                                   page,
                                   ...props
                               }: any) => {
    const { canEdit } = usePageAccess(page);

    return (
        <Input disabled={!canEdit} {...props} />
    );
};