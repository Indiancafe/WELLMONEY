/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MLMUser, TreeNodeData } from '../types/mlm';
import { buildGenealogyTree, getUpwardLineage, formatINR, validateSponsorAssignment } from '../lib/mlmEngine';
import { 
  Users, 
  UserPlus, 
  Search, 
  ArrowDown, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Network,
  GitBranch,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface VisualNetworkTreeProps {
  users: MLMUser[];
  onAddUser: (user: MLMUser) => void;
  onUpdateUser: (user: MLMUser) => void;
  onSelectBuyerForSimulator: (userId: string) => void;
}

export const VisualNetworkTree: React.FC<VisualNetworkTreeProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onSelectBuyerForSimulator,
}) => {
  const [rootFocusId, setRootFocusId] = useState<string>('USR-001');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('USR-001');
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
  const rootNode = useMemo(() => {
    // Find node with rootFocusId anywhere in tree
    function findNode(nodes: TreeNodeData[]): TreeNodeData | undefined {
      for (const n of nodes) {
        if (n.id === rootFocusId) return n;
        if (n.children && n.children.length > 0) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return undefined;
    }
    return findNode(tree) || tree[0];
  }, [tree, rootFocusId]);

  const selectedUser = useMemo(() => users.find(u => u.id === selectedNodeId), [users, selectedNodeId]);
  const upwardLineage = useMemo(() => {
    if (!selectedNodeId) return [];
    return getUpwardLineage(users, selectedNodeId, 3);
  }, [users, selectedNodeId]);

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
    setSelectedNodeId(created.id);
    setNewName('');
    setNewEmail('');
    setNewId(`USR-0${users.length + 2}`);
    setValidationError(null);
  };

  // Organize downlines by tiers (Level 1, Level 2, Level 3) from current focused root
  const level1Nodes = rootNode?.children || [];
  const level2Nodes = level1Nodes.flatMap(l1 => l1.children || []);
  const level3Nodes = level2Nodes.flatMap(l2 => l2.children || []);

  const renderNodeCard = (node: TreeNodeData, level: 1 | 2 | 3) => {
    const isSelected = selectedNodeId === node.id;
    const isNeonBlue = level === 1; // Direct downlines: Neon Blue border
    const isLightPurple = level >= 2; // Indirect downlines: Light Purple border

    return (
      <div
        key={node.id}
        onClick={() => setSelectedNodeId(node.id)}
        className={`relative group rounded-2xl p-3.5 transition-all cursor-pointer text-left min-w-[170px] max-w-[210px] shadow-sm ${
          isSelected
            ? 'scale-105 z-10 shadow-lg'
            : 'hover:scale-102'
        } ${
          !node.isActiveMember
            ? 'bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-500'
            : isNeonBlue
            ? 'bg-white dark:bg-slate-900 border-2 border-sky-400 dark:border-sky-400/80 shadow-sky-500/10'
            : 'bg-white dark:bg-slate-900 border-2 border-purple-400 dark:border-purple-400/80 shadow-purple-500/10'
        }`}
      >
        {/* Tier Label Pill */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            level === 1
              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
          }`}>
            Level {level} ({level === 1 ? '10%' : level === 2 ? '5%' : '2%'})
          </span>

          {node.isActiveMember ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" title="Active Account" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" title="Inactive Account" />
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
            !node.isActiveMember
              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : isNeonBlue
              ? 'bg-sky-500 text-white shadow-sky-500/20'
              : 'bg-purple-500 text-white shadow-purple-500/20'
          }`}>
            {node.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {node.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {node.id}
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Team:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
            {node.totalTeamCount}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            Visual Network Tree & Downline Flowchart
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarchical generation tree with Neon Blue direct referrals (Level 1) and Light Purple indirect referrals (Levels 2 & 3).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Downline
          </button>
        </div>
      </div>

      {/* Main Flowchart Canvas & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flowchart Area (8 cols) */}
        <div className="lg:col-span-8 bg-slate-50/70 dark:bg-slate-950/60 rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-start overflow-x-auto min-h-[560px]">
          {/* Centered Root Node */}
          {rootNode && (
            <div className="flex flex-col items-center mb-8">
              <div
                onClick={() => setSelectedNodeId(rootNode.id)}
                className={`group relative rounded-3xl p-5 border-4 transition-all cursor-pointer text-center shadow-xl ${
                  selectedNodeId === rootNode.id
                    ? 'border-indigo-600 ring-4 ring-indigo-600/20 bg-white dark:bg-slate-900 scale-105'
                    : 'border-indigo-500/80 bg-white dark:bg-slate-900 hover:scale-102'
                }`}
              >
                <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  {rootNode.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="mt-2.5">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {rootNode.name}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    Root Active Node ({rootNode.id})
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatINR(rootNode.walletBalance)}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-medium">
                    {rootNode.totalTeamCount} Team
                  </span>
                </div>
              </div>

              {/* Downward Tree Connector Arrow */}
              <div className="flex flex-col items-center my-3">
                <div className="w-0.5 h-6 bg-indigo-300 dark:bg-indigo-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              </div>
            </div>
          )}

          {/* Level 1: Direct Downlines (Neon Blue Borders) */}
          <div className="w-full space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-300 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                Level 1: Direct Referrals (10% Commission Rate)
              </span>
              <span className="font-mono text-slate-400">{level1Nodes.length} Members</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-sky-200/80 dark:border-sky-900/40">
              {level1Nodes.length === 0 ? (
                <div className="text-xs text-slate-400 py-3">No direct downlines enrolled yet.</div>
              ) : (
                level1Nodes.map(node => renderNodeCard(node, 1))
              )}
            </div>
          </div>

          {/* Level 2: Indirect Downlines (Light Purple Borders) */}
          {level2Nodes.length > 0 && (
            <div className="w-full space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  Level 2: Grandchildren Downlines (5% Commission Rate)
                </span>
                <span className="font-mono text-slate-400">{level2Nodes.length} Members</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-purple-200/80 dark:border-purple-900/40">
                {level2Nodes.map(node => renderNodeCard(node, 2))}
              </div>
            </div>
          )}

          {/* Level 3: Indirect Downlines (Soft Purple Borders) */}
          {level3Nodes.length > 0 && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  Level 3: Great-Grandchildren Downlines (2% Commission Rate)
                </span>
                <span className="font-mono text-slate-400">{level3Nodes.length} Members</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-indigo-200/80 dark:border-indigo-900/40">
                {level3Nodes.map(node => renderNodeCard(node, 3))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Member Detail Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedUser ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {selectedUser.name}
                    </h3>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      ID: {selectedUser.id}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Wallet</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {formatINR(selectedUser.walletBalance)}
                  </span>
                </div>
              </div>

              {/* Account Status Badge */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Membership: {selectedUser.isActiveMember ? 'Active (Eligible)' : 'Inactive'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedUser.isActiveMember ? 'Withdrawals unlocked' : 'Withdrawals locked'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onUpdateUser({
                      ...selectedUser,
                      isActiveMember: !selectedUser.isActiveMember,
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-colors ${
                    selectedUser.isActiveMember
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedUser.isActiveMember ? 'Set Inactive' : 'Activate'}
                </button>
              </div>

              {/* Upward Lineage 3-Tier Sponsor Trace */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Upward Sponsor Traversal (Lineage)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Max 3 Tiers</span>
                </div>

                <div className="space-y-2">
                  {upwardLineage.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      Root node (No upline sponsor).
                    </div>
                  ) : (
                    upwardLineage.map(item => (
                      <div
                        key={item.user.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg font-mono font-bold text-[10px] flex items-center justify-center ${
                            item.level === 1 ? 'bg-sky-100 text-sky-800' :
                            item.level === 2 ? 'bg-purple-100 text-purple-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            L{item.level}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {item.user.name} ({item.relation})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.user.id}</span>
                          </div>
                        </div>

                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                          {item.rateLabel}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Focus as Root Node Action */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setRootFocusId(selectedUser.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
                >
                  Set as Root Focus Node
                </button>
                <button
                  onClick={() => onSelectBuyerForSimulator(selectedUser.id)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Simulate Purchase for {selectedUser.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center text-xs text-slate-400">
              Tap any node in the flowchart to view their sponsor lineage and downline team.
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Add Downline Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  User ID (Unique)
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={e => setNewId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sponsor (Direct Upline / Parent)
                </label>
                <select
                  value={newSponsorId}
                  onChange={e => handleSponsorChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="">[None - Create as Master Root]</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newIsActive}
                  onChange={e => setNewIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Account Active Member (Eligible for wallet withdrawal)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!validationError}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl cursor-pointer shadow-md shadow-indigo-600/20"
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
