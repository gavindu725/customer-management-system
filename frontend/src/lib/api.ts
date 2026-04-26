import axios from "axios";

const api = axios.create({
  // Use same-origin path so Next.js can proxy to backend (works for localhost and dev tunnels).
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
