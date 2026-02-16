const API_URLS = {
  local: "http://localhost:3000",
  lan: "http://192.168.2.9:3000",
  production: "https://chamcong-backend-8pgb.onrender.com",
};

const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_URL = explicitApiUrl
  ? explicitApiUrl.replace(/\/+$/, "")
  : process.env.NEXT_PUBLIC_ENV === "production"
  ? API_URLS.production
  : process.env.NEXT_PUBLIC_USE_LAN === "true"
  ? API_URLS.lan
  : API_URLS.local;
