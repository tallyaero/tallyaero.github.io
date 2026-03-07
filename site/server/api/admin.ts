/**
 * Admin Analytics API endpoints
 * - GET /api/admin/stats — Aggregated stats from Firestore
 * - GET /api/admin/topics — Conversation topic analysis (placeholder)
 */

import type { Request, Response } from 'express';
import { adminDb } from '../engine/firebaseAdmin';

interface AdminStats {
  funnel: {
    totalUsers: number;
    verifiedUsers: number;
    paidUsers: number;
    freeUsers: number;
  };
  feedback: {
    totalUp: number;
    totalDown: number;
    byMode: Record<string, { up: number; down: number }>;
  };
  todayUsage: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostCents: number;
    totalMessages: number;
    uniqueUsers: number;
  };
  cfiReferrals: Array<{
    referralCode: string;
    displayName: string;
    studentCount: number;
  }>;
  waitlistCount: number;
}

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function handleAdminStats(_req: Request, res: Response): Promise<void> {
  try {
    // --- Conversion Funnel ---
    const usersSnap = await adminDb.collection('users').get();
    const users = usersSnap.docs.map(d => d.data());

    const funnel = {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => typeof u.verificationStatus === 'string' && u.verificationStatus.startsWith('verified')).length,
      paidUsers: users.filter(u => u.tier === 'paid').length,
      freeUsers: users.filter(u => u.tier === 'free' || !u.tier).length,
    };

    // --- Today's Usage ---
    const today = getDateKey();
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCostCents = 0;
    let totalMessages = 0;
    let uniqueUsers = 0;

    // Iterate over users (cap at 100 to avoid excessive reads)
    const uids = usersSnap.docs.slice(0, 100).map(d => d.id);
    for (const uid of uids) {
      try {
        const dailyDoc = await adminDb.doc(`usage/${uid}/daily/${today}`).get();
        if (dailyDoc.exists) {
          const data = dailyDoc.data()!;
          totalInputTokens += data.totalInputTokens || 0;
          totalOutputTokens += data.totalOutputTokens || 0;
          totalCostCents += data.totalCostCents || 0;
          totalMessages += data.messageCount || 0;
          uniqueUsers++;
        }
      } catch {
        // Skip users with no usage docs
      }
    }

    const todayUsage = {
      totalInputTokens,
      totalOutputTokens,
      totalCostCents,
      totalMessages,
      uniqueUsers,
    };

    // --- CFI Referrals ---
    const cfisSnap = await adminDb.collection('users')
      .where('referralCode', '!=', null)
      .get();

    const cfiReferrals: AdminStats['cfiReferrals'] = [];
    for (const cfiDoc of cfisSnap.docs) {
      const cfi = cfiDoc.data();
      if (!cfi.referralCode) continue;
      const studentsSnap = await adminDb.collection('users')
        .where('referredBy', '==', cfi.referralCode)
        .get();
      cfiReferrals.push({
        referralCode: cfi.referralCode,
        displayName: cfi.displayName || cfi.email || cfiDoc.id,
        studentCount: studentsSnap.size,
      });
    }

    // --- Waitlist ---
    let waitlistCount = 0;
    try {
      const waitlistSnap = await adminDb.collection('waitlist').get();
      waitlistCount = waitlistSnap.size;
    } catch {
      // Collection may not exist yet
    }

    // --- Feedback (placeholder — needs server-side persistence) ---
    const feedback = {
      totalUp: 0,
      totalDown: 0,
      byMode: {} as Record<string, { up: number; down: number }>,
    };

    const stats: AdminStats = {
      funnel,
      feedback,
      todayUsage,
      cfiReferrals,
      waitlistCount,
    };

    res.json(stats);
  } catch (err) {
    console.error('[Admin Stats] Error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}

export async function handleAdminTopics(_req: Request, res: Response): Promise<void> {
  res.json({
    topics: [],
    note: 'Conversation data is client-side. Server-side persistence needed for topic analysis.',
  });
}
