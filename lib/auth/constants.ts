// Cookie names for the BFF session. Kept dependency-free (no `server-only`, no
// `next/headers`) so this module is safe to import from the Edge middleware as
// well as from server-only code.
export const ACCESS_COOKIE = "wt_access";
export const REFRESH_COOKIE = "wt_refresh";
