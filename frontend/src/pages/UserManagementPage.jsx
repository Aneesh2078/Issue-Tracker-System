import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { SearchBar } from '../components/common/SearchBar';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate, getInitials } from '../utils/formatters';
import { Users, Shield, User, CheckCircle, XCircle } from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status toggle confirmation
  const [userToToggle, setUserToToggle] = useState(null);
  const [updating, setUpdating] = useState(false);

  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      };
      const res = await userService.getUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      error(err.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async () => {
    if (!userToToggle) return;
    try {
      setUpdating(true);
      const newStatus = !userToToggle.isActive;
      await userService.updateUserStatus(userToToggle._id, newStatus);
      success(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setUserToToggle(null);
      fetchUsers();
    } catch (err) {
      error(err.message || 'Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          User Management
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Admin portal to oversee team accounts, manage roles, and monitor workload distribution
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { label: 'Admins', value: 'admin' },
              { label: 'Normal Users', value: 'user' }
            ]}
            allLabel="All Roles"
          />

          <FilterDropdown
            label="Account Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Deactivated', value: 'inactive' }
            ]}
            allLabel="All Statuses"
          />
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading directory..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="No user records match your search or filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Registration Date</th>
                  <th scope="col" className="px-4 py-3 text-center">Assigned Issues</th>
                  <th scope="col" className="px-4 py-3">Account Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                {users.map((u) => {
                  const isCurrent = u._id === currentUser?._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-normal text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <Shield className="w-3 h-3 text-purple-600" />
                          ) : (
                            <User className="w-3 h-3 text-slate-500" />
                          )}
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {u.assignedIssuesCount || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Current session
                          </span>
                        ) : (
                          <button
                            onClick={() => setUserToToggle(u)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              u.isActive
                                ? 'text-red-600 hover:bg-red-50 border border-red-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!userToToggle}
        title={userToToggle?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
        message={
          userToToggle?.isActive
            ? `Are you sure you want to deactivate ${userToToggle?.name}'s account? They will be unable to log in to the system.`
            : `Are you sure you want to activate ${userToToggle?.name}'s account? They will regain access to log in.`
        }
        confirmText={userToToggle?.isActive ? 'Deactivate' : 'Activate'}
        isDanger={userToToggle?.isActive}
        isLoading={updating}
        onConfirm={handleToggleStatus}
        onCancel={() => setUserToToggle(null)}
      />
    </div>
  );
};
