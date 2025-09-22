const API_URLS = {
  local: "http://localhost:3000",
  lan: "http://192.168.2.9:3000",
};

export const API_URL = process.env.NEXT_PUBLIC_USE_LAN === "true" 
  ? API_URLS.lan 
  : API_URLS.local;
