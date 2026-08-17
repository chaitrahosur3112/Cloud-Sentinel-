import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState }  from "./store";

import { AppLayout }          from "./components/layout/AppLayout";
import { ProtectedRoute }     from "./routes/ProtectedRoute";
import { LoginPage }          from "./pages/auth/LoginPage";
import { RegisterPage }       from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { DashboardPage }      from "./pages/DashboardPage";
import { ResourcesPage }      from "./pages/ResourcesPage";
import { BudgetsPage }        from "./pages/BudgetsPage";
import { AlertsPage }         from "./pages/AlertsPage";
import { AnalyticsPage }      from "./pages/AnalyticsPage";
import { AIForecastPage }     from "./pages/AIForecastPage";
import { ReportsPage }        from "./pages/ReportsPage";

export function App() {
  const { darkMode } = useSelector((s: RootState) => s.ui);

  return (
    <div className={darkMode ? "dark" : ""}>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<LoginPage/>}/>
        <Route path="/register"        element={<RegisterPage/>}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>

        {/* Protected routes — all wrapped in AppLayout (sidebar + navbar) */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout/>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace/>}/>
          <Route path="dashboard"  element={<DashboardPage/>}/>
          <Route path="resources"  element={<ResourcesPage/>}/>
          <Route path="budgets"    element={<BudgetsPage/>}/>
          <Route path="alerts"     element={<AlertsPage/>}/>
          <Route path="analytics"  element={<AnalyticsPage/>}/>
          <Route path="ai"         element={<AIForecastPage/>}/>
          <Route path="reports"    element={<ReportsPage/>}/>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
    </div>
  );
}