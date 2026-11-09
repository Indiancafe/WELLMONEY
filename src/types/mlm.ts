/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CourseModule {
  id: string;
  title: string;
  durationMinutes: number;
  isFreePreview?: boolean;
}

export interface CourseCommissionSplit {
  level1: number; // default 10%
  level2: number; // default 5%
  level3: number; // default 2%
}

export interface Course {
  id: string; // e.g. "CRS-101"
  title: string;
  category: string;
  price: number; // INR (₹)
  instructor: string;
  rating: number;
  totalStudents: number;
  description: string;
  modules: CourseModule[];
  badge?: string;
  imagePath?: string;
  commissionSplit?: CourseCommissionSplit;
}

export interface AdminPayoutRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankAccountLast4?: string;
  upiId?: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UserCourseAccess {
  courseId: string;
  hasAccess: boolean;
  unlockedAt?: string;
  invoiceId?: string;
  drmSessionToken?: string; // Content piracy protection: never expose raw video URL
}

export interface MLMUser {
  id: string;
  name: string;
  email: string;
  sponsorId: string | null; // Direct upline / Parent
  isActiveMember: boolean; // Required for wallet withdrawals
  walletBalance: number; // INR (₹)
  totalEarned: number; // Cumulative commissions earned
  totalWithdrawn: number; // Cumulative withdrawals
  totalPurchases: number; // Direct product purchase volume
  joinedAt: string; // ISO date
  rankTitle?: string;
  coursesEnrolled: UserCourseAccess[]; // LMS access records
}

export interface CommissionStepTrace {
  level: number;
  relation: 'Parent' | 'Grandparent' | 'Great-Grandparent';
  sponsorId: string;
  sponsorName: string;
  percentage: number;
  rateLabel: string; // "10%", "5%", "2%"
  commissionAmount: number; // Calculated INR
  formula: string; // "₹10,000.00 × 10% = ₹1,000.00"
  creditedToWallet: boolean;
  preBalance: number;
  postBalance: number;
  isActive: boolean;
  notes?: string;
}

export interface CoursePurchaseEvent {
  buyerId: string;
  courseId: string;
  purchaseAmount: number;
  invoiceId: string;
  paymentMethod?: string;
  referralCodeUsed?: string;
}

export interface CommissionCalculationResult {
  transactionId: string;
  invoiceId: string;
  timestamp: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    sponsorId: string | null;
  };
  course?: {
    id: string;
    title: string;
    price: number;
  };
  productPurchaseAmount: number;
  currency: 'INR';
  totalCommissionPaid: number;
  companyRetainedAmount: number;
  commissionSteps: CommissionStepTrace[];
  traversalPath: string[];
  terminatedReason: 'MAX_DEPTH_REACHED' | 'NO_FURTHER_SPONSOR' | 'CIRCULAR_LOOP_DETECTED';
  isAnomalyDetected: boolean;
  anomalyMessage?: string;
  ledgerEntries: LedgerEntry[];
  unlockedAccess?: {
    buyerId: string;
    courseId: string;
    hasAccess: true;
    unlockedAt: string;
    drmToken: string;
  };
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  invoiceId?: string;
  timestamp: string;
  type: 
    | 'COURSE_PURCHASE'
    | 'PRODUCT_PURCHASE'
    | 'COMMISSION_CREDIT_L1'
    | 'COMMISSION_CREDIT_L2'
    | 'COMMISSION_CREDIT_L3'
    | 'WALLET_WITHDRAWAL'
    | 'WITHDRAWAL_FAILED_INACTIVE'
    | 'DOUBLE_SPEND_REJECTED';
  userId: string;
  userName: string;
  debit: number; // Outflow
  credit: number; // Inflow
  balanceAfter: number;
  description: string;
  currency: 'INR';
  status: 'SETTLED' | 'BLOCKED' | 'FLAGGED';
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  requestedAt: string;
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
  rejectionCode?: 'ERR_INACTIVE_MEMBER_WITHDRAWAL_DENIED' | 'ERR_INSUFFICIENT_FUNDS' | 'ERR_INVALID_AMOUNT';
}

export interface CircularAnomaly {
  hasCycle: boolean;
  cycleNodes: string[];
  cyclePathFormatted: string;
  explanation: string;
}

export interface TreeNodeData extends MLMUser {
  levelFromRoot: number;
  children: TreeNodeData[];
  directDownlineCount: number;
  totalTeamCount: number;
}
