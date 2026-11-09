/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles, 
  Building2,
  Smartphone,
  Monitor,
  BookOpen
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../lib/defaultData';
import { MLMUser } from '../types/mlm';
import { ProfileHeaderDropdown } from './ProfileHeaderDropdown';

interface HeaderProps {
  activeTab: string;
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onOpenSimulator: () => void;
  hasCycleAnomaly: boolean;
  theme: 'glass-dark' | 'corporate-blue';
  setTheme: (theme: 'glass-dark' | 'corporate-blue') => void;
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  currentUser: MLMUser | null;
  isAuthenticated: boolean;
  totalDownlinesCount: number;
  onRequestLogout: () => void;
  onUpdateUser: (user: MLMUser) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeScenarioId,
  onSelectScenario,
  onOpenSimulator,
  hasCycleAnomaly,
  theme,
  setTheme,
  viewMode,
  setViewMode,
  currentUser,
  isAuthenticated,
  totalDownlinesCount,
  onRequestLogout,
  onUpdateUser,
  onOpenAuth,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Affiliate & Student Dashboard';
      case 'courses':
        return 'LMS Digital Courses';
      case 'tree':
        return 'Visual Network Flowchart';
      case 'simulator':
        return 'Recursive Commission Engine';
      case 'fraud':
        return 'Fraud & Double-Spend Scanner';
      case 'ledger':
        return 'Double-Entry Financial Ledger';
      case 'withdrawals':
        return 'Wallets & Payouts';
      case 'admin':
        return 'Enterprise Admin Control Center';
      default:
        return 'Well Money Academy';
    }
  };

  return (
    <header className="sticky top-0 z-30 transition-all duration-200 border-b bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-indigo-600 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
            W
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            <span className="font-extrabold text-slate-900 dark:text-white font-display hidden sm:inline tracking-tight">
              WELL MONEY
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
            <span className="text-slate-900 dark:text-white font-semibold truncate font-display">
              {getTabTitle(activeTab)}
            </span>
          </div>
        </div>

        {/* Center / Right: Theme & Device Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Device Mockup Toggle (Mobile vs Desktop) */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to Mobile App Preview (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Shell</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to Expanded Desktop Layout"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded</span>
            </button>
          </div>

          {/* PROMINENT THEME TOGGLE: Glassmorphism Dark vs Corporate Blue Light */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/15 shadow-inner">
            <button
              type="button"
              onClick={() => setTheme('glass-dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                theme === 'glass-dark'
                  ? 'bg-slate-950 text-emerald-400 shadow-md border border-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Glassmorphism Dark Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Glass Dark</span>
              {theme === 'glass-dark' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('corporate-blue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                theme === 'corporate-blue'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Corporate Blue Light Mode"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Corporate Blue</span>
              {theme === 'corporate-blue' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />}
            </button>
          </div>

          {/* Quick Scenario Preset Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5">
            <select
              value={activeScenarioId}
              onChange={e => onSelectScenario(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {PRESET_SCENARIOS.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenSimulator}
            className="hidden sm:flex px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-md shadow-indigo-600/20 items-center gap-1.5 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Commission Simulator</span>
            <span className="sm:hidden">Simulate</span>
          </button>

          {/* Persistent Profile Header with Logout Capability */}
          {isAuthenticated && currentUser ? (
            <ProfileHeaderDropdown
              currentUser={currentUser}
              totalDownlinesCount={totalDownlinesCount}
              onRequestLogout={onRequestLogout}
              onUpdateUser={onUpdateUser}
            />
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sign In</span>
              <span className="text-xs">🔐</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
