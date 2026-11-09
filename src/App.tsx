/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { MLMUser, LedgerEntry, CommissionCalculationResult, Course } from './types/mlm';
import { INITIAL_USERS, INITIAL_LEDGER, PRESET_SCENARIOS } from './lib/defaultData';
import { detectCycles, DIGITAL_COURSES } from './lib/mlmEngine';
import { Header } from './components/Header';
import { StudentAffiliateDashboard } from './components/StudentAffiliateDashboard';
import { VisualNetworkTree } from './components/VisualNetworkTree';
import { CourseCatalog } from './components/CourseCatalog';
import { PurchaseSimulator } from './components/PurchaseSimulator';
import { FraudSecurityScanner } from './components/FraudSecurityScanner';
import { FinancialLedger } from './components/FinancialLedger';
import { WithdrawalPortal } from './components/WithdrawalPortal';
import { JsonExportModal } from './components/JsonExportModal';
import { AuthScreen } from './components/AuthScreen';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  LayoutDashboard, 
  BookOpen, 
  GitBranch, 
  ReceiptText, 
  Wallet, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck,
  Code,
  Battery, 
  Wifi, 
  Signal, 
  Sparkles,
  TrendingUp,
  X,
  LogIn
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'glass-dark' | 'corporate-blue'>('corporate-blue');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [users, setUsers] = useState<MLMUser[]>(INITIAL_USERS);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [courses, setCourses] = useState<Course[]>(DIGITAL_COURSES);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeUserId, setActiveUserId] = useState<string>('USR-001');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('USR-008');
  const [lastResult, setLastResult] = useState<CommissionCalculationResult | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('standard-dag');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Sync theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'glass-dark') {
      root.classList.add('dark');
      root.classList.remove('light', 'theme-corporate-blue');
    } else {
      root.classList.remove('dark');
      root.classList.add('light', 'theme-corporate-blue');
    }
  }, [theme]);

  // Check for circular loop anomaly in current network
  const cycleAudit = useMemo(() => detectCycles(users), [users]);
  const currentUser = useMemo(() => users.find(u => u.id === activeUserId) || users[0], [users, activeUserId]);

  // Calculate total active recursive downline count for the current user
  const totalDownlinesCount = useMemo(() => {
    if (!currentUser) return 0;
    let count = 0;
    const queue = [currentUser.id];
    const visited = new Set<string>([currentUser.id]);
    while (queue.length > 0) {
      const parentId = queue.shift()!;
      const direct = users.filter(u => u.sponsorId === parentId && !visited.has(u.id));
      for (const child of direct) {
        visited.add(child.id);
        queue.push(child.id);
        count++;
      }
    }
    return count;
  }, [users, currentUser]);

  // Handlers
  const handleAddUser = (newUser: MLMUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: MLMUser) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleApplyTransaction = (result: CommissionCalculationResult, updatedUsers: MLMUser[]) => {
    setLastResult(result);
    setUsers(updatedUsers);
    setLedger(prev => [...result.ledgerEntries, ...prev]);
  };

  const handleWithdrawalComplete = (updatedUsers: MLMUser[], newLedgerEntry: LedgerEntry) => {
    setUsers(updatedUsers);
    setLedger(prev => [newLedgerEntry, ...prev]);
  };

  const handleToggleUserActive = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isActiveMember: !u.isActiveMember } : u))
    );
  };

  const handleLoadScenario = (scenarioId: string) => {
    const sc = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (sc) {
      setActiveScenarioId(scenarioId);
      setUsers(sc.getUsers());
      setLastResult(null);
    }
  };

  const handleSelectBuyerForSimulator = (userId: string) => {
    setSelectedBuyerId(userId);
    setIsSimulatorOpen(true);
  };

  // Auth flow handlers
  const handleLoginSuccess = (user: MLMUser) => {
    setActiveUserId(user.id);
    setIsAuthenticated(true);
  };

  const handleRequestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsAuthenticated(false);
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const isDark = theme === 'glass-dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} app-bg-surface text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500/20 selection:text-indigo-600`}>
      {/* Top Application Bar */}
      <Header
        activeTab={activeTab}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleLoadScenario}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        hasCycleAnomaly={cycleAudit.hasCycle}
        theme={theme}
        setTheme={setTheme}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        totalDownlinesCount={totalDownlinesCount}
        onRequestLogout={handleRequestLogout}
        onUpdateUser={handleUpdateUser}
        onOpenAuth={() => setIsAuthenticated(false)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col justify-start items-center p-3 sm:p-6 w-full max-w-7xl mx-auto">
        {/* Critical Circular Loop Banner if Active */}
        {cycleAudit.hasCycle && (
          <div className="w-full mb-6 p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <span className="font-extrabold uppercase tracking-wider font-mono text-rose-950 dark:text-white">
                  Circular Dependency Detected:
                </span>
                <span className="font-mono ml-1.5 font-bold text-rose-800 dark:text-rose-200">
                  {cycleAudit.cyclePathFormatted}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('fraud')}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl cursor-pointer whitespace-nowrap shadow-xs"
            >
              Inspect Anomaly & Sever
            </button>
          </div>
        )}

        {/* Global Tab Switcher Strip (Visible when Authenticated) */}
        {isAuthenticated ? (
          <div className="w-full mb-6 flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Course Catalog</span>
              </button>

              <button
                onClick={() => setActiveTab('tree')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tree'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Network Tree</span>
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ReceiptText className="w-4 h-4" />
                <span>Double-Entry Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'withdrawals'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallets & Payouts</span>
              </button>

              <button
                onClick={() => setActiveTab('fraud')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'fraud'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Security Scanner</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#0F172A] dark:bg-white text-emerald-400 dark:text-slate-900 border border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Enterprise Admin</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsJsonModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/10"
              >
                <Code className="w-3.5 h-3.5 text-indigo-600 dark:text-emerald-400" />
                <span>Deterministic JSON Hub</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full mb-6 p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium">
                Guest Preview Mode Active · Sign in below or pick any 1-Click Demo Partner to access live genealogy trees.
              </span>
            </div>
            <button
              onClick={() => handleLoginSuccess(users[0])}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
            >
              1-Click Demo Sign In (Rajesh)
            </button>
          </div>
        )}

        {/* CONTAINER ROUTING: Mobile Shell Mode vs Full-Width Desktop Mode */}
        {viewMode === 'mobile' ? (
          /* Realistic iPhone / Mobile App Mockup Shell (Width: 414px) */
          <div className="relative w-full max-w-[420px] rounded-[52px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800/90 ring-8 ring-slate-900/40 my-2">
            {/* Camera Pill & Speaker Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-900/60" />
            </div>

            {/* Mobile Viewport Screen */}
            <div className={`relative w-full rounded-[44px] overflow-hidden ${
              isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900'
            } flex flex-col min-h-[780px] max-h-[820px] transition-colors`}>
              
              {/* Mobile Status Bar */}
              <div className="pt-3 pb-2 px-7 flex items-center justify-between text-xs font-semibold select-none z-20">
                <span className="font-mono text-[11px]">9:41</span>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Signal className="w-3.5 h-3.5 fill-current" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 pb-24">
                {!isAuthenticated ? (
                  <AuthScreen
                    users={users}
                    onLoginSuccess={handleLoginSuccess}
                    onRegisterUser={handleAddUser}
                    theme={theme}
                  />
                ) : (
                  <>
                    {activeTab === 'dashboard' && (
                      <StudentAffiliateDashboard
                        currentUser={currentUser}
                        ledger={ledger}
                        onNavigateTab={setActiveTab}
                        onOpenCourse={() => setActiveTab('courses')}
                        onQuickWithdraw={() => setActiveTab('withdrawals')}
                      />
                    )}

                    {activeTab === 'courses' && (
                      <CourseCatalog
                        currentUser={currentUser}
                        allUsers={users}
                        courses={courses}
                        onCoursePurchased={handleApplyTransaction}
                      />
                    )}

                    {activeTab === 'tree' && (
                      <VisualNetworkTree
                        users={users}
                        onAddUser={handleAddUser}
                        onUpdateUser={handleUpdateUser}
                        onSelectBuyerForSimulator={handleSelectBuyerForSimulator}
                      />
                    )}

                    {activeTab === 'ledger' && (
                      <FinancialLedger ledger={ledger} />
                    )}

                    {activeTab === 'withdrawals' && (
                      <WithdrawalPortal
                        users={users}
                        onWithdrawalComplete={handleWithdrawalComplete}
                        onToggleUserActive={handleToggleUserActive}
                      />
                    )}

                    {activeTab === 'fraud' && (
                      <FraudSecurityScanner
                        users={users}
                        onUpdateUsers={setUsers}
                        onLoadScenario={handleLoadScenario}
                      />
                    )}

                    {activeTab === 'admin' && (
                      <AdminDashboard
                        users={users}
                        ledger={ledger}
                        courses={courses}
                        onUpdateUsers={setUsers}
                        onUpdateLedger={setLedger}
                        onUpdateCourses={setCourses}
                        onNavigateTab={setActiveTab}
                        theme={theme}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Bottom Mobile Tab Navigation Bar */}
              {isAuthenticated ? (
                <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-3 py-2.5 flex items-center justify-around z-20 shadow-lg">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === 'dashboard' ? 'text-indigo-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px]">Home</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === 'courses' ? 'text-orange-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-[10px]">Courses</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tree')}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === 'tree' ? 'text-sky-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <GitBranch className="w-5 h-5" />
                    <span className="text-[10px]">Network</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ledger')}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === 'ledger' ? 'text-emerald-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <ReceiptText className="w-5 h-5" />
                    <span className="text-[10px]">Ledger</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === 'withdrawals' ? 'text-emerald-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-[10px]">Payout</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === 'admin' ? 'text-emerald-500 font-bold' : 'text-slate-400'
                    }`}
                    title="Enterprise Admin Control Center"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px]">Admin</span>
                  </button>
                </div>
              ) : (
                <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-500 z-20">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Partner Portal Active
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                    Secure 256-bit Login
                  </span>
                </div>
              )}

              {/* iPhone Home Indicator Line */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/60 rounded-full z-30 pointer-events-none" />
            </div>
          </div>
        ) : (
          /* Full Desktop Layout Viewport */
          <div className="w-full space-y-6">
            {!isAuthenticated ? (
              <AuthScreen
                users={users}
                onLoginSuccess={handleLoginSuccess}
                onRegisterUser={handleAddUser}
                theme={theme}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <StudentAffiliateDashboard
                    currentUser={currentUser}
                    ledger={ledger}
                    onNavigateTab={setActiveTab}
                    onOpenCourse={() => setActiveTab('courses')}
                    onQuickWithdraw={() => setActiveTab('withdrawals')}
                  />
                )}

                {activeTab === 'courses' && (
                  <CourseCatalog
                    currentUser={currentUser}
                    allUsers={users}
                    courses={courses}
                    onCoursePurchased={handleApplyTransaction}
                  />
                )}

                {activeTab === 'tree' && (
                  <VisualNetworkTree
                    users={users}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onSelectBuyerForSimulator={handleSelectBuyerForSimulator}
                  />
                )}

                {activeTab === 'ledger' && (
                  <FinancialLedger ledger={ledger} />
                )}

                {activeTab === 'withdrawals' && (
                  <WithdrawalPortal
                    users={users}
                    onWithdrawalComplete={handleWithdrawalComplete}
                    onToggleUserActive={handleToggleUserActive}
                  />
                )}

                {activeTab === 'fraud' && (
                  <FraudSecurityScanner
                    users={users}
                    onUpdateUsers={setUsers}
                    onLoadScenario={handleLoadScenario}
                  />
                )}

                {activeTab === 'admin' && (
                  <AdminDashboard
                    users={users}
                    ledger={ledger}
                    courses={courses}
                    onUpdateUsers={setUsers}
                    onUpdateLedger={setLedger}
                    onUpdateCourses={setCourses}
                    onNavigateTab={setActiveTab}
                    theme={theme}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Instant Commission Traversal Simulator Modal */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Recursive Commission Traversal Simulator
                </h3>
              </div>

              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <PurchaseSimulator
              users={users}
              selectedBuyerId={selectedBuyerId}
              setSelectedBuyerId={setSelectedBuyerId}
              onApplyTransaction={(res, upd) => {
                handleApplyTransaction(res, upd);
              }}
            />
          </div>
        </div>
      )}

      {/* Deterministic JSON Hub Modal */}
      <JsonExportModal
        users={users}
        ledger={ledger}
        lastResult={lastResult}
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />

      {/* Global Interactive Logout Feedback Dialog Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirmLogout={handleConfirmLogout}
        userName={currentUser?.name || 'Partner'}
      />
    </div>
  );
}
