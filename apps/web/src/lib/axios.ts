// Central Axios instance.
// Every API call goes through this — so adding auth headers,
// handling token refresh, and error normalization happen in one place.

import axios from "axios";
import { store } from "../store";
import {
  updateAccessToken,
  clearCredentials,
} from "../store/slices/authSlice";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://cloud-sentinel-production.up.railway.app/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor — attach the access token to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor — if we get a 401,
// try refreshing the token once.
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = data.data.accessToken as string;

        store.dispatch(updateAccessToken(newToken));

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

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