import { buildAuthUrl } from "@/api/apiBase";

export const AUTH_API = {
    me: buildAuthUrl("Login/me.php"),
    access: buildAuthUrl("Login/access.php"),
};
