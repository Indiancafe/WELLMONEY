/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  userName: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl text-center space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Soft Crimson & Sunset Orange Glow in Background */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        {/* Central Warning Icon in Soft Crimson */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center text-rose-500 shadow-md shadow-rose-500/15">
          <div className="relative">
            <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[9px] text-white font-bold">
              !
            </div>
          </div>
        </div>

        {/* Header & Warning Prose */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Are you sure you want to exit?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Logging out will end the active affiliate session for <span className="font-semibold text-slate-800 dark:text-slate-200">{userName}</span>. You will need to securely sign in again to access course content and commission trees.
          </p>
        </div>

        {/* Action Choice Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Button 1 (Dismiss Action): Clear background with neutral slate borders */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Stay Logged In
          </button>

          {/* Button 2 (Destructive Action): Solid energetic Crimson (#EF4444) background */}
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-xs font-bold text-white transition-all shadow-lg shadow-rose-500/25 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Log Me Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
