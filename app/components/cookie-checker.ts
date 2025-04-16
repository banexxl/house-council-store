"use client";

import { useEffect } from "react";

const COOKIE_NAME = "sb-sorklznvftjmhkaejkej-auth-token";
const COOKIE_NAME_0 = `${COOKIE_NAME}.0`;
const COOKIE_NAME_1 = `${COOKIE_NAME}.1`;
const COOKIE_NAME_2 = `${COOKIE_NAME}-code-verifier`;

const otherCookies = [COOKIE_NAME, COOKIE_NAME_0, COOKIE_NAME_1];
const POLLING_INTERVAL = 1000; // Check every 1 second

export function useCookieFocusChecker() {
     const getCookies = (): Record<string, string> => {
          return document.cookie.split("; ").reduce<Record<string, string>>((acc, cookie) => {
               const [name, value] = cookie.split("=");
               acc[name] = value;
               return acc;
          }, {});
     };

     const cookiesExist = (): boolean => {
          const cookies = getCookies();
          const hasCookie2 = COOKIE_NAME_2 in cookies;
          const hasOtherCookie = otherCookies.some((cookie) => cookie in cookies);
          return hasCookie2 && hasOtherCookie;
     };

     useEffect(() => {
          const hasOtpToken = typeof window !== "undefined" && window.location.hash.includes("token=");
          const initialCookiesPresent = cookiesExist();

          const handleCheck = () => {
               if (hasOtpToken) return; // 🔐 Prevent reload if token is in hash

               const cookiesNowPresent = cookiesExist();
               const hasReloadedForLogin = sessionStorage.getItem("reloadedForLogin");
               const hasReloadedForLogout = sessionStorage.getItem("reloadedForLogout");

               if (cookiesNowPresent && !initialCookiesPresent && !hasReloadedForLogin) {
                    sessionStorage.setItem("reloadedForLogin", "true");
                    sessionStorage.removeItem("reloadedForLogout");
                    window.location.reload();
               }

               if (!cookiesNowPresent && hasReloadedForLogin && !hasReloadedForLogout) {
                    sessionStorage.setItem("reloadedForLogout", "true");
                    sessionStorage.removeItem("reloadedForLogin");
                    window.location.reload();
               }
          };

          const handleFocus = () => handleCheck();
          const cookieInterval = setInterval(handleCheck, POLLING_INTERVAL);

          window.addEventListener("focus", handleFocus);

          return () => {
               window.removeEventListener("focus", handleFocus);
               clearInterval(cookieInterval);
          };
     }, []);

     return null;
};
