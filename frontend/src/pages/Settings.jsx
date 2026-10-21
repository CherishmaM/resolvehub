import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import {
  Shield,
  User,
  Mail,
  Calendar,
  Lock,
  Server,
  LogOut,
  CheckCircle,
} from 'lucide-react';

export const Settings = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile and review role permissions
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
              }
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 bg-slate-50 shadow-xs"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {user?.role}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 font-medium block">Unique User ID:</span>
            <span className="text-slate-800 font-mono font-medium mt-0.5 block truncate">
              {user?._id}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 font-medium block">Account Created:</span>
            <span className="text-slate-800 font-medium mt-0.5 block">
              {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Your Access Scope ({user?.role?.toUpperCase()})
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p>
            FixFlow enforces clear server-side role boundaries to ensure enterprise security:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Member Capabilities:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Create and report new issues</li>
                <li>View all team issues for collaborative tracking</li>
                <li>Update details of issues you created</li>
                <li>Transition status of assigned or created tickets</li>
                <li>Participate in discussion comments</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
              <span className="font-bold text-purple-900 block">Admin Privileges:</span>
              <ul className="list-disc list-inside space-y-1 text-purple-800">
                <li>Assign and reassign issues across active members</li>
                <li>Full editing and prioritization of all issues</li>
                <li>Permanent deletion of issues and cascading cleanup</li>
                <li>Promote or demote teammate system roles</li>
                <li>Server-side self-demotion lockout protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Server className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">API Connection & Diagnostics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block">API Base URL</span>
            <span className="font-mono text-slate-700 truncate block mt-0.5">
              {import.meta.env.VITE_API_BASE_URL || '/api/v1'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block">Auth Session</span>
            <span className="font-semibold text-emerald-600 block mt-0.5">
              HttpOnly Secure Cookie
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block">Application Version</span>
            <span className="font-mono text-slate-700 block mt-0.5">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
