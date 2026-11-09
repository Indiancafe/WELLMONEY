/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MLMUser, TreeNodeData } from '../types/mlm';
import { buildGenealogyTree, getUpwardLineage, formatINR, validateSponsorAssignment } from '../lib/mlmEngine';
import { 
  ChevronRight, 
  ChevronDown, 
  UserPlus, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  GitCommit,
  User
} from 'lucide-react';

interface GenealogyTreeProps {
  users: MLMUser[];
  onAddUser: (user: MLMUser) => void;
  onUpdateUser: (user: MLMUser) => void;
  onSelectBuyerForSimulator: (userId: string) => void;
}

export const GenealogyTree: React.FC<GenealogyTreeProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onSelectBuyerForSimulator,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'USR-001');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'USR-001': true,
    'USR-002': true,
    'USR-003': true,
    'USR-004': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newId, setNewId] = useState(`USR-0${users.length + 1}`);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSponsorId, setNewSponsorId] = useState<string>('USR-001');
  const [newIsActive, setNewIsActive] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const tree = useMemo(() => buildGenealogyTree(users), [users]);
  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
  const upwardLineage = useMemo(() => {
    if (!selectedUserId) return [];
    return getUpwardLineage(users, selectedUserId, 4);
  }, [users, selectedUserId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    users.forEach(u => (allIds[u.id] = true));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleSponsorChange = (sponsorVal: string) => {
    setNewSponsorId(sponsorVal);
    const result = validateSponsorAssignment(users, newId, sponsorVal || null);
    if (!result.isValid) {
      setValidationError(result.error || 'Invalid sponsor');
    } else {
      setValidationError(null);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) {
      setValidationError('User ID and Name are required.');
      return;
    }

    if (users.some(u => u.id.toLowerCase() === newId.trim().toLowerCase())) {
      setValidationError(`User with ID ${newId} already exists.`);
      return;
    }

    const check = validateSponsorAssignment(users, newId, newSponsorId || null);
    if (!check.isValid) {
      setValidationError(check.error || 'Fraud check failed');
      return;
    }

    const created: MLMUser = {
      id: newId.trim().toUpperCase(),
      name: newName.trim(),
      email: newEmail.trim() || `${newId.toLowerCase()}@network.in`,
      sponsorId: newSponsorId || null,
      isActiveMember: newIsActive,
      walletBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      totalPurchases: 0,
      joinedAt: new Date().toISOString(),
      rankTitle: newSponsorId ? 'Distributor' : 'Master Root',
      coursesEnrolled: [],
    };

    onAddUser(created);
    setShowAddModal(false);
    setSelectedUserId(created.id);
    setNewName('');
    setNewEmail('');
    setNewId(`USR-0${users.length + 2}`);
    setValidationError(null);
  };

  const renderTreeNode = (node: TreeNodeData, depth: number) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedUserId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const matchesSearch = !searchQuery || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      node.id.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={node.id} className="relative select-none">
        <div
          onClick={() => setSelectedUserId(node.id)}
          className={`group relative flex items-center justify-between p-3.5 my-1.5 rounded-xl border transition-all cursor-pointer ${
            isSelected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/60 text-slate-900 dark:text-white shadow-xs'
              : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          } ${!matchesSearch && searchQuery ? 'opacity-30' : ''}`}
          style={{ marginLeft: `${Math.min(depth * 28, 140)}px` }}
        >
          {depth > 0 && (
            <div className="tree-connector-line border-slate-300 dark:border-slate-700" />
          )}

          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer transition-colors"
                title={isExpanded ? 'Collapse downlines' : 'Expand downlines'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center text-slate-300 dark:text-slate-700 shrink-0">
                <GitCommit className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
              {node.name.slice(0, 1)}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {node.name}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  ({node.id})
                </span>
                {node.levelFromRoot === 0 && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                    Root
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{node.rankTitle || 'Member'}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono font-medium text-slate-700 dark:text-slate-300">
                  {node.directDownlineCount} Direct
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono text-slate-500">
                  {node.totalTeamCount} Team
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-3">
            <div className="text-right">
              <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatINR(node.walletBalance)}
              </div>
              <div className="text-[11px] text-slate-400">Balance</div>
            </div>

            <div className="flex items-center gap-1.5">
              {node.isActiveMember ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium" title="Active: Eligible to withdraw">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Active</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium" title="Inactive: Withdrawals blocked">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inactive</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-6 my-0.5">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Network Genealogy & Downline Hierarchy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual Unilevel Tree with instant multi-tier sponsor traversal inspection (L1: 10% · L2: 5% · L3: 2%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Collapse All
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Main Grid: Tree Explorer (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree Directory */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col shadow-xs">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter members by name or ID (e.g. USR-004)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
            {tree.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No users found in genealogy tree.
              </div>
            ) : (
              tree.map(rootNode => renderTreeNode(rootNode, 0))
            )}
          </div>
        </div>

        {/* Right: Selected Member Inspector & Upward Lineage */}
        <div className="lg:col-span-5 space-y-4">
          {selectedUser ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
              {/* Member Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                        {selectedUser.name}
                      </h3>
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        [{selectedUser.id}]
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {selectedUser.email}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Enrolled: {new Date(selectedUser.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Wallet Balance</div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatINR(selectedUser.walletBalance)}
                  </div>
                </div>
              </div>

              {/* Account Status & Direct Actions */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {selectedUser.isActiveMember ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Active Membership Status</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Inactive Membership</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedUser.isActiveMember
                      ? 'Fully verified. Wallet withdrawals permitted.'
                      : 'Withdrawals locked per MLM Rule 1.'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onUpdateUser({
                      ...selectedUser,
                      isActiveMember: !selectedUser.isActiveMember,
                    });
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
                    selectedUser.isActiveMember
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {selectedUser.isActiveMember ? 'Set Inactive' : 'Activate Member'}
                </button>
              </div>

              {/* Upward Lineage Traversal Trace */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Upward Sponsor Hierarchy (Recursive Path)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Max 3 Tiers</span>
                </div>

                <div className="space-y-2">
                  {upwardLineage.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg">
                      This user is the Root node (No upline sponsor). Purchases by this member generate zero upline commissions.
                    </div>
                  ) : (
                    upwardLineage.map((item) => (
                      <div
                        key={item.user.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                          item.level <= 3
                            ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                            : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold ${
                            item.level === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' :
                            item.level === 2 ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800' :
                            item.level === 3 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                          }`}>
                            L{item.level}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.user.name}</span>
                              <span className="font-mono text-slate-500 text-[11px]">({item.user.id})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Relation: <span className="text-slate-700 dark:text-slate-300 font-medium">{item.relation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-mono font-bold text-xs ${
                            item.level <= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}>
                            {item.rateLabel} Payout
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.level <= 3 ? 'Eligible' : 'Exceeds L3 Cutoff'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Fast Action CTA */}
              <div className="pt-2">
                <button
                  onClick={() => onSelectBuyerForSimulator(selectedUser.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  Simulate Purchase for {selectedUser.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 shadow-xs">
              Select a member from the genealogy tree to view their upline lineage and wallet details.
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Add Network Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  User ID (Unique)
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={e => setNewId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ramesh@network.in"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sponsor (Direct Upline / Parent)
                </label>
                <select
                  value={newSponsorId}
                  onChange={e => handleSponsorChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="">[None - Create as Top-Level Root]</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Self-referral check and circular dependency prevention active.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newIsActive}
                  onChange={e => setNewIsActive(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Account Active Member (Eligible for wallet withdrawal)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!validationError}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
