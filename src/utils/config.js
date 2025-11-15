const API_URLS = {
  local: "http://localhost:3000",
  lan: "http://192.168.2.9:3000",
  production: "https://chamcong-backend-8pgb.onrender.com",
};

export const API_URL =
  process.env.NEXT_PUBLIC_ENV === "production"
    ? API_URLS.production
    : process.env.NEXT_PUBLIC_USE_LAN === "true"
    ? API_URLS.lan
    : API_URLS.local;
