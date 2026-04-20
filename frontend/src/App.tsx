import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OrganizationSetupPage from '@/pages/OrganizationSetupPage';
import DashboardPage from '@/pages/DashboardPage';
import SchedulePage from '@/pages/SchedulePage';
import AvailabilityPage from '@/pages/AvailabilityPage';
import ManageSchedulePage from '@/pages/ManageSchedulePage';
import SwapsPage from '@/pages/SwapsPage';
import TimeOffPage from '@/pages/TimeOffPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import MembersPage from '@/pages/MembersPage';
import '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.organizationId) return <Navigate to="/setup-org" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user && user.organizationId) return <Navigate to="/dashboard" replace />;
  if (user && !user.organizationId) return <Navigate to="/setup-org" replace />;
  return <>{children}</>;
}

function AuthRouteWrapper() {
  return <AuthRoute><AuthLayout /></AuthRoute>;
}

function ProtectedRouteWrapper() {
  return <ProtectedRoute><AppLayout /></ProtectedRoute>;
}

function SetupOrgRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.organizationId) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthRouteWrapper />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Org setup */}
            <Route
              path="/setup-org"
              element={<SetupOrgRoute><OrganizationSetupPage /></SetupOrgRoute>}
            />

            {/* Protected app routes */}
            <Route element={<ProtectedRouteWrapper />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/manage" element={<ManageSchedulePage />} />
              <Route path="/swaps" element={<SwapsPage />} />
              <Route path="/time-off" element={<TimeOffPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/members" element={<MembersPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
