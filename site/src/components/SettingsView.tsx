import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, type Theme } from '@/stores/themeStore';
import { usePersonaStore } from '@/stores/personaStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { PERSONA_CATALOG, MILITARY_PERSONAS, type PersonaId, type MilitaryBranch } from '@/types/persona';
import { UpgradeCard } from './UpgradeCard';

const BRANCH_OPTIONS: { value: MilitaryBranch; label: string }[] = [
  { value: 'air_force', label: 'Air Force' },
  { value: 'navy', label: 'Navy' },
  { value: 'marines', label: 'Marines' },
  { value: 'army', label: 'Army' },
  { value: 'coast_guard', label: 'Coast Guard' },
];

const SHORTCUTS = [
  { keys: 'Ctrl + Shift + O', action: 'New conversation' },
  { keys: 'Ctrl + Shift + S', action: 'Stop streaming' },
  { keys: 'Enter', action: 'Send message' },
  { keys: 'Shift + Enter', action: 'New line in message' },
  { keys: 'Escape', action: 'Cancel editing' },
];

export function SettingsView() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { user, profile, openPortal, updateAircraftType, changePassword, deleteAccount, updateDisplayName } = useAuthStore();
  const conversations = useChatStore(s => s.conversations);
  const clearAllConversations = useChatStore(s => s.clearAllConversations);
  const [aircraftInput, setAircraftInput] = useState(profile?.aircraftType || '');
  const [displayNameInput, setDisplayNameInput] = useState(profile?.displayName || '');
  const {
    activePersona, callsign, pilotName, militaryBranch, customPromptPrefix,
    setPersona, setCallsign, setPilotName, setMilitaryBranch, setCustomPromptPrefix,
  } = usePersonaStore();

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Clear conversations state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isMilitary = MILITARY_PERSONAS.includes(activePersona);
  const activePersonaConfig = PERSONA_CATALOG.find(p => p.id === activePersona);

  // Usage stats from local conversations
  const stats = useMemo(() => {
    let totalMessages = 0;
    let totalConversations = conversations.length;
    let oldestDate: number | null = null;
    for (const conv of conversations) {
      totalMessages += conv.messages.length;
      if (!oldestDate || conv.createdAt < oldestDate) oldestDate = conv.createdAt;
    }
    return { totalMessages, totalConversations, oldestDate };
  }, [conversations]);

  const isEmailUser = user?.providerData?.[0]?.providerId === 'password';

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password updated' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => { setShowPasswordForm(false); setPasswordMsg(null); }, 1500);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed' });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await deleteAccount(deletePassword);
      navigate('/dashtwo');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      conversations: conversations.map(c => ({
        title: c.title,
        mode: c.mode,
        createdAt: new Date(c.createdAt).toISOString(),
        messages: c.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).toISOString(),
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashtwo-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-base overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-heading">Settings</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Account */}
        {user && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-heading mb-3">Account</h2>
            <div className="bg-panel rounded-xl border border-edge p-4 space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1 block">Email</label>
                <p className="text-sm text-body">{user.email}</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={e => setDisplayNameInput(e.target.value)}
                    placeholder="Your name"
                    maxLength={40}
                    className="flex-1 bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
                  />
                  <button
                    onClick={() => updateDisplayName(displayNameInput.trim())}
                    disabled={displayNameInput.trim() === (profile?.displayName || '')}
                    className="px-4 py-2 text-sm bg-aero-blue hover:bg-aero-blue-dark text-white rounded-lg transition-colors btn-press disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Sign-in provider */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1 block">Sign-in Method</label>
                <p className="text-sm text-body capitalize">{user.providerData?.[0]?.providerId === 'password' ? 'Email & Password' : 'Google'}</p>
              </div>

              {/* Change Password — only for email users */}
              {isEmailUser && (
                <div>
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="text-sm text-aero-blue hover:text-aero-blue-dark transition-colors"
                    >
                      Change password
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 characters)"
                        className="w-full bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handlePasswordChange}
                          disabled={!currentPassword || !newPassword}
                          className="px-4 py-2 text-sm bg-aero-blue hover:bg-aero-blue-dark text-white rounded-lg transition-colors btn-press disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => { setShowPasswordForm(false); setPasswordMsg(null); setCurrentPassword(''); setNewPassword(''); }}
                          className="px-4 py-2 text-sm border border-edge rounded-lg text-body hover:bg-hover transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      {passwordMsg && (
                        <p className={`text-xs ${passwordMsg.type === 'success' ? 'text-success' : 'text-red-400'}`}>
                          {passwordMsg.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Theme */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-heading mb-3">Appearance</h2>
          <div className="bg-panel rounded-xl border border-edge p-4">
            <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all btn-press ${
                    theme === t
                      ? 'border-aero-blue bg-aero-blue/10 text-aero-blue'
                      : 'border-edge text-body hover:border-muted hover:bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {t === 'light' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                    <span className="capitalize">{t}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Persona */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-heading mb-3">Persona</h2>
          <div className="bg-panel rounded-xl border border-edge p-4 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-2 block">DashTwo Personality</label>
              <select
                value={activePersona}
                onChange={e => setPersona(e.target.value as PersonaId)}
                className="w-full bg-input border border-edge rounded-lg px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-aero-blue cursor-pointer"
              >
                {PERSONA_CATALOG.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              {activePersonaConfig && (
                <p className="text-xs text-muted mt-1.5">{activePersonaConfig.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Callsign</label>
                <input
                  type="text"
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                  placeholder="e.g. Maverick"
                  maxLength={20}
                  className="w-full bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Pilot Name</label>
                <input
                  type="text"
                  value={pilotName}
                  onChange={e => setPilotName(e.target.value)}
                  placeholder="e.g. Pete Mitchell"
                  maxLength={40}
                  className="w-full bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
                />
              </div>
            </div>

            {isMilitary && (
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Military Branch</label>
                <div className="flex flex-wrap gap-2">
                  {BRANCH_OPTIONS.map(b => (
                    <button
                      key={b.value}
                      onClick={() => setMilitaryBranch(militaryBranch === b.value ? null : b.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors btn-press ${
                        militaryBranch === b.value
                          ? 'border-aero-blue bg-aero-blue/10 text-aero-blue'
                          : 'border-edge text-body hover:bg-hover'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePersona === 'custom' && (
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Custom Instructions</label>
                <textarea
                  value={customPromptPrefix}
                  onChange={e => setCustomPromptPrefix(e.target.value)}
                  placeholder="Define how DashTwo should communicate..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue resize-none"
                />
              </div>
            )}
          </div>
        </section>

        {/* Subscription */}
        {user && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-heading mb-3">Subscription</h2>
            {profile?.tier === 'paid' ? (
              <div className="bg-panel rounded-xl border border-edge p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-heading">DashTwo Pro</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">Active</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {profile.paidSince ? `Member since ${new Date(profile.paidSince).toLocaleDateString()}` : 'Unlimited access'}
                    </p>
                  </div>
                  <button
                    onClick={openPortal}
                    className="px-4 py-2 text-sm border border-edge rounded-lg text-body hover:bg-hover transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ) : profile?.verificationStatus?.startsWith('verified') ? (
              <div className="bg-panel rounded-xl border border-edge p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-heading">Verified {profile.verificationStatus === 'verified_cfi' ? 'CFI' : 'Student'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">Unlimited</span>
                </div>
                <p className="text-xs text-muted mt-1">You have unlimited DashTwo access through verification.</p>
              </div>
            ) : (
              <UpgradeCard />
            )}
          </section>
        )}

        {/* Usage */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-heading mb-3">Usage</h2>
          <div className="bg-panel rounded-xl border border-edge p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-heading">{stats.totalConversations}</div>
                <div className="text-xs text-muted">Conversations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">{stats.totalMessages}</div>
                <div className="text-xs text-muted">Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">
                  {stats.oldestDate ? Math.max(1, Math.ceil((Date.now() - stats.oldestDate) / (1000 * 60 * 60 * 24))) : 0}
                </div>
                <div className="text-xs text-muted">Days active</div>
              </div>
            </div>
            {user && profile?.tier === 'free' && !profile?.verificationStatus?.startsWith('verified') && (
              <div className="mt-3 pt-3 border-t border-edge">
                <p className="text-xs text-muted">Free tier: limited daily usage. Verify as a student or CFI for unlimited access.</p>
              </div>
            )}
          </div>
        </section>

        {/* Aircraft Type */}
        {user && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-heading mb-3">Aircraft</h2>
            <div className="bg-panel rounded-xl border border-edge p-4">
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Primary Aircraft Type</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aircraftInput}
                  onChange={e => setAircraftInput(e.target.value)}
                  placeholder="e.g. Cessna 172S, PA-28-181"
                  maxLength={50}
                  className="flex-1 bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
                />
                <button
                  onClick={() => updateAircraftType(aircraftInput.trim())}
                  disabled={aircraftInput.trim() === (profile?.aircraftType || '')}
                  className="px-4 py-2 text-sm bg-aero-blue hover:bg-aero-blue-dark text-white rounded-lg transition-colors btn-press disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-faint mt-1.5">Used to personalize DashTwo answers for your aircraft.</p>
            </div>
          </section>
        )}

        {/* Data Controls */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-heading mb-3">Data Controls</h2>
          <div className="bg-panel rounded-xl border border-edge p-4 space-y-3">
            {/* Export */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-heading">Export conversations</div>
                <div className="text-xs text-muted">Download all your conversations as JSON</div>
              </div>
              <button
                onClick={handleExportData}
                disabled={conversations.length === 0}
                className="px-4 py-2 text-sm border border-edge rounded-lg text-body hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Export
              </button>
            </div>

            {/* Clear conversations */}
            <div className="border-t border-edge pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-heading">Clear all conversations</div>
                  <div className="text-xs text-muted">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''} stored locally</div>
                </div>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={conversations.length === 0}
                    className="px-4 py-2 text-sm border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { clearAllConversations(); setShowClearConfirm(false); }}
                      className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 text-sm border border-edge rounded-lg text-body hover:bg-hover transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-heading mb-3">Keyboard Shortcuts</h2>
          <div className="bg-panel rounded-xl border border-edge p-4">
            <div className="space-y-2">
              {SHORTCUTS.map(s => (
                <div key={s.keys} className="flex items-center justify-between">
                  <span className="text-sm text-body">{s.action}</span>
                  <kbd className="px-2 py-1 bg-input border border-edge rounded text-xs text-muted font-mono">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CFI Referral Link */}
        {profile?.verificationStatus === 'verified_cfi' && profile.referralCode && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-heading mb-3">CFI Referral Link</h2>
            <div className="bg-panel rounded-xl border border-edge p-4">
              <p className="text-sm text-body mb-3">
                Share this link with your students. When they sign up, they get unlimited access and you get credit.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/dashtwo?ref=${profile.referralCode}`}
                  className="flex-1 bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading select-all"
                  onFocus={e => e.target.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/dashtwo?ref=${profile.referralCode}`);
                  }}
                  className="px-4 py-2 text-sm bg-aero-blue hover:bg-aero-blue-dark text-white rounded-lg transition-colors btn-press"
                >
                  Copy
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Delete Account — danger zone */}
        {user && isEmailUser && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h2>
            <div className="bg-panel rounded-xl border border-red-500/20 p-4">
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-heading">Delete account</div>
                    <div className="text-xs text-muted">Permanently delete your account and all data</div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-sm border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400">This action cannot be undone. Enter your password to confirm.</p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-input border border-edge rounded-lg px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-red-500"
                  />
                  {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword}
                      className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Permanently Delete
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                      className="px-4 py-2 text-sm border border-edge rounded-lg text-body hover:bg-hover transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold text-heading mb-3">About</h2>
          <div className="bg-panel rounded-xl border border-edge p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="/dashtwo-icon.png" alt="DashTwo" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-sm font-semibold text-heading">DashTwo</div>
                <div className="text-xs text-muted">AI Aviation Wingman</div>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              515K+ FAA documents. Every answer backed by source citations.
              Built by former fighter pilots who don't take anything at face value.
            </p>
            <div className="mt-3 pt-3 border-t border-edge">
              <p className="text-[10px] text-faint">
                Powered by Tally Aero &middot; Built on Claude by Anthropic
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
