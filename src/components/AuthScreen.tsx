/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MLMUser } from '../types/mlm';
import { validateSponsorAssignment } from '../lib/mlmEngine';
import { 
  GraduationCap, 
  TrendingUp, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  KeyRound, 
  AlertCircle,
  HelpCircle,
  Users
} from 'lucide-react';

interface AuthScreenProps {
  users: MLMUser[];
  onLoginSuccess: (user: MLMUser) => void;
  onRegisterUser: (newUser: MLMUser) => void;
  theme: 'glass-dark' | 'corporate-blue';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLoginSuccess,
  onRegisterUser,
  theme,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [emailInput, setEmailInput] = useState('rajesh.sharma@mlm-network.in');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSponsorId, setRegSponsorId] = useState<string>('USR-001');

  // Error and UI States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const user = users.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (!user) {
      setErrorMessage(`No partner account found with email "${emailInput}". Please check your email or select a demo account below.`);
      return;
    }

    onLoginSuccess(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Full name and email address are required.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setErrorMessage('An account with this email address already exists. Please log in.');
      return;
    }

    const generatedId = `USR-0${users.length + 1}`;
    const check = validateSponsorAssignment(users, generatedId, regSponsorId || null);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Invalid sponsor referral loop.');
      return;
    }

    const newUser: MLMUser = {
      id: generatedId,
      name: regName.trim(),
      email: regEmail.trim(),
      sponsorId: regSponsorId || null,
      isActiveMember: true,
      walletBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      totalPurchases: 0,
      joinedAt: new Date().toISOString(),
      rankTitle: regSponsorId ? 'Associate Affiliate' : 'Master Node',
      coursesEnrolled: [],
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Minimalist Geometric Background with soft Indigo (#4F46E5) and Emerald (#10B981) light gradient blurs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Login Container */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* TOP BRAND SECTION: Academic Cap interlocking with Upward Network Growth Chart */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-0.5 shadow-xl shadow-indigo-600/30 flex items-center justify-center group hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-2xl bg-indigo-600 flex items-center justify-center text-white relative">
              {/* Interlocking Academic Cap & Upward Growth Node */}
              <GraduationCap className="w-8 h-8 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-indigo-700 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {authMode === 'login' ? 'Well Money Partner Portal 🚀' : 'Join Well Money Network 🌟'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {authMode === 'login' 
                ? 'Login to Well Money to track your courses, wallets, and network downlines.' 
                : 'Register with Well Money to unlock digital courses and start earning 10% direct commissions.'}
            </p>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {forgotPasswordNotice && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs flex items-center justify-between">
            <span>Password reset token sent to your registered email!</span>
            <button 
              onClick={() => setForgotPasswordNotice(false)} 
              className="font-bold underline cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* INPUT FORM ELEMENTS */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Affiliate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="partner@mlm-network.in"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(true)}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* MAIN ACTION BUTTON: Full-width Electric Indigo (#4F46E5) to Royal Violet */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <span>Secure Sign In</span>
              <span className="text-base">🔐</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Arjun Kapoor"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="arjun@network.in"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Create password (min 8 chars)"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Sponsor ID (Direct Referrer Upline)
              </label>
              <select
                value={regSponsorId}
                onChange={e => setRegSponsorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="">[None - Register as Root Founder]</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create Account & Start Earning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FOOTER ACTIONS: Toggle between Login and Register */}
        <div className="pt-2 text-center text-xs">
          {authMode === 'login' ? (
            <p className="text-slate-500 dark:text-slate-400">
              New to the Network?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-1"
              >
                Create an Account
              </button>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              Already have an affiliate account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-1"
              >
                Sign In to Network
              </button>
            </p>
          )}
        </div>

        {/* QUICK DEMO ACCOUNTS SWITCHER: Zero-friction testing for review */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Instant Demo Partner Sign In:</span>
            <span className="font-mono text-emerald-500">1-Click Test</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            {users.slice(0, 4).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => onLoginSuccess(u)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/70 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {u.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
                  <span>{u.id}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{u.rankTitle?.split(' ')[0] || 'Member'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
