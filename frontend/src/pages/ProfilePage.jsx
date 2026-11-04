import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { formatDate, getInitials } from '../utils/formatters';
import { User, Mail, Shield, Calendar, Layers, CheckCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      userService.getUserById(user._id)
        .then((res) => setProfileData(res.data))
        .catch(() => setProfileData(user))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const activeUser = profileData || user;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          User Profile
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your personal account information and activity summary
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center border-2 border-blue-700 shadow-xs">
            {getInitials(activeUser?.name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{activeUser?.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{activeUser?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {activeUser?.role}
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Account
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Full Name</span>
              <span className="font-semibold text-slate-800">{activeUser?.name}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Email Address</span>
              <span className="font-semibold text-slate-800">{activeUser?.email}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Access Role</span>
              <span className="font-semibold text-slate-800 capitalize">{activeUser?.role} Access</span>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Member Since</span>
              <span className="font-semibold text-slate-800">{formatDate(activeUser?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            My Activity Overview
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-md border border-slate-200 bg-white">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Issues Created by Me
              </span>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {activeUser?.createdIssuesCount ?? '—'}
              </p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-white">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Issues Assigned to Me
              </span>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {activeUser?.assignedIssuesCount ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
