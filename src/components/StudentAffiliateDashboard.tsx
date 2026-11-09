/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MLMUser, LedgerEntry, Course } from '../types/mlm';
import { formatINR, DIGITAL_COURSES } from '../lib/mlmEngine';
import { 
  TrendingUp, 
  BookOpen, 
  Wallet, 
  Share2, 
  Compass, 
  ArrowUpRight, 
  Award, 
  Sparkles, 
  Check, 
  Play, 
  Lock,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';

interface StudentAffiliateDashboardProps {
  currentUser: MLMUser;
  ledger: LedgerEntry[];
  onNavigateTab: (tab: string) => void;
  onOpenCourse: (courseId: string) => void;
  onQuickWithdraw: () => void;
}

export const StudentAffiliateDashboard: React.FC<StudentAffiliateDashboardProps> = ({
  currentUser,
  ledger,
  onNavigateTab,
  onOpenCourse,
  onQuickWithdraw,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter courses unlocked by this user
  const enrolledCourseIds = new Set(
    (currentUser.coursesEnrolled || []).filter(c => c.hasAccess).map(c => c.courseId)
  );
  const enrolledCourses = DIGITAL_COURSES.filter(c => enrolledCourseIds.has(c.id));
  const completionPercentage = enrolledCourses.length > 0 ? 78 : 0;

  // Filter user's recent commission credits
  const userCommissions = ledger.filter(
    e => e.userId === currentUser.id && e.credit > 0
  ).slice(0, 3);

  const handleShareLink = () => {
    const link = `https://wellmoney.app/ref/${currentUser.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER: Colorful Gradient Greeting Card (Electric Indigo to Violet) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
        {/* Soft Background Glowing Blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* User Profile Avatar with vibrant ring */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-indigo-700 flex items-center justify-center text-[10px]" title="Online Member">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
                  Welcome back, {currentUser.name}!
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {/* Active Affiliate Rank Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-200">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentUser.rankTitle || 'Gold Star Affiliate'} 🏆</span>
                </div>

                <span className="text-xs text-indigo-200 font-mono">
                  ID: {currentUser.id}
                </span>
              </div>
            </div>
          </div>

          {/* Gamified Tier Progress Strip */}
          <div className="w-full md:w-auto min-w-[220px] bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-indigo-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Diamond Tier Progress
              </span>
              <span className="font-bold font-mono text-emerald-300">85%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 w-[85%]" />
            </div>
            <span className="text-[11px] text-indigo-200 block">
              1 more team sale to reach Diamond Leader
            </span>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL STATUS GRID: Two side-by-side colorful rounded cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Emerald Green Theme (Total Earnings & Wallet) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white shadow-lg shadow-emerald-500/15 border border-emerald-400/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 block">
                Total Earnings
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums mt-1">
                {formatINR(currentUser.totalEarned)}
              </div>
            </div>

            {/* Vibrant green arrow icon pointing up */}
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-400/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-100 block text-[11px]">Available Wallet Balance:</span>
              <span className="font-mono font-bold text-base text-white tabular-nums">
                {formatINR(currentUser.walletBalance)}
              </span>
            </div>

            <button
              onClick={onQuickWithdraw}
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 font-bold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Card 2: Sunset Orange Theme (My Courses & Learning Progress) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-lg shadow-orange-500/15 border border-orange-400/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-100 block">
                My Courses
              </span>
              <div className="text-3xl font-extrabold font-display tracking-tight mt-1">
                {enrolledCourses.length} <span className="text-lg font-normal text-orange-200">Active</span>
              </div>
            </div>

            {/* Book Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-orange-400/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-orange-100">Learning Completion</span>
              <span className="font-mono font-bold">{completionPercentage}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
              <div 
                className="h-full rounded-full bg-white transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION PILLS: Circular colorful action buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-white/10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Withdraw Money (Green Icon) */}
          <button
            onClick={onQuickWithdraw}
            className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Withdraw Money
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Instant wallet payout
              </div>
            </div>
          </button>

          {/* Action 2: Share Referral Link (Blue Icon) */}
          <button
            onClick={handleShareLink}
            className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
              {copiedLink ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {copiedLink ? 'Link Copied!' : 'Share Referral Link'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Earn 10% direct payout
              </div>
            </div>
          </button>

          {/* Action 3: Browse Catalog (Orange Icon) */}
          <button
            onClick={() => onNavigateTab('courses')}
            className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Browse Catalog
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Explore 5 digital courses
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. RECENT COMMISSIONS STREAM & MY ENROLLED COURSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Commission Inflow */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Recent Commission Inflow
            </h3>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View Full Ledger
            </button>
          </div>

          <div className="space-y-2.5">
            {userCommissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No commissions received yet. Share your referral link to earn 10%!
              </div>
            ) : (
              userCommissions.map(comm => (
                <div
                  key={comm.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {comm.description}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      TXN: {comm.transactionId} · {new Date(comm.timestamp).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatINR(comm.credit)}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                      Settled
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Active Courses */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              My Unlocked Courses
            </h3>
            <button
              onClick={() => onNavigateTab('courses')}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Explore More
            </button>
          </div>

          <div className="space-y-2.5">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No courses unlocked yet. Browse our catalog and start learning today!
              </div>
            ) : (
              enrolledCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => onOpenCourse(course.id)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 hover:border-orange-300 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {course.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {course.modules.length} Lessons · Instructor: {course.instructor}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
