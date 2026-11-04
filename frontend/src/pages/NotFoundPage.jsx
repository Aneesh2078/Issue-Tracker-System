import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const homePath = isAuthenticated
    ? isAdmin
      ? '/admin-dashboard'
      : '/dashboard'
    : '/login';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h1>
      <h2 className="text-base font-semibold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The page you are looking for does not exist or may have been relocated.
      </p>

      <Link
        to={homePath}
        className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

