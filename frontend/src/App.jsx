import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { AllIssues } from './pages/AllIssues';
import { MyIssues } from './pages/MyIssues';
import { AssignedIssues } from './pages/AssignedIssues';
import { CreateIssuePage } from './pages/CreateIssuePage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { EditIssuePage } from './pages/EditIssuePage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirection based on auth & role */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin-dashboard' : '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboards */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Issue Management */}
        <Route path="/issues" element={<AllIssues />} />
        <Route path="/issues/my" element={<MyIssues />} />
        <Route path="/issues/assigned" element={<AssignedIssues />} />
        <Route path="/issues/create" element={<CreateIssuePage />} />
        <Route path="/issues/:id" element={<IssueDetailsPage />} />
        <Route path="/issues/edit/:id" element={<EditIssuePage />} />

        {/* User Management (Admin Only) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
