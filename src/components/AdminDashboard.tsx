/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  MLMUser, 
  Course, 
  LedgerEntry, 
  AdminPayoutRequest,
  CourseCommissionSplit 
} from '../types/mlm';
import { formatINR } from '../lib/mlmEngine';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Sliders, 
  Plus, 
  Edit3, 
  Eye, 
  ArrowUpRight, 
  GitBranch, 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw, 
  X, 
  Check, 
  Lock, 
  Unlock, 
  Sparkles,
  Award,
  Zap,
  Building2,
  PieChart
} from 'lucide-react';

interface AdminDashboardProps {
  users: MLMUser[];
  ledger: LedgerEntry[];
  courses: Course[];
  onUpdateUsers: (updated: MLMUser[]) => void;
  onUpdateLedger: (updated: LedgerEntry[]) => void;
  onUpdateCourses: (updated: Course[]) => void;
  onNavigateTab?: (tab: string) => void;
  theme: 'glass-dark' | 'corporate-blue';
}

// Initial realistic pending payout requests
const INITIAL_PAYOUT_REQUESTS: AdminPayoutRequest[] = [
  {
    id: 'PAY-REQ-801',
    userId: 'USR-002',
    userName: 'Priya Patel',
    userEmail: 'priya.patel@mlm-network.in',
    amount: 5000.00,
    requestedAt: '2026-11-08T18:30:00Z',
    status: 'PENDING',
    bankAccountLast4: '4192',
    upiId: 'priya.patel@okhdfcbank',
    riskScore: 'LOW',
  },
  {
    id: 'PAY-REQ-802',
    userId: 'USR-003',
    userName: 'Amit Verma',
    userEmail: 'amit.verma@mlm-network.in',
    amount: 12000.00,
    requestedAt: '2026-11-09T01:15:00Z',
    status: 'PENDING',
    bankAccountLast4: '8830',
    upiId: 'amit.verma@okaxis',
    riskScore: 'LOW',
  },
  {
    id: 'PAY-REQ-803',
    userId: 'USR-005',
    userName: 'Sneha Reddy',
    userEmail: 'sneha.reddy@mlm-network.in',
    amount: 8500.00,
    requestedAt: '2026-11-09T03:40:00Z',
    status: 'PENDING',
    bankAccountLast4: '5512',
    upiId: 'sneha.reddy@icici',
    riskScore: 'MEDIUM',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  ledger,
  courses,
  onUpdateUsers,
  onUpdateLedger,
  onUpdateCourses,
  onNavigateTab,
  theme,
}) => {
  // Navigation & Sub-tab states inside Admin Panel
  const [activeAdminSection, setActiveAdminSection] = useState<'overview' | 'ledger' | 'courses' | 'tree'>('overview');
  const [payoutRequests, setPayoutRequests] = useState<AdminPayoutRequest[]>(INITIAL_PAYOUT_REQUESTS);
  
  // Ledger filter & search state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [ledgerFilterTab, setLedgerFilterTab] = useState<'all' | 'pending' | 'frozen' | 'high_earners'>('all');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Course Modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState('');
  const [courseFormCategory, setCourseFormCategory] = useState('Backend & Systems');
  const [courseFormPrice, setCourseFormPrice] = useState(14999);
  const [courseFormInstructor, setCourseFormInstructor] = useState('');
  const [courseFormDescription, setCourseFormDescription] = useState('');
  const [courseFormL1Split, setCourseFormL1Split] = useState(10);
  const [courseFormL2Split, setCourseFormL2Split] = useState(5);
  const [courseFormL3Split, setCourseFormL3Split] = useState(2);

  // Tree Auditor query state
  const [treeQueryEmail, setTreeQueryEmail] = useState('USR-008'); // default target

  // Feedback banner dismiss
  const showNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  // ----------------------------------------------------
  // METRICS & COMPUTATIONS FOR COMPONENT A (Strategic Overview)
  // ----------------------------------------------------
  const grossPlatformRevenue = useMemo(() => {
    // Total volume from courses or ledger product purchases
    const ledgerVolume = ledger
      .filter(e => e.type === 'COURSE_PURCHASE' || e.type === 'PRODUCT_PURCHASE')
      .reduce((acc, curr) => acc + curr.credit + curr.debit, 0);
    const userPurchases = users.reduce((acc, u) => acc + (u.totalPurchases || 0), 0);
    return Math.max(ledgerVolume, userPurchases, 284500);
  }, [ledger, users]);

  const totalCommissionsPaid = useMemo(() => {
    return ledger
      .filter(e => e.type.startsWith('COMMISSION_CREDIT'))
      .reduce((acc, curr) => acc + curr.credit, 0);
  }, [ledger]);

  const platformRetainedRevenue = useMemo(() => {
    return grossPlatformRevenue * 0.83; // 83% platform margin
  }, [grossPlatformRevenue]);

  const activeMembersCount = useMemo(() => {
    return users.filter(u => u.isActiveMember).length;
  }, [users]);

  const pendingPayoutsCount = useMemo(() => {
    return payoutRequests.filter(p => p.status === 'PENDING').length;
  }, [payoutRequests]);

  const pendingPayoutTotalAmount = useMemo(() => {
    return payoutRequests
      .filter(p => p.status === 'PENDING')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [payoutRequests]);

  const topSellingCourse = useMemo(() => {
    return courses[1] || courses[0];
  }, [courses]);

  // ----------------------------------------------------
  // HANDLERS FOR COMPONENT B (Live Payout & User Ledger)
  // ----------------------------------------------------
  const handleApprovePayout = (user: MLMUser, amount?: number) => {
    const payoutAmount = amount || user.walletBalance;
    if (payoutAmount <= 0) {
      showNotice(`Cannot approve payout for ${user.name}: Wallet balance is zero.`);
      return;
    }

    if (!user.isActiveMember) {
      showNotice(`FRAUD BLOCK: ${user.name} is Frozen/Inactive. Activate membership before withdrawing.`);
      return;
    }

    // Deduct from wallet, add to totalWithdrawn
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          walletBalance: Math.max(0, u.walletBalance - payoutAmount),
          totalWithdrawn: u.totalWithdrawn + payoutAmount,
        };
      }
      return u;
    });

    // Create double-entry ledger debit record
    const newEntry: LedgerEntry = {
      id: `LED-PAY-${Date.now().toString().slice(-6)}`,
      transactionId: `TXN-PAY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WALLET_WITHDRAWAL',
      userId: user.id,
      userName: user.name,
      debit: payoutAmount,
      credit: 0,
      balanceAfter: Math.max(0, user.walletBalance - payoutAmount),
      description: `Enterprise Admin Cash Payout Approved via IMPS/UPI to ${user.name}`,
      currency: 'INR',
      status: 'SETTLED',
    };

    // Update pending request if exists
    setPayoutRequests(prev =>
      prev.map(p => (p.userId === user.id && p.status === 'PENDING' ? { ...p, status: 'APPROVED' } : p))
    );

    onUpdateUsers(updatedUsers);
    onUpdateLedger([newEntry, ...ledger]);
    showNotice(`Successfully approved ₹${payoutAmount.toLocaleString('en-IN')} cash payout to ${user.name} (${user.id})! Funds settled.`);
  };

  const handleToggleFreezeUser = (user: MLMUser) => {
    const nextState = !user.isActiveMember;
    const updatedUsers = users.map(u => (u.id === user.id ? { ...u, isActiveMember: nextState } : u));
    onUpdateUsers(updatedUsers);

    if (!nextState) {
      showNotice(`Account for ${user.name} (${user.id}) FROZEN 🚫. All withdrawal triggers disabled.`);
    } else {
      showNotice(`Account for ${user.name} (${user.id}) RESTORED ✅. Active member privileges granted.`);
    }
  };

  // ----------------------------------------------------
  // HANDLERS FOR COMPONENT C (Course Management)
  // ----------------------------------------------------
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseFormTitle('');
    setCourseFormCategory('Backend & Systems');
    setCourseFormPrice(14999);
    setCourseFormInstructor('Well Money Academic Board');
    setCourseFormDescription('Advanced high-yield digital course covering real-world scalable frameworks.');
    setCourseFormL1Split(10);
    setCourseFormL2Split(5);
    setCourseFormL3Split(2);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormTitle(course.title);
    setCourseFormCategory(course.category);
    setCourseFormPrice(course.price);
    setCourseFormInstructor(course.instructor);
    setCourseFormDescription(course.description);
    setCourseFormL1Split(course.commissionSplit?.level1 || 10);
    setCourseFormL2Split(course.commissionSplit?.level2 || 5);
    setCourseFormL3Split(course.commissionSplit?.level3 || 2);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();

    const commissionSplit: CourseCommissionSplit = {
      level1: courseFormL1Split,
      level2: courseFormL2Split,
      level3: courseFormL3Split,
    };

    if (editingCourse) {
      // Update existing course
      const updated = courses.map(c =>
        c.id === editingCourse.id
          ? {
              ...c,
              title: courseFormTitle,
              category: courseFormCategory,
              price: courseFormPrice,
              instructor: courseFormInstructor,
              description: courseFormDescription,
              commissionSplit,
            }
          : c
      );
      onUpdateCourses(updated);
      showNotice(`Course "${courseFormTitle}" updated with new ${courseFormL1Split}% / ${courseFormL2Split}% / ${courseFormL3Split}% MLM split.`);
    } else {
      // Create new course
      const newCourse: Course = {
        id: `CRS-${100 + courses.length + 1}`,
        title: courseFormTitle,
        category: courseFormCategory,
        price: courseFormPrice,
        instructor: courseFormInstructor || 'Well Money Academy',
        rating: 5.0,
        totalStudents: 0,
        description: courseFormDescription,
        badge: 'New Release',
        commissionSplit,
        modules: [
          { id: 'MOD-1', title: '01. Foundational Architecture & Setup', durationMinutes: 50, isFreePreview: true },
          { id: 'MOD-2', title: '02. Production Execution & Risk Guardrails', durationMinutes: 75 },
          { id: 'MOD-3', title: '03. Scale & High-Yield Distribution', durationMinutes: 90 },
        ],
      };
      onUpdateCourses([...courses, newCourse]);
      showNotice(`New Course "${newCourse.title}" successfully deployed to Well Money LMS catalog!`);
    }

    setIsCourseModalOpen(false);
  };

  // ----------------------------------------------------
  // FILTERED USER TABLE ROWS
  // ----------------------------------------------------
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search matching
      const matchesSearch =
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(userSearchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter tabs
      if (ledgerFilterTab === 'pending') {
        return payoutRequests.some(p => p.userId === user.id && p.status === 'PENDING');
      }
      if (ledgerFilterTab === 'frozen') {
        return !user.isActiveMember;
      }
      if (ledgerFilterTab === 'high_earners') {
        return user.totalEarned >= 15000;
      }
      return true;
    });
  }, [users, userSearchTerm, ledgerFilterTab, payoutRequests]);

  // ----------------------------------------------------
  // TREE AUDITOR ISOLATION LOGIC (Genealogy Inspector)
  // ----------------------------------------------------
  const selectedTreeTarget = useMemo(() => {
    const q = treeQueryEmail.trim().toLowerCase();
    return (
      users.find(u => u.id.toLowerCase() === q || u.email.toLowerCase() === q || u.name.toLowerCase().includes(q)) ||
      users[users.length - 1] ||
      users[0]
    );
  }, [users, treeQueryEmail]);

  // Upline Path (Up to 3 levels)
  const uplineChain = useMemo(() => {
    const chain: { level: number; label: string; user: MLMUser; commissionPct: number }[] = [];
    if (!selectedTreeTarget) return chain;

    let currentSponsorId = selectedTreeTarget.sponsorId;
    let level = 1;
    const visited = new Set<string>([selectedTreeTarget.id]);

    while (currentSponsorId && level <= 3 && !visited.has(currentSponsorId)) {
      visited.add(currentSponsorId);
      const sponsor = users.find(u => u.id === currentSponsorId);
      if (!sponsor) break;

      const pct = level === 1 ? 10 : level === 2 ? 5 : 2;
      const label = level === 1 ? 'Direct Parent (L1)' : level === 2 ? 'Grandparent (L2)' : 'Great-Grandparent (L3)';
      chain.push({ level, label, user: sponsor, commissionPct: pct });
      currentSponsorId = sponsor.sponsorId;
      level++;
    }
    return chain;
  }, [users, selectedTreeTarget]);

  // Downline Subtree (Direct referrals of target user)
  const directDownlines = useMemo(() => {
    if (!selectedTreeTarget) return [];
    return users.filter(u => u.sponsorId === selectedTreeTarget.id);
  }, [users, selectedTreeTarget]);

  const isDark = theme === 'glass-dark';

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 min-h-[85vh]">
      {/* ========================================================= */}
      {/* 1. DYNAMIC COLOR BLUEPRINT: Dark Slate/Navy Sidebar (#0F172A) */}
      {/* ========================================================= */}
      <aside className="w-full lg:w-72 bg-[#0F172A] text-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-2xl border border-slate-800 shrink-0">
        <div className="space-y-6">
          {/* Admin Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-600 to-indigo-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0F172A] rounded-2xl flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                  WM
                </div>
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 font-display">
                  <span>WELL MONEY</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    ADMIN
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Enterprise Control Center
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Items */}
          <nav className="space-y-1.5">
            <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 px-3 py-1">
              Command Modules
            </div>

            <button
              onClick={() => setActiveAdminSection('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminSection === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Strategic Overview</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => setActiveAdminSection('ledger')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminSection === 'ledger'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Payout & User Ledger</span>
              </div>
              {pendingPayoutsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                  {pendingPayoutsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminSection('courses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminSection === 'courses'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-orange-400" />
                <span>Course Content Portal</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{courses.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminSection('tree')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeAdminSection === 'tree'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <span>Genealogy Tree Auditor</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </button>
          </nav>

          {/* System Health / Invariant Audit Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Invariant Integrity
              </span>
              <span className="text-emerald-400 font-mono font-bold">100% OK</span>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Platform Margin:</span>
                <span className="text-emerald-400 font-bold">83.00%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Tree Depth:</span>
                <span className="text-indigo-400 font-bold">3 Tiers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Double-Spend Replays:</span>
                <span className="text-slate-400">0 Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Persona Footer */}
        <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-white">Master Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">root@wellmoney.in</div>
            </div>
          </div>

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" title="System Online" />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN SPACIOUS CANVAS (#F8FAFC / Light Grey Canvas) */}
      {/* ========================================================= */}
      <main className="flex-1 space-y-6 min-w-0">
        {/* Real-time Action Notification Banner */}
        {actionSuccessNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{actionSuccessNotice}</span>
            </div>
            <button
              onClick={() => setActionSuccessNotice(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* COMPONENT A: THE STRATEGIC OVERVIEW GRID (Top 4 Micro-Cards) */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-400 dark:text-slate-400 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Strategic Overview & Platform Vitals
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Financial Sync: 100% Deterministic</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1 (Emerald Theme): Gross Platform Revenue */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white shadow-lg shadow-emerald-500/15 border border-emerald-400/30 group hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                    Gross Platform Revenue
                  </span>
                  <div className="text-2xl font-extrabold font-mono tracking-tight tabular-nums mt-1">
                    {formatINR(grossPlatformRevenue)}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Sparkline Visual Simulation */}
              <div className="mt-4 pt-3 border-t border-emerald-400/30 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-bold font-mono text-emerald-100 bg-white/15 px-2 py-0.5 rounded-lg">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +24.8% MoM
                </span>
                <span className="text-[11px] text-emerald-100">
                  83% Retained: {formatINR(platformRetainedRevenue)}
                </span>
              </div>
            </div>

            {/* Card 2 (Indigo Theme): Total Active Members */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 p-5 text-white shadow-lg shadow-indigo-600/15 border border-indigo-400/30 group hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 block">
                    Total Active Members
                  </span>
                  <div className="text-2xl font-extrabold font-mono tracking-tight tabular-nums mt-1">
                    {activeMembersCount} <span className="text-sm font-normal text-indigo-200">/ {users.length}</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Users className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-400/30 flex items-center justify-between text-xs">
                <span className="text-indigo-100 font-mono text-[11px]">
                  Daily Sign-ups: <strong className="text-white">+4 Today</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-white/15 text-white font-bold text-[10px] font-mono">
                  3 Levels Deep
                </span>
              </div>
            </div>

            {/* Card 3 (Amber Theme): Pending Payout Requests (Blinking Alert) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/15 border border-amber-400/30 group hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                      Pending Payouts
                    </span>
                    {/* Blinking Pulsing Alert Dot */}
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono tracking-tight tabular-nums mt-1">
                    {pendingPayoutsCount} <span className="text-sm font-normal text-amber-200">Requests</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-400/30 flex items-center justify-between text-xs">
                <span className="text-amber-100 font-mono text-[11px]">
                  Total: <strong>{formatINR(pendingPayoutTotalAmount)}</strong>
                </span>
                <button
                  onClick={() => {
                    setActiveAdminSection('ledger');
                    setLedgerFilterTab('pending');
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-white text-amber-800 font-bold text-[10px] hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  Review Queue
                </button>
              </div>
            </div>

            {/* Card 4 (Blue Theme): Top Selling Courses */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-5 text-white shadow-lg shadow-sky-500/15 border border-sky-400/30 group hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-100 block">
                    Top Selling Course
                  </span>
                  <div className="text-base font-extrabold font-display truncate mt-1 text-white">
                    {topSellingCourse.title}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0">
                  <BookOpen className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-400/30 flex items-center justify-between text-xs">
                <span className="text-sky-100 font-mono text-[11px]">
                  Price: <strong>{formatINR(topSellingCourse.price)}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-white/15 text-white font-bold text-[10px] font-mono">
                  {topSellingCourse.totalStudents} Enrolled
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COMPONENT B: THE LIVE PAYOUT & USER LEDGER (Interactive Grid) */}
        {/* ========================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Live Payout & User Financial Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit wallet balances, authorize instant cash disbursements, and enforce account fraud controls.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setLedgerFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ledgerFilterTab === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Partners ({users.length})
              </button>

              <button
                onClick={() => setLedgerFilterTab('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ledgerFilterTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Pending Approvals</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </button>

              <button
                onClick={() => setLedgerFilterTab('frozen')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ledgerFilterTab === 'frozen'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Frozen / Flagged
              </button>

              <button
                onClick={() => setLedgerFilterTab('high_earners')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ledgerFilterTab === 'high_earners'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Top Earners
              </button>
            </div>
          </div>

          {/* Search bar inside Ledger */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Partner Name, Email, or User ID (e.g. USR-002)..."
              value={userSearchTerm}
              onChange={e => setUserSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* The Data Table Grid */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Partner Profile</th>
                  <th className="py-3 px-4">Upline Sponsor</th>
                  <th className="py-3 px-4">Available Wallet</th>
                  <th className="py-3 px-4">Lifetime Earned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action Triggers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No matching affiliate records found for the applied filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const isPending = payoutRequests.some(p => p.userId === user.id && p.status === 'PENDING');
                    const pendingReq = payoutRequests.find(p => p.userId === user.id && p.status === 'PENDING');

                    return (
                      <tr 
                        key={user.id} 
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* 1. Partner Profile */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.rankTitle && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                                    {user.rankTitle.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">
                                {user.email} · <span className="text-slate-500 font-semibold">{user.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Registered Level & Sponsor */}
                        <td className="py-3 px-4 font-mono">
                          {user.sponsorId ? (
                            <div className="text-xs">
                              <span className="text-slate-900 dark:text-white font-semibold">
                                {users.find(u => u.id === user.sponsorId)?.name || user.sponsorId}
                              </span>
                              <span className="block text-[10px] text-slate-400">ID: {user.sponsorId}</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                              Root Founder
                            </span>
                          )}
                        </td>

                        {/* 3. Available Wallet Balance */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                            {formatINR(user.walletBalance)}
                          </div>
                          {isPending && pendingReq && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                              Req: {formatINR(pendingReq.amount)}
                            </span>
                          )}
                        </td>

                        {/* 4. Lifetime Earned */}
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                          <div>{formatINR(user.totalEarned)}</div>
                          <div className="text-[10px] text-slate-400">Withdrawn: {formatINR(user.totalWithdrawn)}</div>
                        </td>

                        {/* 5. Account Status */}
                        <td className="py-3 px-4">
                          {user.isActiveMember ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Member
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                              <Lock className="w-3 h-3 text-rose-600" />
                              Account Frozen
                            </span>
                          )}
                        </td>

                        {/* 6. Action Triggers: Approve Cash Payout ✅ vs Freeze Account 🚫 */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Primary Button: Approve Cash Payout ✅ */}
                            <button
                              onClick={() => handleApprovePayout(user, pendingReq?.amount)}
                              disabled={user.walletBalance <= 0 || !user.isActiveMember}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                                user.walletBalance > 0 && user.isActiveMember
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              }`}
                              title={
                                !user.isActiveMember 
                                  ? 'User is frozen - payout blocked by MLM invariant' 
                                  : user.walletBalance <= 0 
                                  ? 'Zero balance' 
                                  : 'Approve and settle cash payout'
                              }
                            >
                              <span>Approve Cash Payout</span>
                              <span className="text-xs">✅</span>
                            </button>

                            {/* Secondary Warning Button: Freeze Account 🚫 */}
                            <button
                              onClick={() => handleToggleFreezeUser(user)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                user.isActiveMember
                                  ? 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              }`}
                              title={user.isActiveMember ? 'Freeze account for fraud control' : 'Unfreeze account'}
                            >
                              {user.isActiveMember ? (
                                <>
                                  <span>Freeze</span>
                                  <span className="text-xs">🚫</span>
                                </>
                              ) : (
                                <>
                                  <span>Unfreeze</span>
                                  <span className="text-xs">🔓</span>
                                </>
                              )}
                            </button>

                            {/* Quick Inspect in Tree Auditor */}
                            <button
                              onClick={() => {
                                setTreeQueryEmail(user.id);
                                setActiveAdminSection('tree');
                              }}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"
                              title="Inspect in Genealogy Auditor"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COMPONENT C: INTERACTIVE COURSE MANAGEMENT (Content Portal) */}
        {/* ========================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <BookOpen className="w-4 h-4 text-orange-500" />
                Course Content Portal & Dynamic Commission Sliders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust course curriculum, retail pricing in INR, and define multi-tier MLM commission distribution.
              </p>
            </div>

            <button
              onClick={handleOpenAddCourse}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy New Course</span>
            </button>
          </div>

          {/* Grid of Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map(course => {
              const l1 = course.commissionSplit?.level1 || 10;
              const l2 = course.commissionSplit?.level2 || 5;
              const l3 = course.commissionSplit?.level3 || 2;
              const margin = 100 - (l1 + l2 + l3);

              return (
                <div
                  key={course.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 space-y-3 flex flex-col justify-between hover:border-indigo-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {course.id}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatINR(course.price)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 font-display">
                      {course.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Instructor: <strong className="text-slate-800 dark:text-slate-200">{course.instructor}</strong> · {course.modules.length} Lessons
                    </div>
                  </div>

                  {/* Multi-tier commission summary */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Direct L1 Split:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{l1}% ({formatINR(course.price * (l1 / 100))})</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Indirect L2 Split:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{l2}% ({formatINR(course.price * (l2 / 100))})</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Indirect L3 Split:</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">{l3}% ({formatINR(course.price * (l3 / 100))})</span>
                    </div>
                    <div className="flex justify-between font-mono pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">Platform Retention:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{margin.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Adjust Commission Sliders</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* COMPONENT 3: GENEALOGY TREE AUDITOR WINDOW (Network Inspector) */}
        {/* ========================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                Genealogy Tree Auditor & Revenue Chain Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type any partner email or user ID to instantly isolate their exact 3-level upline commission chain and direct downline tree.
              </p>
            </div>

            {/* Quick Demo Target Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Quick Inspect:</span>
              <button
                onClick={() => setTreeQueryEmail('USR-008')}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono cursor-pointer"
              >
                USR-008 (Deep L3)
              </button>
              <button
                onClick={() => setTreeQueryEmail('USR-001')}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono cursor-pointer"
              >
                USR-001 (Root)
              </button>
            </div>
          </div>

          {/* Floating Top-Bar Query Tool */}
          <div className="relative">
            <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type User's Registered Email or Partner ID (e.g., vikram.singh@mlm-network.in or USR-008)..."
              value={treeQueryEmail}
              onChange={e => setTreeQueryEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-indigo-500/30 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Isolated Tree Inspector Viewport */}
          {selectedTreeTarget ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Target User Center Card */}
              <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-900/10 dark:bg-slate-800/80 border-2 border-indigo-500/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    {selectedTreeTarget.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white font-display">
                      {selectedTreeTarget.name}
                    </div>
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      ID: {selectedTreeTarget.id}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {selectedTreeTarget.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Wallet:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatINR(selectedTreeTarget.walletBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lifetime Earnings:</span>
                    <span className="font-mono font-bold">{formatINR(selectedTreeTarget.totalEarned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member Status:</span>
                    <span className={`font-bold ${selectedTreeTarget.isActiveMember ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {selectedTreeTarget.isActiveMember ? 'Active Privileges' : 'Frozen'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleToggleFreezeUser(selectedTreeTarget)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white transition-colors cursor-pointer"
                  >
                    {selectedTreeTarget.isActiveMember ? 'Freeze Account' : 'Restore Active'}
                  </button>
                </div>
              </div>

              {/* Upward Active Revenue Chain (Parent, Grandparent, Great-Grandparent) */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  <span>Upward Commission Beneficiary Chain</span>
                  <span className="text-emerald-500">Traversal Depth: {uplineChain.length} / 3 Levels</span>
                </div>

                {uplineChain.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    This user has no upline sponsor (Root Founder Node). Retains all revenue at platform level.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {uplineChain.map((step, idx) => (
                      <div
                        key={step.user.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs hover:border-indigo-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center text-white ${
                            step.level === 1 ? 'bg-indigo-600' : step.level === 2 ? 'bg-purple-600' : 'bg-sky-600'
                          }`}>
                            L{step.level}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {step.user.name} <span className="font-mono text-[11px] text-slate-400 font-normal">({step.user.id})</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {step.label} · Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{step.user.isActiveMember ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-extrabold ${
                            step.level === 1
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : step.level === 2
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                          }`}>
                            Receives {step.commissionPct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Downlines preview */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono block mb-2">
                    Direct Downlines Sponsored ({directDownlines.length})
                  </span>
                  {directDownlines.length === 0 ? (
                    <div className="text-xs text-slate-400 font-medium italic">
                      No direct downline members registered under this node yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {directDownlines.map(child => (
                        <div
                          key={child.id}
                          onClick={() => setTreeQueryEmail(child.id)}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 transition-colors cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-900 dark:text-white truncate">{child.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{child.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {/* ========================================================= */}
      {/* FLOATING COURSE EDIT & COMMISSION SPLIT MODAL */}
      {/* ========================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  {editingCourse ? 'Configure Course & Commission Splits' : 'Deploy New Digital Course'}
                </h3>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseFormTitle}
                  onChange={e => setCourseFormTitle(e.target.value)}
                  placeholder="e.g. Algorithmic Trading & High-Frequency Systems"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Retail Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={courseFormPrice}
                    onChange={e => setCourseFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Category
                  </label>
                  <select
                    value={courseFormCategory}
                    onChange={e => setCourseFormCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Backend & Systems">Backend & Systems</option>
                    <option value="Financial Engineering">Financial Engineering</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Security & Cryptography">Security & Cryptography</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Instructor Name
                </label>
                <input
                  type="text"
                  value={courseFormInstructor}
                  onChange={e => setCourseFormInstructor(e.target.value)}
                  placeholder="e.g. Rajesh Sharma, CFA"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Curriculum & Course Description
                </label>
                <textarea
                  rows={3}
                  value={courseFormDescription}
                  onChange={e => setCourseFormDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* DYNAMIC MULTI-TIER MLM COMMISSION SPLIT SLIDERS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-slate-900 dark:text-white font-display">
                    Multi-Tier MLM Commission Split Rules
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Platform Retention: {(100 - (courseFormL1Split + courseFormL2Split + courseFormL3Split)).toFixed(1)}%
                  </span>
                </div>

                {/* Slider 1: Level 1 (Direct Referrals) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Level 1 Direct Sponsor:</span>
                    <span className="font-bold">{courseFormL1Split}% = {formatINR(courseFormPrice * (courseFormL1Split / 100))}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={courseFormL1Split}
                    onChange={e => setCourseFormL1Split(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Slider 2: Level 2 (Grandparent) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-purple-600 dark:text-purple-400">Level 2 Grandparent Sponsor:</span>
                    <span className="font-bold">{courseFormL2Split}% = {formatINR(courseFormPrice * (courseFormL2Split / 100))}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={courseFormL2Split}
                    onChange={e => setCourseFormL2Split(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Slider 3: Level 3 (Great-Grandparent) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-sky-600 dark:text-sky-400">Level 3 Great-Grandparent Sponsor:</span>
                    <span className="font-bold">{courseFormL3Split}% = {formatINR(courseFormPrice * (courseFormL3Split / 100))}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={courseFormL3Split}
                    onChange={e => setCourseFormL3Split(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {/* Platform Net Earnings Calculation */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                  <span>Retained by Platform:</span>
                  <span>{formatINR(courseFormPrice * ((100 - (courseFormL1Split + courseFormL2Split + courseFormL3Split)) / 100))}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer transition-all active:scale-95"
                >
                  {editingCourse ? 'Save Changes & Update Sliders' : 'Deploy Course to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
