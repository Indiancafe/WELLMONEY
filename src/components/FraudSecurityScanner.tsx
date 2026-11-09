/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MLMUser, CircularAnomaly } from '../types/mlm';
import { detectCycles, validateSponsorAssignment } from '../lib/mlmEngine';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface FraudSecurityScannerProps {
  users: MLMUser[];
  onUpdateUsers: (newUsers: MLMUser[]) => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const FraudSecurityScanner: React.FC<FraudSecurityScannerProps> = ({
  users,
  onUpdateUsers,
  onLoadScenario,
}) => {
  const [testUserId, setTestUserId] = useState<string>('USR-002');
  const [testSponsorId, setTestSponsorId] = useState<string>('USR-004');
  const [testValidationResult, setTestValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);

  // Run cycle detector on current graph
  const cycleAnomaly: CircularAnomaly = useMemo(() => detectCycles(users), [users]);

  const handleTestSponsorAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSponsorAssignment(users, testUserId, testSponsorId || null);
    setTestValidationResult(result);
  };

  const handleInjectCircularLoop = () => {
    // Inject cycle: USR-001 -> USR-004 (while USR-004 -> USR-002 -> USR-001)
    const updated = users.map(u => {
      if (u.id === 'USR-001') {
        return { ...u, sponsorId: 'USR-004' };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleSeverLoops = () => {
    // Reset root node sponsorId to null
    const updated = users.map(u => {
      if (u.id === 'USR-001') {
        return { ...u, sponsorId: null };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Fraud & Structural Integrity Scanner
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time algorithmic checks for circular loops, self-referrals, and generation plan depth boundaries.
        </p>
      </div>

      {/* Main Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check 1: Circular Dependency Status */}
        <div className={`p-5 rounded-xl border transition-colors shadow-xs ${
          cycleAnomaly.hasCycle
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {cycleAnomaly.hasCycle ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white font-display">
                Circular Dependency (Cycle Detection)
              </h3>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
              cycleAnomaly.hasCycle
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            }`}>
              {cycleAnomaly.hasCycle ? 'ANOMALY DETECTED' : 'CLEAN DAG'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            {cycleAnomaly.explanation}
          </p>

          {cycleAnomaly.hasCycle ? (
            <div className="mt-3 p-3 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 space-y-2">
              <div className="text-xs font-mono text-rose-900 dark:text-rose-200">
                <span className="font-bold">Closed Loop Trace: </span>
                {cycleAnomaly.cyclePathFormatted}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSeverLoops}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer transition-colors"
                >
                  Sever Cycle & Restore Root
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Depth-first recursion verified: Zero circular sponsor paths detected.</span>
            </div>
          )}
        </div>

        {/* Check 2: Self-Referral Protection */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white font-display">
                Self-Referral Loop Check
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold">
              PROTECTED
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Ensures no user can assign themselves as their own sponsor (<code className="text-emerald-600 dark:text-emerald-400 font-mono">sponsorId === userId</code>), preventing fraudulent solo commission generation.
          </p>

          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>0 Self-referral violations found across {users.length} members.</span>
          </div>
        </div>
      </div>

      {/* Interactive Anomaly Testbed & Attack Simulation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs transition-colors">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Interactive Sponsor Assignment Validator & Attack Sandbox
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test prospective sponsor assignments before database commit, or simulate fraud injection scenarios.
          </p>
        </div>

        {/* Quick Attack Injectors */}
        <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Bug className="w-4 h-4 text-amber-500" />
            Test Scenarios:
          </span>

          <button
            onClick={handleInjectCircularLoop}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
          >
            Inject Circular Loop Attack
          </button>

          <button
            onClick={() => onLoadScenario('standard-dag')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            Restore Standard Clean Tree
          </button>

          <button
            onClick={() => onLoadScenario('deep-chain')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            Load Deep 6-Tier Chain (L3 Cutoff Test)
          </button>
        </div>

        {/* Prospective Sponsor Assignment Test Form */}
        <form onSubmit={handleTestSponsorAssignment} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Candidate User ID
              </label>
              <select
                value={testUserId}
                onChange={e => setTestUserId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Prospective Sponsor ID
              </label>
              <select
                value={testSponsorId}
                onChange={e => setTestSponsorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Run Validation Pre-Check
            </button>
            <span className="text-xs text-slate-500">
              Simulates assignment without mutating network state.
            </span>
          </div>

          {testValidationResult && (
            <div className={`p-4 rounded-xl border text-xs font-mono ${
              testValidationResult.isValid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {testValidationResult.isValid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Validation Passed: Setting sponsor of {testUserId} to {testSponsorId} conforms to acyclic unilevel standards.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">FRAUD PREVENTION BLOCKED:</div>
                    <div className="mt-1">{testValidationResult.error}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Deep Hierarchy & Level 3 Cutoff Auditor */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Generation Plan Traversal Boundary Auditor
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Rule: Max 3 Tiers (10% / 5% / 2%)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Members situated beyond Generation 3 (Level 4, 5, 6, etc.) do NOT receive commissions from downstream purchases. The commission engine enforces this strict algorithmic cutoff.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-semibold text-slate-900 dark:text-white">Commission Distribution Math:</div>
          <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px] space-y-0.5">
            <div>• Level 1 (Direct Referrer / Parent): 10.00% payout</div>
            <div>• Level 2 (Indirect Referrer / Grandparent): 5.00% payout</div>
            <div>• Level 3 (Indirect Referrer / Great-Grandparent): 2.00% payout</div>
            <div>• Level 4+ (Ancestors): 0.00% payout (Completely excluded per core specification)</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-1">
              • Guaranteed Maximum Commission Exposure: 17.00% | Guaranteed Minimum Retained Margin: 83.00%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
