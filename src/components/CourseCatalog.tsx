/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, MLMUser, CoursePurchaseEvent, CommissionCalculationResult } from '../types/mlm';
import { DIGITAL_COURSES, formatINR, processCoursePurchase, verifyCourseAccess } from '../lib/mlmEngine';
import { 
  Sparkles, 
  Check, 
  Play, 
  Lock, 
  BookOpen, 
  Star, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  X,
  Layers,
  Award
} from 'lucide-react';

interface CourseCatalogProps {
  currentUser: MLMUser;
  allUsers: MLMUser[];
  onCoursePurchased: (result: CommissionCalculationResult, updatedUsers: MLMUser[]) => void;
  selectedCourseIdForPlayer?: string | null;
  onClosePlayer?: () => void;
  courses?: Course[];
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  currentUser,
  allUsers,
  onCoursePurchased,
  selectedCourseIdForPlayer,
  onClosePlayer,
  courses,
}) => {
  const catalog = courses || DIGITAL_COURSES;
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(currentUser.id);
  const [activeCoursePlayer, setActiveCoursePlayer] = useState<Course | null>(
    selectedCourseIdForPlayer 
      ? catalog.find(c => c.id === selectedCourseIdForPlayer) || null 
      : null
  );
  const [purchaseSuccessResult, setPurchaseSuccessResult] = useState<CommissionCalculationResult | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const activeBuyer = allUsers.find(u => u.id === selectedBuyerId) || currentUser;

  const handleBuyCourse = (course: Course) => {
    setPurchaseError(null);
    const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

    const event: CoursePurchaseEvent = {
      buyerId: activeBuyer.id,
      courseId: course.id,
      purchaseAmount: course.price,
      invoiceId,
    };

    try {
      const { result, updatedUsers } = processCoursePurchase(allUsers, event);
      onCoursePurchased(result, updatedUsers);
      setPurchaseSuccessResult(result);
    } catch (err: any) {
      setPurchaseError(err.message || 'Failed to process course purchase.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Buyer Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            Digital Courses & LMS Academy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Direct course sales paired with automated 3-Tier MLM commission distribution (10% L1 · 5% L2 · 2% L3 · 83% Margin).
          </p>
        </div>

        {/* Buyer Switcher for Demo Simulation */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium pl-2">Buying as:</span>
          <select
            value={selectedBuyerId}
            onChange={e => setSelectedBuyerId(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
          >
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {purchaseError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          {purchaseError}
        </div>
      )}

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalog.map(course => {
          const hasAccess = verifyCourseAccess(activeBuyer, course.id);

          return (
            <div
              key={course.id}
              className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300"
            >
              <div>
                {/* Course Thumbnail with Neon Overlay Badge */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  {course.imagePath ? (
                    <img
                      src={course.imagePath}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 text-center">
                      <BookOpen className="w-12 h-12 text-indigo-400 opacity-60" />
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Small colorful neon pill-badge over image */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white bg-indigo-600/90 backdrop-blur-md border border-white/20 shadow-lg">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {course.badge || 'Includes MLM Payout'}
                    </span>
                  </div>

                  {/* Access Status Pin */}
                  <div className="absolute top-3 right-3">
                    {hasAccess ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-300 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40">
                        <Check className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-slate-300 bg-slate-950/80 backdrop-blur-md border border-white/15">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Price overlay on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <span className="text-xs text-slate-300 font-medium">
                      {course.category}
                    </span>
                    <span className="text-xl font-extrabold font-mono tracking-tight text-white drop-shadow">
                      {formatINR(course.price)}
                    </span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base font-display text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{course.rating}</span>
                      <span>({course.totalStudents})</span>
                    </div>
                    <span>{course.modules.length} Modules</span>
                  </div>

                  {/* 3-Tier Commission Breakdown Preview */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>MLM Disbursal:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      L1: {formatINR(course.price * 0.10)} · L2: {formatINR(course.price * 0.05)} · L3: {formatINR(course.price * 0.02)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action Button */}
              <div className="p-5 pt-0">
                {hasAccess ? (
                  <button
                    onClick={() => setActiveCoursePlayer(course)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Learning (Unlocked)
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyCourse(course)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 group-hover:scale-[1.01]"
                  >
                    <span>Buy Now & Start Earning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Modal upon Course Purchase */}
      {purchaseSuccessResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Course Unlocked & Commissions Disbursed!
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Invoice: {purchaseSuccessResult.invoiceId}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPurchaseSuccessResult(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Asset Unlock Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Asset Unlock Executed: hasAccess = true
              </div>
              <p className="text-emerald-700 dark:text-emerald-400">
                Course content is unlocked for {purchaseSuccessResult.buyer.name}. DRM token generated securely.
              </p>
            </div>

            {/* Multi-Tier Commission Disbursal Summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Upward Recursive Traversal Result:
              </span>

              {purchaseSuccessResult.commissionSteps.map(step => (
                <div
                  key={step.sponsorId}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Level {step.level} ({step.relation}): {step.sponsorName}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-mono">
                      {step.formula}
                    </span>
                  </div>

                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{formatINR(step.commissionAmount)}
                  </span>
                </div>
              ))}

              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between text-indigo-900 dark:text-indigo-200 font-mono">
                <span>Platform Retained Margin (83%):</span>
                <span className="font-bold">{formatINR(purchaseSuccessResult.companyRetainedAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const boughtCourse = catalog.find(c => c.id === purchaseSuccessResult.course?.id);
                setPurchaseSuccessResult(null);
                if (boughtCourse) setActiveCoursePlayer(boughtCourse);
              }}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Launch Course Player Now
            </button>
          </div>
        </div>
      )}

      {/* LMS Course Lesson Player Modal */}
      {activeCoursePlayer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {activeCoursePlayer.id} · {activeCoursePlayer.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {activeCoursePlayer.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setActiveCoursePlayer(null);
                  if (onClosePlayer) onClosePlayer();
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Mockup with Anti-Piracy Watermark */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-white border border-slate-800 shadow-inner">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 cursor-pointer hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-3">
                Lesson 1: Introduction & High-Level Architecture
              </div>

              {/* Anti-Piracy DRM Token Badge (Never exposes raw video URLs) */}
              <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                DRM Verified · User: {activeBuyer.id}
              </div>
            </div>

            {/* Curriculum Lessons List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Course Curriculum ({activeCoursePlayer.modules.length} Lessons)
              </span>

              <div className="space-y-2">
                {activeCoursePlayer.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {mod.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{mod.durationMinutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
