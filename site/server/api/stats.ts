/**
 * GET /api/stats — Public social proof stats
 * Returns anonymized aggregate stats for landing pages.
 * Cached for 5 minutes to avoid hammering Firestore.
 */

import type { Request, Response } from 'express';
import { adminDb } from '../engine/firebaseAdmin';

interface PublicStats {
  totalPilots: number;
  totalConversations: number;
  totalCitations: number;
  verifiedPilots: number;
}

let cachedStats: PublicStats | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function handlePublicStats(_req: Request, res: Response) {
  try {
    if (cachedStats && Date.now() - cacheTime < CACHE_TTL_MS) {
      res.json(cachedStats);
      return;
    }

    // Count users
    const usersSnap = await adminDb.collection('users').count().get();
    const totalPilots = usersSnap.data().count;

    // Count verified users
    const verifiedStudents = await adminDb.collection('users')
      .where('verificationStatus', '==', 'verified_student').count().get();
    const verifiedCFIs = await adminDb.collection('users')
      .where('verificationStatus', '==', 'verified_cfi').count().get();
    const verifiedPilots = verifiedStudents.data().count + verifiedCFIs.data().count;

    // Estimate conversations and citations from usage data
    // Sum all messageCount values from today's usage docs
    const today = new Date().toISOString().slice(0, 10);
    let totalMessages = 0;

    // Get a sample of user IDs to estimate total conversations
    const userSample = await adminDb.collection('users').limit(50).get();
    for (const userDoc of userSample.docs) {
      const usageSnap = await adminDb
        .collection('usage').doc(userDoc.id)
        .collection('daily').doc(today).get();
      if (usageSnap.exists) {
        totalMessages += usageSnap.data()?.messageCount || 0;
      }
    }

    // Rough estimates — scale up if we sampled less than total
    const scaleFactor = totalPilots > 50 ? totalPilots / 50 : 1;
    const totalConversations = Math.round(totalMessages * scaleFactor);

    // Citations: rough estimate of 3 citations per message
    const totalCitations = totalConversations * 3;

    cachedStats = {
      totalPilots: Math.max(totalPilots, 1), // never show 0
      totalConversations: Math.max(totalConversations, 1),
      totalCitations: Math.max(totalCitations, 1),
      verifiedPilots,
    };
    cacheTime = Date.now();

    res.json(cachedStats);
  } catch (err) {
    console.error('[Stats] Error fetching stats:', err);
    // Return minimum values on error
    res.json({
      totalPilots: 0,
      totalConversations: 0,
      totalCitations: 0,
      verifiedPilots: 0,
    });
  }
}
