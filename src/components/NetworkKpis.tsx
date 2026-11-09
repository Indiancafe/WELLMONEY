/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MLMUser } from '../types/mlm';
import { formatINR } from '../lib/mlmEngine';
import { TrendingUp, Users, ShieldCheck, PieChart } from 'lucide-react';

interface NetworkKpisProps {
  users: MLMUser[];
}

export const NetworkKpis: React.FC<NetworkKpisProps> = ({ users }) => {
  const totalVolume = users.reduce((sum, u) => sum + u.totalPurchases, 0);
  const totalCommissions = users.reduce((sum, u) => sum + u.totalEarned, 0);
  const activeCount = users.filter(u => u.isActiveMember).length;
  const inactiveCount = users.length - activeCount;

  // Formula retention: 100% - 17% (max commission) = 83% baseline
  const retainedMargin = Math.max(0, totalVolume - totalCommissions);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Network Volume */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-sm transition-all hover:border-blue-400 dark:hover:border-emerald-500/40">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Gross Product Volume</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-emerald-950/40 border border-blue-200 dark:border-emerald-800 flex items-center justify-center text-blue-700 dark:text-emerald-400 shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatINR(totalVolume)}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
          <span>Direct sales volume</span>
          <span aria-hidden="true">·</span>
          <span className="text-blue-700 dark:text-emerald-400 font-mono font-bold">INR (₹)</span>
        </div>
      </div>

      {/* KPI 2: Total Commissions Paid */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-sm transition-all hover:border-blue-400 dark:hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Commissions Disbursed</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-800 flex items-center justify-center text-blue-700 dark:text-cyan-400 shadow-xs">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatINR(totalCommissions)}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
          <span>Tier cap: 17% max</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">10% / 5% / 2%</span>
        </div>
      </div>

      {/* KPI 3: Company Retention */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-sm transition-all hover:border-blue-400 dark:hover:border-indigo-500/40">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Net Retained Revenue</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatINR(retainedMargin)}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
          <span>Product retention floor</span>
          <span aria-hidden="true">·</span>
          <span className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">~83% base</span>
        </div>
      </div>

      {/* KPI 4: Member Compliance */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-sm transition-all hover:border-blue-400 dark:hover:border-emerald-500/40">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Active Membership Ratio</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-xs">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
          {activeCount} <span className="text-base font-normal text-slate-400 dark:text-slate-500">/ {users.length}</span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeCount} Eligible</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">{inactiveCount} Restricted</span>
        </div>
      </div>
    </div>
  );
};
