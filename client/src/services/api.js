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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const referralAPI = {
  submit: (data) =>
    api.post("/referrals/submit", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  test: () => api.get("/referrals/test"),
};

export default api;
