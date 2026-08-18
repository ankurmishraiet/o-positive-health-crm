import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const axiosClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`, // Connect directly to backend API
});

// Separate plain axios instance for token refresh – no interceptors to avoid recursion
const refreshClient = axios.create({ baseURL: `${API_BASE_URL}/api/v1` });

if (typeof window !== "undefined") {
  const clearSession = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  axiosClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isExpired =
        error.response?.status === 401 &&
        error.response?.data?.message === "TOKEN_EXPIRED";

      if (isExpired && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const res = await refreshClient.post("/auth/refresh", {
              refreshToken,
            });
            const { access } = res.data;
            localStorage.setItem("authToken", access);
            originalRequest.headers.authorization = `Bearer ${access}`;
            return axiosClient(originalRequest);
          } catch {
            // Refresh failed – clear session and redirect to login
            clearSession();
            window.location.href = "/";
            return Promise.reject(error);
          }
        } else {
          // No refresh token – clear session and redirect to login
          clearSession();
          window.location.href = "/";
        }
      }

      // For explicit authentication failures on non-auth routes,
      // clear session and redirect to login.
      // Do not log out on 403 "Forbidden" responses because those can be
      // valid authorization failures when a logged-in user lacks module access.
      if (
        !originalRequest._retry &&
        error.response?.status === 401 &&
        error.response?.data?.message === "USER_NOT_AUTHORIZED" &&
        !originalRequest.url?.includes("/auth/")
      ) {
        clearSession();
        window.location.href = "/";
      }

      return Promise.reject(error);
    }
  );
}

export default axiosClient;
