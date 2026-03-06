/**
 * Student Pilot / CFI Verification Service
 * Calls the existing searchAirmen Cloud Function from the platform
 * and writes verification status to the user's Firestore profile
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApp } from 'firebase/app';
import { db } from '@/lib/firebase';

interface AirmanCertificate {
  type: string;
  typeDesc: string;
  level: string;
  levelDesc: string;
  ratings: string;
  expireDate: string;
}

export interface AirmanRecord {
  uniqueId: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  medicalClass: string;
  certificates: AirmanCertificate[];
}

interface SearchResponse {
  results: AirmanRecord[];
  totalFound: number;
}

// Get functions instance from the platform's Firebase project
function getPlatformFunctions() {
  try {
    const app = getApp('platform');
    return getFunctions(app, 'us-central1');
  } catch {
    // Initialize the platform app for calling its Cloud Functions
    const platformApp = initializeApp(
      {
        apiKey: 'AIzaSyBplaceholder', // Platform's API key
        authDomain: 'aeroedge-logbook.firebaseapp.com',
        projectId: 'aeroedge-logbook',
      },
      'platform'
    );
    return getFunctions(platformApp, 'us-central1');
  }
}

export async function searchAirmen(lastName: string, firstName?: string): Promise<AirmanRecord[]> {
  const functions = getPlatformFunctions();
  const callable = httpsCallable<{ lastName: string; firstName?: string }, SearchResponse>(
    functions,
    'searchAirmen'
  );
  const result = await callable({ lastName, firstName });
  return result.data.results;
}

export function hasPilotCertificate(airman: AirmanRecord): boolean {
  return airman.certificates.some(c => c.type === 'P');
}

export function hasStudentPilotCert(airman: AirmanRecord): boolean {
  return airman.certificates.some(
    c => c.type === 'P' && (
      c.levelDesc.includes('STUDENT') ||
      c.levelDesc.includes('SPORT') ||
      c.levelDesc.includes('RECREATIONAL')
    )
  );
}

export function hasFlightInstructorCert(airman: AirmanRecord): boolean {
  return airman.certificates.some(c => c.type === 'F');
}

export function getPilotCertLevel(airman: AirmanRecord): string {
  const pilotCert = airman.certificates.find(c => c.type === 'P');
  return pilotCert?.levelDesc || 'Unknown';
}

export async function verifyUser(
  uid: string,
  airman: AirmanRecord
): Promise<'verified_student' | 'verified_cfi'> {
  const isCFI = hasFlightInstructorCert(airman);
  const status = isCFI ? 'verified_cfi' as const : 'verified_student' as const;
  const tier = 'verified';

  await updateDoc(doc(db, 'users', uid), {
    verificationStatus: status,
    tier,
    certificateLevel: getPilotCertLevel(airman),
    verifiedAt: new Date().toISOString(),
    faaRegistryId: airman.uniqueId,
  });

  return status;
}
