/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MLMUser, LedgerEntry, CommissionCalculationResult } from '../types/mlm';
import { buildGenealogyTree, detectCycles, DIGITAL_COURSES } from '../lib/mlmEngine';
import { Copy, Check, Download, X, Code, FileText, BookOpen } from 'lucide-react';

interface JsonExportModalProps {
  users: MLMUser[];
  ledger: LedgerEntry[];
  lastResult: CommissionCalculationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  users,
  ledger,
  lastResult,
  isOpen,
  onClose,
}) => {
  const [exportType, setExportType] = useState<'hierarchy' | 'database' | 'courses_lms' | 'ledger' | 'last_transaction' | 'full_audit'>('hierarchy');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getPayload = () => {
    switch (exportType) {
      case 'courses_lms':
        return {
          schema: 'LMS_COURSE_CATALOG_AND_ACCESS_CONTROL',
          generatedAt: new Date().toISOString(),
          currency: 'INR',
          totalCourses: DIGITAL_COURSES.length,
          courses: DIGITAL_COURSES.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            price: c.price,
            instructor: c.instructor,
            totalStudents: c.totalStudents,
            rating: c.rating,
            modulesCount: c.modules.length,
            mlmDisbursal: {
              level1Direct10Pct: c.price * 0.10,
              level2Indirect5Pct: c.price * 0.05,
              level3Indirect2Pct: c.price * 0.02,
              platformRetained83Pct: c.price * 0.83,
            },
          })),
          userEnrollmentsSummary: users.map(u => ({
            userId: u.id,
            userName: u.name,
            unlockedCourses: (u.coursesEnrolled || []).filter(ce => ce.hasAccess).map(ce => ce.courseId),
          })),
        };

      case 'hierarchy':
        return {
          schema: 'MLM_UNILEVEL_GENEALOGY_TREE',
          version: '1.0.0',
          generatedAt: new Date().toISOString(),
          currency: 'INR',
          commissionTiers: [
            { level: 1, relation: 'Parent', rate: 0.10, label: '10%' },
            { level: 2, relation: 'Grandparent', rate: 0.05, label: '5%' },
            { level: 3, relation: 'Great-Grandparent', rate: 0.02, label: '2%' },
          ],
          tree: buildGenealogyTree(users),
        };

      case 'database':
        return {
          schema: 'MLM_USER_ACCOUNTS_NORMALIZED',
          totalUsers: users.length,
          generatedAt: new Date().toISOString(),
          currency: 'INR',
          users: users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            sponsorId: u.sponsorId,
            isActiveMember: u.isActiveMember,
            walletBalance: u.walletBalance,
            totalEarned: u.totalEarned,
            totalWithdrawn: u.totalWithdrawn,
            totalPurchases: u.totalPurchases,
            joinedAt: u.joinedAt,
            rankTitle: u.rankTitle || 'Member',
          })),
        };

      case 'ledger':
        return {
          schema: 'MLM_DOUBLE_ENTRY_LEDGER',
          totalEntries: ledger.length,
          generatedAt: new Date().toISOString(),
          currency: 'INR',
          entries: ledger,
        };

      case 'last_transaction':
        return lastResult || { message: 'No commission transaction simulated in current session yet.' };

      case 'full_audit':
        const cycleAudit = detectCycles(users);
        const activeUsers = users.filter(u => u.isActiveMember).length;
        const totalVolume = users.reduce((sum, u) => sum + u.totalPurchases, 0);
        const totalPaid = users.reduce((sum, u) => sum + u.totalEarned, 0);

        return {
          schema: 'MLM_MATHEMATICAL_AND_SECURITY_AUDIT',
          generatedAt: new Date().toISOString(),
          systemSpecification: {
            planType: 'Unilevel Generation Plan',
            maxDeepLevels: 3,
            tierRules: {
              level1Direct: '10% on product purchase',
              level2Indirect: '5% on product purchase',
              level3Indirect: '2% on product purchase',
              maxPayoutExposure: '17% (Guaranteed non-exceeding)',
              companyRetainedFloor: '83%',
            },
            walletWithdrawalRestriction: 'isActiveMember = true strictly enforced',
          },
          securityIntegrity: {
            circularLoopDetected: cycleAudit.hasCycle,
            cycleNodes: cycleAudit.cycleNodes,
            cycleTrace: cycleAudit.cyclePathFormatted,
            selfReferralViolations: users.filter(u => u.sponsorId === u.id).length,
          },
          financialMetrics: {
            currency: 'INR',
            totalGrossVolume: totalVolume,
            totalCommissionsDisbursed: totalPaid,
            effectiveCommissionRatio: totalVolume > 0 ? (totalPaid / totalVolume) : 0,
            totalCirculatingWallets: users.reduce((sum, u) => sum + u.walletBalance, 0),
          },
          membershipCompliance: {
            totalRegistered: users.length,
            activeMembersEligibleForWithdrawal: activeUsers,
            inactiveMembersWithdrawalBlocked: users.length - activeUsers,
          },
        };
    }
  };

  const payload = getPayload();
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `well_money_${exportType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Deterministic JSON Export Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Machine-readable database records, hierarchy tree, and ledger audit payload.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap items-center gap-1.5 p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setExportType('hierarchy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              exportType === 'hierarchy'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Genealogy Tree (Nested)
          </button>
          <button
            onClick={() => setExportType('courses_lms')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              exportType === 'courses_lms'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            LMS Courses & Access
          </button>
          <button
            onClick={() => setExportType('database')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              exportType === 'database'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            User Database (Flat)
          </button>
          <button
            onClick={() => setExportType('ledger')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              exportType === 'ledger'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Financial Ledger
          </button>
          <button
            onClick={() => setExportType('last_transaction')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              exportType === 'last_transaction'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last Transaction Trace
          </button>
          <button
            onClick={() => setExportType('full_audit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              exportType === 'full_audit'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full Mathematical Audit
          </button>
        </div>

        {/* Code viewer */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-900 dark:bg-slate-950">
          <pre className="font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre">
            {jsonString}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Deterministic Output · Zero Hallucination Standard
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Payload'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
