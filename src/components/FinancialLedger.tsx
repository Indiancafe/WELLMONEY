/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LedgerEntry } from '../types/mlm';
import { formatINR } from '../lib/mlmEngine';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface FinancialLedgerProps {
  ledger: LedgerEntry[];
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({ ledger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEntries = useMemo(() => {
    return ledger.filter(entry => {
      const matchesSearch =
        entry.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === 'ALL' ||
        (filterType === 'PURCHASES' && entry.type === 'PRODUCT_PURCHASE') ||
        (filterType === 'COMMISSIONS' && entry.type.startsWith('COMMISSION')) ||
        (filterType === 'WITHDRAWALS' && entry.type.includes('WITHDRAWAL'));

      return matchesSearch && matchesType;
    });
  }, [ledger, searchQuery, filterType]);

  const totalCredits = useMemo(() => {
    return ledger.filter(e => e.status === 'SETTLED').reduce((sum, e) => sum + e.credit, 0);
  }, [ledger]);

  const totalDebits = useMemo(() => {
    return ledger.filter(e => e.status === 'SETTLED').reduce((sum, e) => sum + e.debit, 0);
  }, [ledger]);

  const handleExportCSV = () => {
    const headers = ['Ledger ID', 'Transaction ID', 'Timestamp', 'Type', 'User ID', 'User Name', 'Debit (INR)', 'Credit (INR)', 'Balance After (INR)', 'Status', 'Description'];
    const rows = filteredEntries.map(e => [
      e.id,
      e.transactionId,
      e.timestamp,
      e.type,
      e.userId,
      `"${e.userName}"`,
      e.debit.toFixed(2),
      e.credit.toFixed(2),
      e.balanceAfter.toFixed(2),
      e.status,
      `"${e.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mlm_financial_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Double-Entry Financial Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable audit trail of purchases, multi-tier commission credits, and wallet disbursements in INR (₹).
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-900 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Export Ledger CSV
        </button>
      </div>

      {/* Ledger Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Ledger Entries</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {ledger.length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Inflow / Credits</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatINR(totalCredits)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Outflow / Debits</span>
          <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
            {formatINR(totalDebits)}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by transaction ID, member name, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors ${
              filterType === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setFilterType('PURCHASES')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors ${
              filterType === 'PURCHASES'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setFilterType('COMMISSIONS')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors ${
              filterType === 'COMMISSIONS'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Commissions (10/5/2%)
          </button>
          <button
            onClick={() => setFilterType('WITHDRAWALS')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors ${
              filterType === 'WITHDRAWALS'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Dense Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">TXN / ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4 text-right">Debit (Out)</th>
                <th className="py-3 px-4 text-right">Credit (In)</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-300 font-bold whitespace-nowrap">
                      {entry.transactionId}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {entry.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums text-[11px]">
                      {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <span className="block text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                        entry.type === 'PRODUCT_PURCHASE' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                        entry.type === 'COMMISSION_CREDIT_L1' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        entry.type === 'COMMISSION_CREDIT_L2' ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' :
                        entry.type === 'COMMISSION_CREDIT_L3' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                        entry.type === 'WALLET_WITHDRAWAL' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                        'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}>
                        {entry.type.replace('COMMISSION_CREDIT_', 'L').replace('_', ' ')}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-sans mt-0.5 truncate max-w-xs">
                        {entry.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <span className="text-slate-900 dark:text-white font-medium">{entry.userName}</span>
                      <span className="block font-mono text-[11px] text-slate-400">{entry.userId}</span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                      {entry.debit > 0 ? (
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">-{formatINR(entry.debit)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                      {entry.credit > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{formatINR(entry.credit)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-900 dark:text-white font-bold">
                      {formatINR(entry.balanceAfter)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {entry.status === 'SETTLED' ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Blocked
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
