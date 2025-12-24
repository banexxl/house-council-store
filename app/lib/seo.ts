const rawBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL!

const sanitizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

export const getBaseUrl = () => sanitizedBaseUrl;

export const buildCanonicalUrl = (path: string) =>
  `${sanitizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
