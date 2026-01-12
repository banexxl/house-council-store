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
 * Returns user if:
 *  - session is AAL2 (MFA completed), OR
 *  - session is AAL1 and user has NO verified TOTP factor enrolled
 *
 * Returns null if:
 *  - no session, OR
 *  - AAL1 + verified TOTP exists (user must complete OTP first)
 */
export const getSessionUser = async (): Promise<User | null> => {
     const supabase = await useServerSideSupabaseAnonClient();

     const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
     if (sessionErr || !sessionData.session) return null;

     const aal = getAalFromJwt(sessionData.session.access_token);

     // If already AAL2 -> logged in
     if (aal === "aal2") {
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (userErr) return null;
          return userData.user;
     }

     // AAL1: only treat as logged in if user has NO verified TOTP factor
     const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();

     // If we can't check factors, choose safe behavior:
     // - return null (strict, prevents accidental access)
     // - OR return user (lenient, prevents false logouts)
     // I'd keep it strict:
     if (factorsErr) return null;

     const hasVerifiedTotp = !!factorsData?.totp?.some((f) => f.status === "verified");

     if (hasVerifiedTotp) {
          // MFA enrolled but not completed this session
          return null;
     }

     // No MFA enrolled -> logged in even with AAL1
     const { data: userData, error: userErr } = await supabase.auth.getUser();
     if (userErr) return null;

     return userData.user;
};
