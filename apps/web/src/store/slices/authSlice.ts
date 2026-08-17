// Redux slice for authentication state.
// Why Redux for auth and not React Query?
// Auth state (who is logged in, what their role is) is CLIENT state
// that needs to be read by many components that don't share a parent.
// React Query is for SERVER state (data from API calls that can go stale).
// The current user is a piece of UI state — it doesn't stale.

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

interface AuthState {
  user:        User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user:            null,
  accessToken:     null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user            = action.payload.user;
      state.accessToken     = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearCredentials: (state) => {
      state.user            = null;
      state.accessToken     = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateAccessToken, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
