import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';

// Fresher Pages
import { FresherDashboard } from './pages/Fresher/FresherDashboard';
import { JobDiscoveryPage } from './pages/Fresher/JobDiscoveryPage';
import { CompanyDiscoveryPage } from './pages/Fresher/CompanyDiscoveryPage';
import { MyApplicationsPage } from './pages/Fresher/MyApplicationsPage';
import { FresherProfilePage } from './pages/Fresher/FresherProfilePage';
import { CareerDevelopmentPage } from './pages/Fresher/CareerDevelopmentPage';
import { AssessmentsPage } from './pages/Fresher/AssessmentsPage';
import { InvitationsPage } from './pages/Fresher/InvitationsPage';
import { InterviewsPage } from './pages/Fresher/InterviewsPage';

// Startup Pages
import { StartupDashboard } from './pages/Startup/StartupDashboard';
import { MyJobsPage } from './pages/Startup/MyJobsPage';
import { PostJobPage } from './pages/Startup/PostJobPage';
import { CandidateDiscoveryPage } from './pages/Startup/CandidateDiscoveryPage';
import { AtsPipelinePage } from './pages/Startup/AtsPipelinePage';
import { StartupInvitationsPage } from './pages/Startup/StartupInvitationsPage';
import { StartupInterviewsPage } from './pages/Startup/StartupInterviewsPage';
import { StartupAnalyticsPage } from './pages/Startup/StartupAnalyticsPage';
import { CompanyProfilePage } from './pages/Startup/CompanyProfilePage';

// Admin & General Pages
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { HelpPage } from './pages/Help/HelpPage';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-[#050816]" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const RoleBasedDashboard: React.FC = () => {
  const { role } = useAuth();
  if (role === 'STARTUP') return <StartupDashboard />;
  if (role === 'ADMIN') return <AdminDashboardPage />;
  return <FresherDashboard />;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Workspace Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dynamic Dashboard Landing */}
              <Route path="/dashboard" element={<RoleBasedDashboard />} />

              {/* Fresher Dedicated Routes */}
              <Route path="/jobs" element={<JobDiscoveryPage />} />
              <Route path="/companies" element={<CompanyDiscoveryPage />} />
              <Route path="/matching" element={<JobDiscoveryPage />} />
              <Route path="/applications" element={<MyApplicationsPage />} />
              <Route path="/profile" element={<FresherProfilePage />} />
              <Route path="/career" element={<CareerDevelopmentPage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route path="/invitations" element={<InvitationsPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />

              {/* Startup Dedicated Routes */}
              <Route path="/startup/jobs" element={<MyJobsPage />} />
              <Route path="/startup/post-job" element={<PostJobPage />} />
              <Route path="/startup/candidates" element={<CandidateDiscoveryPage />} />
              <Route path="/startup/matching" element={<CandidateDiscoveryPage />} />
              <Route path="/startup/ats" element={<AtsPipelinePage />} />
              <Route path="/startup/invitations" element={<StartupInvitationsPage />} />
              <Route path="/startup/interviews" element={<StartupInterviewsPage />} />
              <Route path="/startup/analytics" element={<StartupAnalyticsPage />} />
              <Route path="/startup/profile" element={<CompanyProfilePage />} />

              {/* Admin Dedicated Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminDashboardPage />} />
              <Route path="/admin/companies" element={<AdminDashboardPage />} />
              <Route path="/admin/jobs" element={<AdminDashboardPage />} />

              {/* Global Settings & Help */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};
