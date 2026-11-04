import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import { Menu, User, LogOut, ChevronDown, Search } from 'lucide-react';

export const Navbar = ({ onMenuClick, onSearchChange, searchValue = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin-dashboard')) return 'Admin Overview';
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/issues/create')) return 'Create New Issue';
    if (path.includes('/issues/my')) return 'My Reported Issues';
    if (path.includes('/issues/assigned')) return 'Assigned to Me';
    if (path.includes('/issues/edit')) return 'Edit Issue';
    if (path.includes('/issues/')) return 'Issue Details';
    if (path.includes('/issues')) return 'All Issues';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:text-slate-800 p-1"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-800 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Search + User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Quick Search (hidden on mobile, visible on tablet+) */}
        {onSearchChange && (
          <div className="hidden sm:flex items-center relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 w-44 focus:w-60 transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        )}

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-md hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center border border-blue-700">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="block text-[10px] text-slate-500 capitalize">
                {user?.role || 'Member'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-md shadow-md py-1 z-50 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
