"use client";

import { useEffect, useRef } from "react";

export const useSessionUpdater = (refreshSession: () => void) => {
     const COOKIE_TOKEN_CODE_VERIFIER = "sb-sorklznvftjmhkaejkej-auth-token-code-verifier";
     const COOKIE_TOKEN_NAME = "sb-sorklznvftjmhkaejkej-auth-token";

     const getCookieValue = (name: string) => {
          const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
          return match ? match.split("=")[1] : null;
     };

     const prevCookieValueRef = useRef({
          [COOKIE_TOKEN_CODE_VERIFIER]: getCookieValue(COOKIE_TOKEN_CODE_VERIFIER),
          [COOKIE_TOKEN_NAME]: getCookieValue(COOKIE_TOKEN_NAME),
     });

     useEffect(() => {
          const checkCookieChange = () => {
               const currentCookieValues = {
                    [COOKIE_TOKEN_CODE_VERIFIER]: getCookieValue(COOKIE_TOKEN_CODE_VERIFIER),
                    [COOKIE_TOKEN_NAME]: getCookieValue(COOKIE_TOKEN_NAME),
               };

               if (
                    (prevCookieValueRef.current[COOKIE_TOKEN_CODE_VERIFIER] !== currentCookieValues[COOKIE_TOKEN_CODE_VERIFIER]) ||
                    (prevCookieValueRef.current[COOKIE_TOKEN_NAME] !== currentCookieValues[COOKIE_TOKEN_NAME])
               ) {
                    console.log("Auth cookies changed, refreshing session...");
                    prevCookieValueRef.current = currentCookieValues;
                    refreshSession(); // Instead of reloading, update the session state
               }
          };

          // Polling every second (fallback)
          const cookieInterval = setInterval(checkCookieChange, 1000);

          // Detect visibility change
          const handleVisibilityChange = () => {
               if (!document.hidden) {
                    refreshSession();
               }
          };

          document.addEventListener("visibilitychange", handleVisibilityChange);

          return () => {
               clearInterval(cookieInterval);
               document.removeEventListener("visibilitychange", handleVisibilityChange);
          };
     }, [refreshSession]);
};
