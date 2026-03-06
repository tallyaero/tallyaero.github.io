import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WaitlistFormProps {
  feature?: string;
}

export function WaitlistForm({ feature }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await addDoc(collection(db, 'waitlist'), {
        email: email.trim(),
        feature: feature || 'general',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setError('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center bg-panel rounded-2xl p-8 border border-edge">
        <svg className="w-10 h-10 text-success mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-lg font-semibold text-heading mb-1">You're on the list</h3>
        <p className="text-sm text-muted">We'll notify you when this feature launches.</p>
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-2xl p-8 border border-edge">
      <h3 className="text-lg font-semibold text-heading mb-2 text-center">Get Early Access</h3>
      <p className="text-sm text-muted mb-4 text-center">
        Join the waitlist for early access to the full Tally Aero platform.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-raised border border-edge rounded-xl px-4 py-2.5 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-aero-blue hover:bg-aero-blue-dark text-white rounded-xl text-sm font-medium transition-colors btn-press whitespace-nowrap"
        >
          Join Waitlist
        </button>
      </form>
      {error && <p className="text-xs text-danger text-center mt-2">{error}</p>}
    </div>
  );
}
