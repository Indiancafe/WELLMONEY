/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MLMUser } from '../types/mlm';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Award, 
  Users, 
  ChevronDown, 
  Check, 
  KeyRound, 
  X
} from 'lucide-react';

interface ProfileHeaderDropdownProps {
  currentUser: MLMUser;
  totalDownlinesCount: number;
  onRequestLogout: () => void;
  onUpdateUser: (updated: MLMUser) => void;
}

export const ProfileHeaderDropdown: React.FC<ProfileHeaderDropdownProps> = ({
  currentUser,
  totalDownlinesCount,
  onRequestLogout,
  onUpdateUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states for settings modal
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [savedNotice, setSavedNotice] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: editName,
      email: editEmail,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger with Rank Status Glow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Account & Profile Menu"
      >
        {/* Profile Avatar Box accented by an inner glowing frame border indicating affiliate rank */}
        <div className="relative">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 p-[2px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
          {/* Glowing Affiliate Status Indicator Dot */}
          <span 
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs" 
            title="Affiliate Active"
          />
        </div>

        {/* User preview on desktop */}
        <div className="hidden sm:flex flex-col text-left pr-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
            {currentUser.rankTitle || 'Affiliate'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal Layout */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
          {/* Top Details: Small, crisp font displaying registered name and downlines */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Downline Count & Affiliate Rank */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Active Downlines:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {totalDownlinesCount} Members
              </span>
            </div>
          </div>

          {/* Secondary Route Actions */}
          <div className="space-y-0.5 px-1 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowSettingsModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Edit Profile Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setShowSecurityModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Security Preferences</span>
            </button>
          </div>

          {/* Primary Trigger: Distinct, high-contrast "Log Out Account 🚪" framed at base */}
          <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                onRequestLogout();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Log Out Account</span>
              </div>
              <span className="text-sm">🚪</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                Edit Profile Settings
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedNotice && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile settings successfully updated!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Partner ID (Immutable)
                </label>
                <input
                  type="text"
                  value={currentUser.id}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Preferences Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security Preferences
              </h3>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-slate-400 text-[11px]">Enforce OTP on wallet withdrawals</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Enabled
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">DRM Anti-Piracy Watermarking</span>
                  <span className="text-slate-400 text-[11px]">Dynamic token validation on course streams</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Double-Spend Protection Hash</span>
                  <span className="text-slate-400 text-[11px]">Automated invoice replay prevention</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Enforced
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
