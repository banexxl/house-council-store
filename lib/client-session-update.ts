"use client";

import { useEffect, useRef } from "react";

export const useSessionUpdater = () => {
     const COOKIE_NAME = "sb-sorklznvftjmhkaejkej-auth-token-code-verifier";


     useEffect(() => {

          // Helper function to get the value of a specific cookie
          const getCookieValue = (name: string) => {
               const match = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(`${name}=`));
               return match ? match.split("=")[1] : undefined;
          };

          const prevCookieValue = useRef<string | null>(getCookieValue(COOKIE_NAME) ?? null);
          const checkCookieChange = () => {
               const currentCookieValue = getCookieValue(COOKIE_NAME);

               // Ensure the cookie was previously set and has now changed
               if (prevCookieValue.current !== null && currentCookieValue !== prevCookieValue.current) {
                    console.log(`Cookie "${COOKIE_NAME}" modified - reloading page`);
                    prevCookieValue.current = currentCookieValue ?? null;
                    window.location.reload();
               }

               // Update the ref to track changes (but not trigger reload on first set)
               if (prevCookieValue.current === null) {
                    prevCookieValue.current = currentCookieValue ?? null;
               }
          };

          // Start interval to check for cookie changes
          const cookieInterval = setInterval(checkCookieChange, 1000);

          return () => {
               clearInterval(cookieInterval);
          };
     }, []);
};

