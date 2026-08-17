import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  id:      string;
  type:    "success" | "error" | "info" | "warning";
  message: string;
}

interface UiState {
  sidebarOpen: boolean;
  darkMode:    boolean;
  toasts:      Toast[];
}

const initialState: UiState = {
  sidebarOpen: true,
  darkMode:    localStorage.getItem("darkMode") === "true",
  toasts:      [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", String(state.darkMode));
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      state.toasts.push({ ...action.payload, id: crypto.randomUUID() });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, toggleDarkMode, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;