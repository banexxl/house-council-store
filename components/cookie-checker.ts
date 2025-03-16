"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "sb-sorklznvftjmhkaejkej-auth-token";
const COOKIE_NAME_0 = `${COOKIE_NAME}.0`;
const COOKIE_NAME_1 = `${COOKIE_NAME}.1`;
const COOKIE_NAME_2 = `sb-sorklznvftjmhkaejkej-auth-token-code-verifier`;

const otherCookies = [COOKIE_NAME, COOKIE_NAME_0, COOKIE_NAME_1]; // Any one of these should be present
const POLLING_INTERVAL = 1000; // Check for cookie changes every second

export const CheckCookiesOnFocus = () => {
     const [lastCookies, setLastCookies] = useState<string>("");
     const [reloadTriggered, setReloadTriggered] = useState<boolean>(false); // To prevent multiple reloads

     // Function to get all cookies as a string
     const getCookies = (): string => document.cookie;

     const shouldReload = (): boolean => {
          const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, cookie) => {
               const [name, value] = cookie.split("=");
               acc[name] = value;
               return acc;
          }, {});

          // Check if COOKIE_NAME_2 is present and at least one from otherCookies is present
          const hasCookie2 = COOKIE_NAME_2 in cookies;
          const hasOtherCookie = otherCookies.some((cookie) => cookie in cookies);

          return hasCookie2 && hasOtherCookie;
     };

     const checkAndReload = () => {
          if (shouldReload() && !reloadTriggered) {
               setReloadTriggered(true); // Prevent multiple reloads
               window.location.reload();
          }
     };

     useEffect(() => {
          // Focus listener
          const handleFocus = () => {
               checkAndReload();
          };

          // Cookie change detection via polling
          const cookieInterval = setInterval(() => {
               if (!reloadTriggered) {
                    checkAndReload();
               }
          }, POLLING_INTERVAL);

          window.addEventListener("focus", handleFocus);

          return () => {
               window.removeEventListener("focus", handleFocus);
               clearInterval(cookieInterval);
          };
     }, [reloadTriggered]);

     return null;
};
