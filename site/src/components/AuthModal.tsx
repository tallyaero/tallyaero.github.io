import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { signInEmail, signUpEmail, signInGoogle, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      await signInEmail(email, password);
    } else {
      await signUpEmail(email, password, displayName);
    }
    // If no error after auth, close modal (auth state change will handle the rest)
    if (!useAuthStore.getState().error) {
      onClose();
    }
  };

  const handleGoogle = async () => {
    await signInGoogle();
    if (!useAuthStore.getState().error) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-panel border border-edge rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-bold text-heading">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {mode === 'signin' ? 'Sign in to save conversations' : 'Free access to DashTwo'}
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-heading p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-800 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-edge" />
            <span className="text-xs text-faint">or</span>
            <div className="flex-1 h-px bg-edge" />
          </div>

          {/* Display name (signup only) */}
          {mode === 'signup' && (
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Display name"
              required
              className="w-full bg-raised border border-edge rounded-lg px-3 py-2.5 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearError(); }}
            placeholder="Email"
            required
            className="w-full bg-raised border border-edge rounded-lg px-3 py-2.5 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
          />

          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); clearError(); }}
            placeholder="Password"
            required
            minLength={6}
            className="w-full bg-raised border border-edge rounded-lg px-3 py-2.5 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
          />

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-aero-blue hover:bg-aero-blue-dark text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <p className="text-center text-xs text-muted">
            {mode === 'signin' ? (
              <>Don't have an account? <button type="button" onClick={() => { setMode('signup'); clearError(); }} className="text-aero-blue-light hover:text-aero-blue">Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('signin'); clearError(); }} className="text-aero-blue-light hover:text-aero-blue">Sign in</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
