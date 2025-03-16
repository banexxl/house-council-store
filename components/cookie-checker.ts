"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "sb-sorklznvftjmhkaejkej-auth-token";
const COOKIE_NAME_0 = `${COOKIE_NAME}.0`;
const COOKIE_NAME_1 = `${COOKIE_NAME}.1`;
const COOKIE_NAME_2 = `sb-sorklznvftjmhkaejkej-auth-token-code-verifier`;

const otherCookies = [COOKIE_NAME, COOKIE_NAME_0, COOKIE_NAME_1]; // At least one must be present
const POLLING_INTERVAL = 1000; // Check for cookie changes every second

export const CheckCookiesOnFocus = () => {
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
          const handleCheck = () => {
               const cookiesNowPresent = cookiesExist();
               const hasReloadedForLogin = sessionStorage.getItem("reloadedForLogin");
               const hasReloadedForLogout = sessionStorage.getItem("reloadedForLogout");

               // First reload when cookies appear (Login)
               if (cookiesNowPresent && !hasReloadedForLogin) {
                    sessionStorage.setItem("reloadedForLogin", "true");
                    sessionStorage.removeItem("reloadedForLogout"); // Reset logout state
                    window.location.reload();
               }

               // Second reload when cookies disappear (Logout)
               if (!cookiesNowPresent && !hasReloadedForLogout) {
                    sessionStorage.setItem("reloadedForLogout", "true");
                    sessionStorage.removeItem("reloadedForLogin"); // Reset login state
                    window.location.reload();
               }
          };

          // Focus listener
          const handleFocus = () => {
               handleCheck();
          };

          // Cookie change detection via polling
          const cookieInterval = setInterval(() => {
               handleCheck();
          }, POLLING_INTERVAL);

          window.addEventListener("focus", handleFocus);

          return () => {
               window.removeEventListener("focus", handleFocus);
               clearInterval(cookieInterval);
          };
     }, []);

     return null;
};
