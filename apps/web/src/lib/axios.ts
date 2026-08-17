// Central Axios instance.
// Every API call goes through this — so adding auth headers,
// handling token refresh, and error normalization happen in one place.

import axios from "axios";
import { store } from "../store";
import { updateAccessToken, clearCredentials } from "../store/slices/authSlice";

export const api = axios.create({
  baseURL:       "/api/v1",
  withCredentials: true,   // sends the httpOnly refresh-token cookie automatically
});

// Request interceptor — attach the access token to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — if we get a 401, try refreshing the token once.
// This handles the case where the access token expired mid-session.
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          "/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken as string;
        store.dispatch(updateAccessToken(newToken));
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        store.dispatch(clearCredentials());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error as Error);
  }
);