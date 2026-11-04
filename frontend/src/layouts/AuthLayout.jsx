import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ToastNotification } from '../components/common/ToastNotification';
import { CheckCircle2 } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in, redirect to respective dashboard
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin-dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-blue-600 text-white shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-800">
          Exelon Circuits
        </h2>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
          Internal Issue Management System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-md shadow-xs">
          <Outlet />
        </div>
      </div>

      <ToastNotification />
    </div>
  );
};

