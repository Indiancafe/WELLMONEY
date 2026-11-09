/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MLMUser, LedgerEntry } from '../types/mlm';
import { executeWithdrawal, formatINR, roundCurrency } from '../lib/mlmEngine';
import { 
  CreditCard, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Lock,
  Unlock,
  Coins
} from 'lucide-react';

interface WithdrawalPortalProps {
  users: MLMUser[];
  onWithdrawalComplete: (updatedUsers: MLMUser[], newLedgerEntry: LedgerEntry) => void;
  onToggleUserActive: (userId: string) => void;
}

export const WithdrawalPortal: React.FC<WithdrawalPortalProps> = ({
  users,
  onWithdrawalComplete,
  onToggleUserActive,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'USR-001');
  const [amount, setAmount] = useState<number>(2000);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    code?: string;
  } | null>(null);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const result = executeWithdrawal(users, selectedUser.id, amount);
    onWithdrawalComplete(result.updatedUsers, result.ledgerEntry);

    if (result.success) {
      setFeedback({
        success: true,
        message: `Withdrawal of ${formatINR(amount)} successfully authorized and debited. Reference: ${result.request.id}`,
      });
    } else {
      setFeedback({
        success: false,
        message: result.request.reason || 'Withdrawal rejected.',
        code: result.request.rejectionCode,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Wallet Withdrawal & Compliance Terminal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enforces MLM Rule: <code className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">A user can only withdraw funds if isActiveMember = true</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Withdrawal Terminal Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Disbursement Terminal
          </h3>

          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* User Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Member Account
              </label>
              <select
                value={selectedUserId}
                onChange={e => {
                  setSelectedUserId(e.target.value);
                  setFeedback(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id}) — {u.isActiveMember ? 'ACTIVE' : 'INACTIVE'} (Bal: {formatINR(u.walletBalance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected User Compliance Card */}
            {selectedUser && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                selectedUser.isActiveMember
                  ? 'bg-slate-50 dark:bg-slate-950 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedUser.isActiveMember ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Membership Status: {selectedUser.isActiveMember ? 'Active (Eligible)' : 'Inactive (Restricted)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleUserActive(selectedUser.id)}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg border cursor-pointer transition-colors bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs"
                  >
                    {selectedUser.isActiveMember ? 'Simulate Inactive State' : 'Activate Account'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Available Balance:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tabular-nums">
                      {formatINR(selectedUser.walletBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Withdrawn:</span>
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatINR(selectedUser.totalWithdrawn)}
                    </span>
                  </div>
                </div>

                {!selectedUser.isActiveMember && (
                  <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                    <span>
                      Compliance Rule Locked: Withdrawal attempts by inactive accounts trigger automatic rejection code <code className="font-mono font-bold">ERR_INACTIVE_MEMBER_WITHDRAWAL_DENIED</code>.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Requested Withdrawal Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  max={selectedUser ? selectedUser.walletBalance : 100000}
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white tabular-nums focus:outline-none focus:border-emerald-500"
                />
              </div>

              {selectedUser && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAmount(Math.min(1000, selectedUser.walletBalance))}
                    className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md font-mono"
                  >
                    ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(Math.min(5000, selectedUser.walletBalance))}
                    className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md font-mono"
                  >
                    ₹5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(selectedUser.walletBalance)}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-md font-mono font-medium"
                  >
                    Max (All: {formatINR(selectedUser.walletBalance)})
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  selectedUser?.isActiveMember
                    ? 'bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {selectedUser?.isActiveMember ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Process Authorized Withdrawal
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Attempt Withdrawal (Will Trigger Compliance Block)
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Display */}
          {feedback && (
            <div className={`p-4 rounded-xl border text-xs font-mono ${
              feedback.success
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-start gap-2">
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {feedback.success ? 'DISBURSEMENT AUTHORIZED' : `REJECTED: ${feedback.code || 'COMPLIANCE VIOLATION'}`}
                  </div>
                  <div className="mt-1 font-sans text-xs">{feedback.message}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Member Wallets Directory */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Network Member Wallets
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Total Members: {users.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {users.map(u => (
              <div
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setFeedback(null);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  selectedUserId === u.id
                    ? 'bg-emerald-50 dark:bg-slate-950 border-emerald-300 dark:border-emerald-500/50 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{u.name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">({u.id})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Earned: {formatINR(u.totalEarned)} · Withdrawn: {formatINR(u.totalWithdrawn)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatINR(u.walletBalance)}
                  </div>
                  <div className="text-[11px] mt-0.5">
                    {u.isActiveMember ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Eligible</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
