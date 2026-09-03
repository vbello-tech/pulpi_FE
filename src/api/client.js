import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is not set. Create a .env (or .env.production) file in " +
    "frontend/ with VITE_API_BASE_URL=https://your-api.example.com/api, then rebuild."
  );
}

export const api = axios.create({ baseURL: API_BASE_URL });

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulpi_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh the access token once on a 401, then retry the original request.
let refreshing = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("pulpi_refresh");
      if (!refresh) return Promise.reject(error);

      refreshing =
        refreshing ||
        axios
          .post(`${API_BASE_URL}/auth/login/refresh/`, { refresh })
          .then((res) => {
            localStorage.setItem("pulpi_access", res.data.access);
            return res.data.access;
          })
          .finally(() => {
            refreshing = null;
          });

      try {
        const newAccess = await refreshing;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("pulpi_access");
        localStorage.removeItem("pulpi_refresh");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

