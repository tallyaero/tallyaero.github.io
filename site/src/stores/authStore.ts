/**
 * Auth Store — Firebase Auth state management
 * Handles sign-in, sign-up, sign-out, and user profile
 */

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export type VerificationStatus = 'unverified' | 'verified_student' | 'verified_cfi' | 'manual_review';
export type UserTier = 'free' | 'verified' | 'paid';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  tier: UserTier;
  verificationStatus: VerificationStatus;
  certificateLevel?: string;
  createdAt: unknown;
  referredBy?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => () => void;
}

async function ensureUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  // Create new profile
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Pilot',
    tier: 'free',
    verificationStatus: 'unverified',
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return profile;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  signInEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      set({ error: msg.replace('Firebase: ', ''), loading: false });
    }
  },

  signUpEmail: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create profile with display name
      const profile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName,
        tier: 'free',
        verificationStatus: 'unverified',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      set({ profile });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      set({ error: msg.replace('Firebase: ', ''), loading: false });
    }
  },

  signInGoogle: async () => {
    set({ loading: true, error: null });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      set({ error: msg.replace('Firebase: ', ''), loading: false });
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, profile: null });
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await ensureUserProfile(user);
          set({ user, profile, loading: false });
        } catch {
          set({ user, profile: null, loading: false });
        }
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));
