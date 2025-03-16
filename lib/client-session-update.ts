"use client";

import { useEffect, useRef } from "react";

export const useSessionUpdater = () => {
     const COOKIE_NAME = "sb-sorklznvftjmhkaejkej-auth-token-code-verifier";
     const prevCookieValue = useRef<string | null>(null);

     useEffect(() => {
          const getCookieValue = (name: string) => {
               if (!name || name === "") return undefined;
               const match = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(`${name}=`));
               return match ? match.split("=")[1] : undefined;
          };

          prevCookieValue.current = getCookieValue(COOKIE_NAME) ?? null;

          const handleStorageChange = () => {
               const currentCookieValue = getCookieValue(COOKIE_NAME);

               if (
                    prevCookieValue.current !== null &&
                    currentCookieValue !== prevCookieValue.current &&
                    currentCookieValue !== ""
               ) {
                    console.log(`Cookie "${COOKIE_NAME}" modified - reloading page`);
                    prevCookieValue.current = currentCookieValue ?? null;
                    window.location.reload();
               }
          };

          window.addEventListener("storage", handleStorageChange);

          return () => {
               window.removeEventListener("storage", handleStorageChange);
          };
     }, []);
};
