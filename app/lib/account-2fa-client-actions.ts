export function getAalFromAccessToken(accessToken?: string | null): "aal1" | "aal2" | null {
     if (!accessToken) return null;

     try {
          const payload = accessToken.split(".")[1];
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
          const json = JSON.parse(atob(padded));
          return (json?.aal ?? null) as any;
     } catch {
          return null;
     }
}