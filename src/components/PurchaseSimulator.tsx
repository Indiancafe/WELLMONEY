/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MLMUser, CommissionCalculationResult, LedgerEntry } from '../types/mlm';
import { calculateCommissions, formatINR, roundCurrency } from '../lib/mlmEngine';
import { 
  ArrowRight, 
  Check, 
  Copy, 
  Download, 
  Play, 
  Layers, 
  Coins, 
  ShieldCheck, 
  AlertCircle,
  FileCode,
  ListOrdered
} from 'lucide-react';

interface PurchaseSimulatorProps {
  users: MLMUser[];
  selectedBuyerId: string;
  setSelectedBuyerId: (id: string) => void;
  onApplyTransaction: (result: CommissionCalculationResult, updatedUsers: MLMUser[]) => void;
}

export const PurchaseSimulator: React.FC<PurchaseSimulatorProps> = ({
  users,
  selectedBuyerId,
  setSelectedBuyerId,
  onApplyTransaction,
}) => {
  const [purchaseAmount, setPurchaseAmount] = useState<number>(10000);
  const [lastResult, setLastResult] = useState<CommissionCalculationResult | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);

  const selectedBuyer = useMemo(() => users.find(u => u.id === selectedBuyerId) || users[0], [users, selectedBuyerId]);

  // Preview the upward chain for this buyer before executing
  const upwardPreview = useMemo(() => {
    if (!selectedBuyer) return [];
    const chain: Array<{ level: number; relation: string; user: MLMUser; rate: string }> = [];
    let curr = selectedBuyer.sponsorId;
    let depth = 1;
    const visited = new Set<string>([selectedBuyer.id]);

    while (curr && depth <= 3) {
      if (visited.has(curr)) break;
      visited.add(curr);
      const sp = users.find(u => u.id === curr);
      if (!sp) break;

      const rate = depth === 1 ? '10%' : depth === 2 ? '5%' : '2%';
      const relation = depth === 1 ? 'Parent (Level 1)' : depth === 2 ? 'Grandparent (Level 2)' : 'Great-Grandparent (Level 3)';

      chain.push({ level: depth, relation, user: sp, rate });
      curr = sp.sponsorId;
      depth++;
    }
    return chain;
  }, [users, selectedBuyer]);

  const handleSimulate = () => {
    if (!selectedBuyer) return;
    const validAmount = Math.max(1, roundCurrency(purchaseAmount));
    const { result, updatedUsers } = calculateCommissions(users, selectedBuyer.id, validAmount);
    setLastResult(result);
    onApplyTransaction(result, updatedUsers);
  };

  const handleCopyJson = () => {
    if (!lastResult) return;
    navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!lastResult) return;
    const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mlm_commission_${lastResult.transactionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presetAmounts = [2500, 5000, 10000, 25000, 50000, 100000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Recursive 3-Tier Commission Traversal Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Executes upward recursive traversal via <code className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">sponsorId</code> with exact financial math (10% Parent · 5% Grandparent · 2% Great-Grandparent).
        </p>
      </div>

      {/* Simulator Control Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Buyer Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Buyer (Initiating Product Purchase)
            </label>
            <select
              value={selectedBuyer?.id || ''}
              onChange={e => setSelectedBuyerId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id}) — Sponsor: {u.sponsorId || 'None [Root]'}
                </option>
              ))}
            </select>

            {/* Upward Lineage preview pill strip */}
            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Targeted Traversal Path:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                  {selectedBuyer?.name} ({selectedBuyer?.id})
                </span>
                {upwardPreview.length === 0 ? (
                  <span className="text-slate-500 text-[11px]">➔ [No Sponsor: Root Node]</span>
                ) : (
                  upwardPreview.map(step => (
                    <React.Fragment key={step.user.id}>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                        L{step.level}: {step.user.name} ({step.rate})
                      </span>
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Purchase Amount & Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Purchase Amount in INR (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-sm">
                ₹
              </span>
              <input
                type="number"
                min="100"
                step="50"
                value={purchaseAmount}
                onChange={e => setPurchaseAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[11px] text-slate-400">Presets:</span>
              {presetAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPurchaseAmount(amt)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md border cursor-pointer transition-colors ${
                    purchaseAmount === amt
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Run CTA Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSimulate}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                Execute Recursive Commission Traversal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Traversal Output Results */}
      {lastResult && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
          {/* Result Header & View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Execution Receipt:</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{lastResult.transactionId}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Processed at {new Date(lastResult.timestamp).toLocaleString('en-IN')}
              </div>
            </div>

            {/* View Mode Buttons & Export Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveViewMode('visual')}
                  className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                    activeViewMode === 'visual'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5 inline mr-1" />
                  Algorithmic Trace
                </button>
                <button
                  onClick={() => setActiveViewMode('json')}
                  className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                    activeViewMode === 'json'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 inline mr-1" />
                  Deterministic JSON
                </button>
              </div>

              <button
                onClick={handleCopyJson}
                className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Copy Deterministic JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Download JSON File"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Quick Financial Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Purchase Amount</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatINR(lastResult.productPurchaseAmount)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Commissions Disbursed</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatINR(lastResult.totalCommissionPaid)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {((lastResult.totalCommissionPaid / lastResult.productPurchaseAmount) * 100).toFixed(1)}% of total
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Company Retained Margin</span>
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatINR(lastResult.companyRetainedAmount)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {((lastResult.companyRetainedAmount / lastResult.productPurchaseAmount) * 100).toFixed(1)}% retained
              </span>
            </div>
          </div>

          {/* View Mode 1: Visual Algorithmic Steps Trace */}
          {activeViewMode === 'visual' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Step-by-Step Recursive Execution Trace</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Terminated Reason: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{lastResult.terminatedReason}</span>
                </span>
              </div>

              {/* Step 0: Buyer */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    0
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Buyer Purchase Origin: {lastResult.buyer.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">({lastResult.buyer.id})</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Initiated product purchase. Debit recorded in double-entry ledger.
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatINR(lastResult.productPurchaseAmount)}
                </div>
              </div>

              {/* Steps 1..3 */}
              {lastResult.commissionSteps.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                  No upline sponsors exist for this buyer. 100% of purchase amount ({formatINR(lastResult.productPurchaseAmount)}) is retained by company.
                </div>
              ) : (
                lastResult.commissionSteps.map(step => (
                  <div
                    key={step.sponsorId}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold ${
                          step.level === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' :
                          step.level === 2 ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800' :
                          'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800'
                        }`}>
                          L{step.level}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Level {step.level} {step.relation}: {step.sponsorName}</span>
                            <span className="font-mono text-slate-500 text-[11px]">({step.sponsorId})</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {step.notes}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +{formatINR(step.commissionAmount)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {step.rateLabel} payout
                        </div>
                      </div>
                    </div>

                    {/* Exact Mathematical Formula Breakdown */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 font-mono text-[11px] flex flex-wrap items-center justify-between text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400">Equation: </span>
                        <span className="text-emerald-600 dark:text-emerald-300 font-semibold">{step.formula}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Wallet Impact: </span>
                        <span className="text-slate-500 tabular-nums">{formatINR(step.preBalance)}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 mx-1">➔</span>
                        <span className="text-slate-900 dark:text-white font-bold tabular-nums">{formatINR(step.postBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Traversal Termination Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Traversal Complete: Recursion gracefully stopped.
                </span>
                <span className="font-mono text-[11px]">
                  {lastResult.terminatedReason === 'MAX_DEPTH_REACHED'
                    ? 'Rule Enforced: Traversal cutoff reached at Level 3. Ancestors above L3 receive 0%.'
                    : lastResult.terminatedReason === 'NO_FURTHER_SPONSOR'
                    ? 'Root Reached: sponsorId is null.'
                    : 'Circular Anomaly Intercepted.'}
                </span>
              </div>
            </div>
          )}

          {/* View Mode 2: Deterministic JSON Schema */}
          {activeViewMode === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Deterministic JSON Output (Matching Database Schema)</span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">Deterministic & Non-Hallucinated</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[480px]">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
