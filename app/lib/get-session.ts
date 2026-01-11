"use server";

import { User } from "@supabase/supabase-js";
import { useServerSideSupabaseAnonClient } from "./ss-supabase-anon-client";

function getAalFromJwt(accessToken?: string | null): "aal1" | "aal2" | null {
     if (!accessToken) return null;

     try {
          const payload = accessToken.split(".")[1];
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
          const json = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
          return (json?.aal ?? null) as any;
     } catch {
          return null;
     }
}

/**
 * Returns the session user ONLY when MFA is completed (AAL2).
 * If the user is signed in with password only (AAL1), returns null.
 */
export const getSessionUser = async (): Promise<User | null> => {
     const supabase = await useServerSideSupabaseAnonClient();

     // First read the session (needed for access_token -> aal)
     const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
     if (sessionErr || !sessionData.session) return null;

     const aal = getAalFromJwt(sessionData.session.access_token);
     if (aal !== "aal2") {
          // Not fully verified yet (TOTP not done)
          return null;
     }

     // Now it's safe to treat as "logged in"
     const { data: userData, error: userErr } = await supabase.auth.getUser();
     if (userErr) return null;

     return userData.user;
};
