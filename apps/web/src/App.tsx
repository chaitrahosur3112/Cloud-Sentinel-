import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";

import { DashboardPage } from "./pages/DashboardPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { ResourceDetailPage } from "./pages/ResourceDetailPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AIForecastPage } from "./pages/AIForecastPage";
import { ReportsPage } from "./pages/ReportsPage";

export function App() {
  const { darkMode } = useSelector((s: RootState) => s.ui);

  return (
    <div className={darkMode ? "dark" : ""}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />


        {/* ================= PROTECTED ROUTES ================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Default */}
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<DashboardPage />}
          />

          {/* Resources list */}
          <Route
            path="resources"
            element={<ResourcesPage />}
          />

          {/* Resource details */}
          <Route
            path="resources/:id"
            element={<ResourceDetailPage />}
          />

          {/* Budgets */}
          <Route
            path="budgets"
            element={<BudgetsPage />}
          />

          {/* Alerts */}
          <Route
            path="alerts"
            element={<AlertsPage />}
          />

          {/* Analytics */}
          <Route
            path="analytics"
            element={<AnalyticsPage />}
          />

          {/* AI Forecast */}
          <Route
            path="ai"
            element={<AIForecastPage />}
          />

          {/* Reports */}
          <Route
            path="reports"
            element={<ReportsPage />}
          />
        </Route>


        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </div>
  );
}