/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Network, 
  GitFork, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  ReceiptText, 
  Wallet, 
  Layers,
  Code,
  Sparkles,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasCycleAnomaly: boolean;
  theme: 'glass-dark' | 'corporate-blue';
  setTheme: (theme: 'glass-dark' | 'corporate-blue') => void;
  usersCount: number;
  ledgerCount: number;
  onOpenJsonModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hasCycleAnomaly,
  theme,
  setTheme,
  usersCount,
  ledgerCount,
  onOpenJsonModal,
}) => {
  const navItems = [
    {
      id: 'tree',
      label: 'Genealogy Tree',
      sublabel: 'Unilevel Hierarchy',
      icon: GitFork,
      count: usersCount,
    },
    {
      id: 'simulator',
      label: 'Commission Engine',
      sublabel: '3-Tier Recursive Traversal',
      icon: Cpu,
    },
    {
      id: 'fraud',
      label: 'Fraud & Loops',
      sublabel: 'Cycle & Anomaly Scanner',
      icon: hasCycleAnomaly ? ShieldAlert : ShieldCheck,
      badge: hasCycleAnomaly ? 'Loop Detected' : 'Verified',
      badgeColor: hasCycleAnomaly ? 'rose' : 'emerald',
    },
    {
      id: 'ledger',
      label: 'Financial Ledger',
      sublabel: 'Double-Entry Audit Trail',
      icon: ReceiptText,
      count: ledgerCount,
    },
    {
      id: 'withdrawals',
      label: 'Wallets & Payouts',
      sublabel: 'Compliance Gatekeeper',
      icon: Wallet,
    },
  ];

  const isDark = theme === 'glass-dark';

  return (
    <aside className={`w-full lg:w-64 shrink-0 transition-all duration-200 border-r flex flex-col justify-between ${
      isDark
        ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 text-slate-100 shadow-2xl'
        : 'bg-white border-slate-300 text-slate-900 shadow-sm'
    }`}>
      <div>
        {/* Brand Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-md ${
              isDark 
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
                : 'bg-blue-600 text-white border border-blue-700'
            }`}>
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base font-display tracking-tight leading-none text-slate-900 dark:text-white">
                WELL MONEY
              </div>
              <div className={`text-[11px] font-mono mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Financial Math Core
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-950/40 text-emerald-300 shadow-sm border border-emerald-500/40'
                      : 'bg-blue-50 text-blue-900 shadow-xs border border-blue-300'
                    : isDark
                      ? 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive 
                      ? isDark ? 'text-emerald-400' : 'text-blue-600'
                      : item.id === 'fraud' && hasCycleAnomaly
                      ? 'text-rose-500'
                      : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <div className="truncate">
                    <span className="block leading-tight">{item.label}</span>
                    <span className={`text-[10px] block font-normal ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                {item.badge ? (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.badgeColor === 'rose'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : isDark
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                ) : item.count !== undefined ? (
                  <span className={`text-[11px] font-mono tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Plan Rules Summary Widget */}
        <div className={`p-3.5 mx-3 my-2 rounded-xl text-xs space-y-2 border transition-all ${
          isDark
            ? 'bg-slate-900/50 backdrop-blur-md border-white/10 text-slate-300'
            : 'bg-blue-50/50 border-blue-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Layers className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-blue-600'}`} />
              Generation Rates
            </span>
            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Up to 3 Tiers
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Level 1 (Parent):</span>
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-blue-700'}`}>10%</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Level 2 (Grandparent):</span>
              <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>5%</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Level 3 (Great-Grand):</span>
              <span className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>2%</span>
            </div>
            <div className={`pt-1 border-t flex justify-between text-[10px] ${
              isDark ? 'border-white/10 text-slate-400' : 'border-blue-200 text-slate-600'
            }`}>
              <span>Max Payout:</span>
              <span className="font-bold">17% (83% Retained)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className={`p-4 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {/* JSON Export Shortcut */}
        <button
          onClick={onOpenJsonModal}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-white/10'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
          }`}
        >
          <Code className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-blue-600'}`} />
          Deterministic JSON Hub
        </button>

        {/* Theme Quick Switcher Widget */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Active Theme
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/10">
            <button
              onClick={() => setTheme('glass-dark')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                isDark ? 'bg-slate-950 text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Glassmorphism Dark"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('corporate-blue')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                !isDark ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-white'
              }`}
              title="Corporate Blue Light"
            >
              <Building2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
