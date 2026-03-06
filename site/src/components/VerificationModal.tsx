import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { searchAirmen, hasPilotCertificate, verifyUser, type AirmanRecord } from '@/services/verification';

interface VerificationModalProps {
  onClose: () => void;
}

type Step = 'search' | 'results' | 'success' | 'not_found';

export function VerificationModal({ onClose }: VerificationModalProps) {
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState<Step>('search');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AirmanRecord[]>([]);
  const [error, setError] = useState('');
  const [verifiedStatus, setVerifiedStatus] = useState('');

  if (!user) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const airmen = await searchAirmen(lastName.trim(), firstName.trim() || undefined);
      // Filter to those with pilot certificates
      const pilots = airmen.filter(hasPilotCertificate);
      setResults(pilots);
      setStep(pilots.length > 0 ? 'results' : 'not_found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (airman: AirmanRecord) => {
    setLoading(true);
    try {
      const status = await verifyUser(user.uid, airman);
      setVerifiedStatus(status === 'verified_cfi' ? 'CFI' : 'Student Pilot');
      setStep('success');
      // Refresh profile
      useAuthStore.getState().initialize();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-panel border border-edge rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-heading">Verify Your Certificate</h2>
          <button onClick={onClose} className="text-muted hover:text-heading p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6">
          {step === 'search' && (
            <form onSubmit={handleSearch} className="space-y-3 mt-3">
              <p className="text-sm text-muted">
                Verify your pilot certificate through the FAA Airmen Registry for unlimited DashTwo access.
              </p>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name (required)"
                required
                minLength={2}
                className="w-full bg-raised border border-edge rounded-lg px-3 py-2.5 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
              />
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name (optional)"
                className="w-full bg-raised border border-edge rounded-lg px-3 py-2.5 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-aero-blue hover:bg-aero-blue-dark text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search FAA Registry'}
              </button>
            </form>
          )}

          {step === 'results' && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted">Select your record:</p>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.map(airman => (
                  <button
                    key={airman.uniqueId}
                    onClick={() => handleVerify(airman)}
                    disabled={loading}
                    className="w-full text-left px-3 py-2.5 bg-raised hover:bg-active rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="text-sm font-medium text-heading">
                      {airman.firstName} {airman.lastName}
                    </div>
                    <div className="text-xs text-muted">
                      {airman.city}, {airman.state} · {airman.certificates.map(c => c.levelDesc).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                onClick={() => { setStep('search'); setResults([]); }}
                className="text-xs text-muted hover:text-heading"
              >
                Search again
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="mt-4 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-full">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-heading">Verified as {verifiedStatus}</p>
                <p className="text-xs text-muted mt-1">You now have unlimited DashTwo access.</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-aero-blue hover:bg-aero-blue-dark text-white text-sm rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'not_found' && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted">
                We couldn't find a matching pilot certificate in the FAA Airmen Registry. This can happen if your certificate is very new or there's a spelling difference.
              </p>
              <p className="text-sm text-muted">
                Email a photo of your student pilot certificate to{' '}
                <a href={`mailto:verify@tallyaero.com?subject=Verification: ${profile?.email || ''}`} className="text-aero-blue-light hover:text-aero-blue">
                  verify@tallyaero.com
                </a>{' '}
                for manual verification within 24 hours.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('search'); setResults([]); }}
                  className="flex-1 py-2 bg-raised hover:bg-active text-body text-sm rounded-lg transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-aero-blue hover:bg-aero-blue-dark text-white text-sm rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
