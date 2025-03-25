"use client";

import { useEffect, useRef } from "react";

export const useCookieTokenUpdater = () => {
     const COOKIE_NAME = "sb-sorklznvftjmhkaejkej-auth-token";
     const COOKIE_NAME_0 = `${COOKIE_NAME}.0`;
     const COOKIE_NAME_1 = `${COOKIE_NAME}.1`;

     const prevCookieValues = useRef<{
          [key: string]: string | undefined;
     }>({
          [COOKIE_NAME]: undefined,
          [COOKIE_NAME_0]: undefined,
          [COOKIE_NAME_1]: undefined,
     });

     useEffect(() => {
          const getCookieValue = (name: string) => {
               if (!name || name === "") return undefined;
               const match = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(`${name}=`));
               return match ? match.split("=")[1] : undefined;
          };

          prevCookieValues.current = {
               [COOKIE_NAME]: getCookieValue(COOKIE_NAME) ?? undefined,
               [COOKIE_NAME_0]: getCookieValue(COOKIE_NAME_0) ?? undefined,
               [COOKIE_NAME_1]: getCookieValue(COOKIE_NAME_1) ?? undefined,
          };

          const handleStorageChange = () => {
               console.log('usao u handleStorageChange');

               const currentCookieValues = {
                    [COOKIE_NAME]: getCookieValue(COOKIE_NAME) ?? undefined,
                    [COOKIE_NAME_0]: getCookieValue(COOKIE_NAME_0) ?? undefined,
                    [COOKIE_NAME_1]: getCookieValue(COOKIE_NAME_1) ?? undefined,
               };

               if (
                    (Object.keys(currentCookieValues) as Array<keyof typeof currentCookieValues>).some(
                         (key) =>
                              prevCookieValues.current?.[key] !==
                              currentCookieValues[key] &&
                              currentCookieValues[key] !== "",
                    )
               ) {
                    console.log(
                         `Cookie(s) modified - reloading page`,
                    );
                    prevCookieValues.current = {
                         ...prevCookieValues.current,
                         ...currentCookieValues,
                    };
                    window.location.reload();
               }
          };

          document.addEventListener("cookiechange", handleStorageChange);

          return () => {
               document.removeEventListener("cookiechange", handleStorageChange);
          };
     }, []);
};
