/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MLMUser,
  CommissionStepTrace,
  CommissionCalculationResult,
  LedgerEntry,
  CircularAnomaly,
  TreeNodeData,
  WithdrawalRequest,
  Course,
  CoursePurchaseEvent,
  UserCourseAccess
} from '../types/mlm';

/**
 * Standard LMS Digital Courses Catalog
 */
export const DIGITAL_COURSES: Course[] = [
  {
    id: 'CRS-101',
    title: 'Full-Stack System Architecture & Scalability',
    category: 'Backend & Systems',
    price: 14999.00,
    instructor: 'Dr. Vikram Malhotra',
    rating: 4.9,
    totalStudents: 1420,
    badge: 'Bestseller',
    description: 'Master microservices, distributed queues, cache coherence, and fault-tolerant cloud design patterns.',
    imagePath: '/src/assets/images/course_system_architecture_1794208083860.jpg',
    modules: [
      { id: 'MOD-1', title: '01. Architecture Principles & CAP Theorem', durationMinutes: 45, isFreePreview: true },
      { id: 'MOD-2', title: '02. Designing Sharded High-Throughput Databases', durationMinutes: 70 },
      { id: 'MOD-3', title: '03. Event-Driven Messaging with Apache Kafka', durationMinutes: 85 },
      { id: 'MOD-4', title: '04. Chaos Engineering & Production Reliability', durationMinutes: 60 },
    ],
  },
  {
    id: 'CRS-102',
    title: 'Algorithmic Trading & Quantitative Finance',
    category: 'Financial Engineering',
    price: 24999.00,
    instructor: 'Rajesh Sharma, CFA',
    rating: 4.95,
    totalStudents: 890,
    badge: 'Hot Pick',
    description: 'Build low-latency execution engines, stochastic volatility models, and risk-adjusted portfolio strategies.',
    modules: [
      { id: 'MOD-1', title: '01. Stochastic Calculus & Black-Scholes Foundations', durationMinutes: 60, isFreePreview: true },
      { id: 'MOD-2', title: '02. Statistical Arbitrage & Pair Trading Algorithms', durationMinutes: 90 },
      { id: 'MOD-3', title: '03. Order Book Dynamics & High-Frequency Execution', durationMinutes: 80 },
      { id: 'MOD-4', title: '04. Backtesting Invariants & Slippage Models', durationMinutes: 75 },
    ],
  },
  {
    id: 'CRS-103',
    title: 'Enterprise Cloud DevOps & Kubernetes Orchestration',
    category: 'Cloud Infrastructure',
    price: 18500.00,
    instructor: 'Priya Patel',
    rating: 4.88,
    totalStudents: 1150,
    badge: 'Includes MLM Payout',
    description: 'Zero-downtime deployment pipelines, GitOps, service mesh, and multi-region Kubernetes clusters.',
    imagePath: '/src/assets/images/course_cloud_devops_1794208083510.jpg',
    modules: [
      { id: 'MOD-1', title: '01. Container Internals & Linux Cgroups', durationMinutes: 50, isFreePreview: true },
      { id: 'MOD-2', title: '02. Production Helm Charts & GitOps Workflow', durationMinutes: 80 },
      { id: 'MOD-3', title: '03. Istio Service Mesh & Mutual TLS Security', durationMinutes: 65 },
      { id: 'MOD-4', title: '04. Horizontal Pod Autoscaling with Custom Metrics', durationMinutes: 55 },
    ],
  },
  {
    id: 'CRS-104',
    title: 'High-Performance Distributed Databases',
    category: 'Data Engineering',
    price: 12499.00,
    instructor: 'Ananya Iyer',
    rating: 4.82,
    totalStudents: 980,
    description: 'Deep dive into LSM trees, B-Trees, Raft consensus algorithm, and distributed transaction atomicity.',
    modules: [
      { id: 'MOD-1', title: '01. Storage Engines: B-Tree vs LSM Tree Internals', durationMinutes: 55, isFreePreview: true },
      { id: 'MOD-2', title: '02. Raft Consensus and Leader Election', durationMinutes: 75 },
      { id: 'MOD-3', title: '03. Two-Phase Commit & Distributed Transactions', durationMinutes: 65 },
      { id: 'MOD-4', title: '04. Multi-Raft Partitioning & Hotspot Mitigation', durationMinutes: 60 },
    ],
  },
  {
    id: 'CRS-105',
    title: 'Advanced Financial Mathematics & Risk Models',
    category: 'Financial Engineering',
    price: 29999.00,
    instructor: 'Dr. Sneha Kulkarni',
    rating: 4.96,
    totalStudents: 640,
    badge: 'Masterclass',
    description: 'Mathematical precision modeling: Monte Carlo simulations, Value-at-Risk (VaR), and recursive cash flow graphs.',
    modules: [
      { id: 'MOD-1', title: '01. Probability Spaces & Martingale Theory', durationMinutes: 60, isFreePreview: true },
      { id: 'MOD-2', title: '02. Monte Carlo Simulation for Exotics', durationMinutes: 90 },
      { id: 'MOD-3', title: '03. Historical & Parametric Value at Risk (VaR)', durationMinutes: 80 },
      { id: 'MOD-4', title: '04. Recursive Yield Curve Decomposition', durationMinutes: 70 },
    ],
  },
];

/**
 * Global In-Memory Set of processed invoice IDs to prevent double-spending
 */
export const PROCESSED_INVOICE_HASHES = new Set<string>([
  'INV-GENESIS-01',
]);

/**
 * High-precision rounding to 2 decimal places for financial calculations (INR).
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Format currency in Indian Rupee format with standard decimal precision.
 */
export function formatINR(amount: number): string {
  const rounded = roundCurrency(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/**
 * Standard Tier Rules for Unilevel Generation Plan
 */
export const COMMISSION_TIERS: Array<{
  level: number;
  rate: number;
  label: string;
  relation: 'Parent' | 'Grandparent' | 'Great-Grandparent';
}> = [
  { level: 1, rate: 0.10, label: '10%', relation: 'Parent' },
  { level: 2, rate: 0.05, label: '5%', relation: 'Grandparent' },
  { level: 3, rate: 0.02, label: '2%', relation: 'Great-Grandparent' },
];

/**
 * Generate a cryptographically simulated DRM Session Token for anti-piracy.
 * Avoids exposing raw video URLs or public asset paths in API payloads.
 */
export function generateDRMSessionToken(buyerId: string, courseId: string): string {
  const nonce = Math.random().toString(36).substring(2, 10);
  const expiry = Date.now() + 86400000; // 24hr lease
  return `drm_v3::${courseId}::${buyerId}::sig_${nonce}::exp_${expiry}`;
}

/**
 * Check if a user has access to a specific course
 */
export function verifyCourseAccess(user: MLMUser, courseId: string): boolean {
  return user.coursesEnrolled?.some(c => c.courseId === courseId && c.hasAccess) || false;
}

/**
 * RECURSIVE REVENUE ENGINE & COURSE ACCESS CONTROLLER
 * Triggered upon 'COURSE_PURCHASE' event payload: (Buyer_ID, Course_ID, Purchase_Amount, Invoice_ID)
 * 1. Executes asset unlock query for Buyer_ID matching that Course_ID ('hasAccess: true').
 * 2. Recursively traverses upward using 'sponsorId':
 *    - Level 1 (Parent): 10%
 *    - Level 2 (Grandparent): 5%
 *    - Level 3 (Great-Grandparent): 2%
 *    - Platform Margin: 83% securely retained.
 * 3. Gracefully halts if 'sponsorId' is null or traversal exceeds Level 3.
 * 4. Strictly checks self-referral loops & prevents double-spending.
 */
export function processCoursePurchase(
  users: MLMUser[],
  event: CoursePurchaseEvent
): {
  result: CommissionCalculationResult;
  updatedUsers: MLMUser[];
  error?: string;
} {
  const { buyerId, courseId, purchaseAmount, invoiceId, referralCodeUsed } = event;
  const precisionAmount = roundCurrency(purchaseAmount);

  // 1. Double-Spending Check
  if (PROCESSED_INVOICE_HASHES.has(invoiceId)) {
    throw new Error(`Double-Spending Attempt Blocked: Invoice ID ${invoiceId} has already been settled and parsed. Duplicate commission distribution denied.`);
  }

  // 2. Self-Referral Loop Check
  if (referralCodeUsed && referralCodeUsed.trim().toUpperCase() === buyerId.trim().toUpperCase()) {
    throw new Error(`Self-Referral Fraud Detected: Buyer ${buyerId} cannot apply their own referral code to purchase a course to extract a kickback discount.`);
  }

  const userMap = new Map<string, MLMUser>(users.map(u => [u.id, { 
    ...u, 
    coursesEnrolled: u.coursesEnrolled ? [...u.coursesEnrolled] : [] 
  }]));
  
  const buyer = userMap.get(buyerId);
  if (!buyer) {
    throw new Error(`Target buyer with ID ${buyerId} does not exist in network.`);
  }

  const course = DIGITAL_COURSES.find(c => c.id === courseId);
  const txId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;
  const timestamp = new Date().toISOString();

  // 3. Asset Unlock Query (Course Access Control)
  const drmToken = generateDRMSessionToken(buyer.id, courseId);
  const existingAccessIndex = buyer.coursesEnrolled.findIndex(c => c.courseId === courseId);

  const accessRecord: UserCourseAccess = {
    courseId,
    hasAccess: true,
    unlockedAt: timestamp,
    invoiceId,
    drmSessionToken: drmToken,
  };

  if (existingAccessIndex >= 0) {
    buyer.coursesEnrolled[existingAccessIndex] = accessRecord;
  } else {
    buyer.coursesEnrolled.push(accessRecord);
  }

  // Record buyer purchase volume
  buyer.totalPurchases = roundCurrency(buyer.totalPurchases + precisionAmount);

  // Register invoice hash to prevent double spending
  PROCESSED_INVOICE_HASHES.add(invoiceId);

  const commissionSteps: CommissionStepTrace[] = [];
  const traversalPath: string[] = [buyer.id];
  const ledgerEntries: LedgerEntry[] = [];
  const visitedInTraversal = new Set<string>([buyer.id]);

  let terminatedReason: 'MAX_DEPTH_REACHED' | 'NO_FURTHER_SPONSOR' | 'CIRCULAR_LOOP_DETECTED' = 'NO_FURTHER_SPONSOR';
  let isAnomalyDetected = false;
  let anomalyMessage: string | undefined = undefined;

  let currentSponsorId: string | null = buyer.sponsorId;
  let currentDepth = 1;
  let totalCommissionPaid = 0;

  // Ledger Entry for Course Purchase by Buyer
  ledgerEntries.push({
    id: `LED-${txId}-0`,
    transactionId: txId,
    invoiceId,
    timestamp,
    type: 'COURSE_PURCHASE',
    userId: buyer.id,
    userName: buyer.name,
    debit: precisionAmount,
    credit: 0,
    balanceAfter: buyer.walletBalance,
    description: `Digital Course Purchase: "${course?.title || courseId}" by ${buyer.name} (Access Granted)`,
    currency: 'INR',
    status: 'SETTLED',
  });

  // Upward recursive tree traversal loop using 'sponsorId'
  while (currentSponsorId && currentDepth <= 3) {
    if (visitedInTraversal.has(currentSponsorId)) {
      terminatedReason = 'CIRCULAR_LOOP_DETECTED';
      isAnomalyDetected = true;
      anomalyMessage = `Circular loop anomaly encountered at node ${currentSponsorId}. Upward commission dispersal halted to prevent fraud.`;
      break;
    }

    const sponsor = userMap.get(currentSponsorId);
    if (!sponsor) {
      terminatedReason = 'NO_FURTHER_SPONSOR';
      break;
    }

    visitedInTraversal.add(sponsor.id);
    traversalPath.push(sponsor.id);

    const tier = COMMISSION_TIERS.find(t => t.level === currentDepth);
    if (!tier) break;

    // Numerical Precision Commission Math
    const commissionAmount = roundCurrency(precisionAmount * tier.rate);
    const preBalance = sponsor.walletBalance;
    const postBalance = roundCurrency(preBalance + commissionAmount);

    // Increment wallet balance and total earned
    sponsor.walletBalance = postBalance;
    sponsor.totalEarned = roundCurrency(sponsor.totalEarned + commissionAmount);
    totalCommissionPaid = roundCurrency(totalCommissionPaid + commissionAmount);

    const stepTrace: CommissionStepTrace = {
      level: currentDepth,
      relation: tier.relation,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      percentage: tier.rate,
      rateLabel: tier.label,
      commissionAmount,
      formula: `${formatINR(precisionAmount)} × ${tier.label} = ${formatINR(commissionAmount)}`,
      creditedToWallet: true,
      preBalance,
      postBalance,
      isActive: sponsor.isActiveMember,
      notes: sponsor.isActiveMember
        ? `Level ${currentDepth} (${tier.relation}) credited. Active member eligible for withdrawal.`
        : `Level ${currentDepth} (${tier.relation}) credited to balance. Withdrawal gated until isActiveMember = true.`,
    };

    commissionSteps.push(stepTrace);

    const ledgerType =
      currentDepth === 1
        ? 'COMMISSION_CREDIT_L1'
        : currentDepth === 2
        ? 'COMMISSION_CREDIT_L2'
        : 'COMMISSION_CREDIT_L3';

    ledgerEntries.push({
      id: `LED-${txId}-${currentDepth}`,
      transactionId: txId,
      invoiceId,
      timestamp,
      type: ledgerType,
      userId: sponsor.id,
      userName: sponsor.name,
      debit: 0,
      credit: commissionAmount,
      balanceAfter: postBalance,
      description: `Course Sale Commission (Level ${currentDepth} ${tier.relation}) for "${course?.title || courseId}"`,
      currency: 'INR',
      status: 'SETTLED',
    });

    currentSponsorId = sponsor.sponsorId;
    currentDepth++;
  }

  if (currentDepth > 3) {
    terminatedReason = 'MAX_DEPTH_REACHED';
  } else if (!isAnomalyDetected && !currentSponsorId) {
    terminatedReason = 'NO_FURTHER_SPONSOR';
  }

  // Exact 83% Platform Retained Revenue Calculation
  const companyRetainedAmount = roundCurrency(precisionAmount - totalCommissionPaid);

  const result: CommissionCalculationResult = {
    transactionId: txId,
    invoiceId,
    timestamp,
    buyer: {
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      sponsorId: buyer.sponsorId,
    },
    course: course ? {
      id: course.id,
      title: course.title,
      price: course.price,
    } : undefined,
    productPurchaseAmount: precisionAmount,
    currency: 'INR',
    totalCommissionPaid,
    companyRetainedAmount,
    commissionSteps,
    traversalPath,
    terminatedReason,
    isAnomalyDetected,
    anomalyMessage,
    ledgerEntries,
    unlockedAccess: {
      buyerId: buyer.id,
      courseId,
      hasAccess: true,
      unlockedAt: timestamp,
      drmToken,
    },
  };

  return {
    result,
    updatedUsers: Array.from(userMap.values()),
  };
}

/**
 * Universal commission calculator for custom amounts / products
 */
export function calculateCommissions(
  users: MLMUser[],
  buyerId: string,
  purchaseAmount: number,
  customTransactionId?: string
): {
  result: CommissionCalculationResult;
  updatedUsers: MLMUser[];
} {
  const defaultCourse = DIGITAL_COURSES[0];
  const invoiceId = customTransactionId || `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
  
  return processCoursePurchase(users, {
    buyerId,
    courseId: defaultCourse.id,
    purchaseAmount,
    invoiceId,
  });
}


/**
 * Cycle and Fraud validation
 */
export function validateSponsorAssignment(
  users: MLMUser[],
  userId: string,
  newSponsorId: string | null
): { isValid: boolean; error?: string } {
  if (!newSponsorId) {
    return { isValid: true };
  }

  if (userId === newSponsorId) {
    return {
      isValid: false,
      error: `Fraud Prevention Rule: User ${userId} cannot be their own sponsor (Self-Referral Loop Blocked).`,
    };
  }

  const userMap = new Map<string, MLMUser>(users.map(u => [u.id, u]));
  let currentId: string | null = newSponsorId;
  const visited = new Set<string>();
  const path: string[] = [userId, newSponsorId];

  while (currentId) {
    if (currentId === userId) {
      path.push(userId);
      return {
        isValid: false,
        error: `Circular Dependency Detected: ${path.join(' -> ')}. Assigning ${newSponsorId} as sponsor to ${userId} creates an illegal circular loop.`,
      };
    }

    if (visited.has(currentId)) break;

    visited.add(currentId);
    const sponsor: MLMUser | undefined = userMap.get(currentId);
    currentId = sponsor?.sponsorId || null;
    if (currentId) path.push(currentId);
  }

  return { isValid: true };
}

export function detectCycles(users: MLMUser[]): CircularAnomaly {
  const userMap = new Map<string, MLMUser>(users.map(u => [u.id, u]));
  const state = new Map<string, number>();
  users.forEach(u => state.set(u.id, 0));

  let cycleFound: string[] = [];

  function dfs(currId: string, currentPath: string[]): boolean {
    state.set(currId, 1);
    currentPath.push(currId);

    const currentUser = userMap.get(currId);
    const sponsorId = currentUser?.sponsorId;

    if (sponsorId && userMap.has(sponsorId)) {
      const sponsorState = state.get(sponsorId) || 0;

      if (sponsorState === 1) {
        const cycleStartIndex = currentPath.indexOf(sponsorId);
        cycleFound = currentPath.slice(cycleStartIndex);
        cycleFound.push(sponsorId);
        return true;
      }

      if (sponsorState === 0) {
        if (dfs(sponsorId, currentPath)) {
          return true;
        }
      }
    }

    state.set(currId, 2);
    currentPath.pop();
    return false;
  }

  for (const user of users) {
    if ((state.get(user.id) || 0) === 0) {
      if (dfs(user.id, [])) {
        return {
          hasCycle: true,
          cycleNodes: cycleFound.slice(0, -1),
          cyclePathFormatted: cycleFound.join(' ➔ '),
          explanation: `Circular Dependency Fault: Network hierarchy forms an illegal infinite closed loop (${cycleFound.join(' ➔ ')}).`,
        };
      }
    }
  }

  return {
    hasCycle: false,
    cycleNodes: [],
    cyclePathFormatted: 'No circular loops detected (DAG hierarchy intact)',
    explanation: 'Network hierarchy conforms to acyclic unilevel standards.',
  };
}

export function executeWithdrawal(
  users: MLMUser[],
  userId: string,
  amount: number
): {
  success: boolean;
  request: WithdrawalRequest;
  updatedUsers: MLMUser[];
  ledgerEntry: LedgerEntry;
} {
  const precisionAmount = roundCurrency(amount);
  const userMap = new Map<string, MLMUser>(users.map(u => [u.id, { 
    ...u,
    coursesEnrolled: u.coursesEnrolled ? [...u.coursesEnrolled] : []
  }]));
  const user = userMap.get(userId);

  const requestId = `WTH-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  if (!user) {
    throw new Error(`User ${userId} not found.`);
  }

  if (!user.isActiveMember) {
    const failedRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      amount: precisionAmount,
      requestedAt: timestamp,
      status: 'REJECTED',
      rejectionCode: 'ERR_INACTIVE_MEMBER_WITHDRAWAL_DENIED',
      reason: 'Wallet Restrictions Enforced: Account state isActiveMember is false. Withdrawals are strictly prohibited for inactive members.',
    };

    const failedLedger: LedgerEntry = {
      id: `LED-${requestId}-ERR`,
      transactionId: requestId,
      timestamp,
      type: 'WITHDRAWAL_FAILED_INACTIVE',
      userId: user.id,
      userName: user.name,
      debit: 0,
      credit: 0,
      balanceAfter: user.walletBalance,
      description: `Withdrawal of ${formatINR(precisionAmount)} REJECTED: Inactive Membership (isActiveMember = false)`,
      currency: 'INR',
      status: 'BLOCKED',
    };

    return {
      success: false,
      request: failedRequest,
      updatedUsers: users,
      ledgerEntry: failedLedger,
    };
  }

  if (precisionAmount <= 0) {
    const invalidRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      amount: precisionAmount,
      requestedAt: timestamp,
      status: 'REJECTED',
      rejectionCode: 'ERR_INVALID_AMOUNT',
      reason: 'Withdrawal amount must be greater than zero.',
    };

    const invalidLedger: LedgerEntry = {
      id: `LED-${requestId}-ERR`,
      transactionId: requestId,
      timestamp,
      type: 'WITHDRAWAL_FAILED_INACTIVE',
      userId: user.id,
      userName: user.name,
      debit: 0,
      credit: 0,
      balanceAfter: user.walletBalance,
      description: `Withdrawal request invalid: Amount must be > 0`,
      currency: 'INR',
      status: 'BLOCKED',
    };

    return {
      success: false,
      request: invalidRequest,
      updatedUsers: users,
      ledgerEntry: invalidLedger,
    };
  }

  if (precisionAmount > user.walletBalance) {
    const insufficientRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      amount: precisionAmount,
      requestedAt: timestamp,
      status: 'REJECTED',
      rejectionCode: 'ERR_INSUFFICIENT_FUNDS',
      reason: `Insufficient wallet balance. Requested ${formatINR(precisionAmount)} but balance is only ${formatINR(user.walletBalance)}.`,
    };

    const insufficientLedger: LedgerEntry = {
      id: `LED-${requestId}-ERR`,
      transactionId: requestId,
      timestamp,
      type: 'WITHDRAWAL_FAILED_INACTIVE',
      userId: user.id,
      userName: user.name,
      debit: 0,
      credit: 0,
      balanceAfter: user.walletBalance,
      description: `Withdrawal of ${formatINR(precisionAmount)} REJECTED: Insufficient balance`,
      currency: 'INR',
      status: 'BLOCKED',
    };

    return {
      success: false,
      request: insufficientRequest,
      updatedUsers: users,
      ledgerEntry: insufficientLedger,
    };
  }

  user.walletBalance = roundCurrency(user.walletBalance - precisionAmount);
  user.totalWithdrawn = roundCurrency(user.totalWithdrawn + precisionAmount);

  const approvedRequest: WithdrawalRequest = {
    id: requestId,
    userId,
    amount: precisionAmount,
    requestedAt: timestamp,
    status: 'APPROVED',
  };

  const successLedger: LedgerEntry = {
    id: `LED-${requestId}-OK`,
    transactionId: requestId,
    timestamp,
    type: 'WALLET_WITHDRAWAL',
    userId: user.id,
    userName: user.name,
    debit: precisionAmount,
    credit: 0,
    balanceAfter: user.walletBalance,
    description: `Funds Withdrawal of ${formatINR(precisionAmount)} by ${user.name} (Active Member)`,
    currency: 'INR',
    status: 'SETTLED',
  };

  return {
    success: true,
    request: approvedRequest,
    updatedUsers: Array.from(userMap.values()),
    ledgerEntry: successLedger,
  };
}

export function buildGenealogyTree(users: MLMUser[]): TreeNodeData[] {
  const userMap = new Map<string, MLMUser>(users.map(u => [u.id, u]));
  const childrenMap = new Map<string, MLMUser[]>();

  users.forEach(u => {
    const parentId = u.sponsorId || 'ROOT';
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(u);
  });

  const rootUsers = users.filter(u => !u.sponsorId || !userMap.has(u.sponsorId));

  function buildNode(user: MLMUser, level: number, visitedSet = new Set<string>()): TreeNodeData {
    if (visitedSet.has(user.id)) {
      return {
        ...user,
        levelFromRoot: level,
        children: [],
        directDownlineCount: 0,
        totalTeamCount: 0,
      };
    }

    const currentVisited = new Set(visitedSet);
    currentVisited.add(user.id);

    const directChildren = childrenMap.get(user.id) || [];
    const childrenNodes = directChildren.map(c => buildNode(c, level + 1, currentVisited));

    const directDownlineCount = directChildren.length;
    const totalTeamCount = childrenNodes.reduce(
      (sum, child) => sum + 1 + child.totalTeamCount,
      0
    );

    return {
      ...user,
      levelFromRoot: level,
      children: childrenNodes,
      directDownlineCount,
      totalTeamCount,
    };
  }

  return rootUsers.map(root => buildNode(root, 0));
}

export function getUpwardLineage(
  users: MLMUser[],
  userId: string,
  maxDepth = 3
): Array<{
  level: number;
  relation: 'Parent' | 'Grandparent' | 'Great-Grandparent' | 'Ancestor';
  user: MLMUser;
  rate: number;
  rateLabel: string;
}> {
  const userMap = new Map<string, MLMUser>(users.map(u => [u.id, u]));
  const startUser = userMap.get(userId);
  if (!startUser) return [];

  const lineage: Array<{
    level: number;
    relation: 'Parent' | 'Grandparent' | 'Great-Grandparent' | 'Ancestor';
    user: MLMUser;
    rate: number;
    rateLabel: string;
  }> = [];

  let currentSponsorId = startUser.sponsorId;
  let depth = 1;
  const visited = new Set<string>([userId]);

  while (currentSponsorId && depth <= maxDepth) {
    if (visited.has(currentSponsorId)) break;
    visited.add(currentSponsorId);

    const sponsor = userMap.get(currentSponsorId);
    if (!sponsor) break;

    const tier = COMMISSION_TIERS.find(t => t.level === depth);
    const relation = tier ? tier.relation : 'Ancestor';
    const rate = tier ? tier.rate : 0;
    const rateLabel = tier ? tier.label : '0%';

    lineage.push({
      level: depth,
      relation,
      user: sponsor,
      rate,
      rateLabel,
    });

    currentSponsorId = sponsor.sponsorId;
    depth++;
  }

  return lineage;
}
