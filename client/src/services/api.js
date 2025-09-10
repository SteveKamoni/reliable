import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — make Joi/server validation errors readable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverData = error.response?.data;
    const message =
      (Array.isArray(serverData?.errors) && serverData.errors.join(", ")) ||
      serverData?.message ||
      error.message ||
      "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const referralAPI = {
  // Do NOT set Content-Type here; axios will set boundary when FormData is passed
  submit: (data) => api.post("/referrals/submit", data),
  test: () => api.get("/referrals/test"),
};

export default api;
