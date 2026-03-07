import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavIcon } from './NavIcon';
import { WaitlistForm } from './WaitlistForm';
import { SocialProof } from './SocialProof';
import type { LandingPageConfig } from '@/types/landing';

interface LandingPageProps {
  config: LandingPageConfig;
}

export function LandingPage({ config }: LandingPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = config.title;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `https://tallyaero.com${config.path}`;
    return () => {
      document.title = 'Tally Aero — AI Flight Training Platform';
      if (canonical) canonical.href = 'https://tallyaero.com';
    };
  }, [config.title, config.path]);

  return (
    <div className="min-h-screen overflow-y-auto bg-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <section className="text-center mb-10 sm:mb-16">
          <img src="/tally-aero-logo.png" alt="Tally Aero" className="h-10 mx-auto mb-6 object-contain" />
          <div className="inline-flex items-center gap-2 mb-6">
            <NavIcon icon={config.icon} className="w-8 h-8 text-aero-blue-light" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-heading mb-4">
            {config.headline}
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {config.subtitle}
          </p>
        </section>

        {/* Philosophy */}
        {config.philosophy && (
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl font-semibold text-heading mb-4">Why This Matters</h2>
            <div className="bg-panel rounded-2xl p-6 border border-edge">
              <p className="text-body leading-relaxed">{config.philosophy}</p>
            </div>
          </section>
        )}

        {/* Features */}
        {config.features.length > 0 && (
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl font-semibold text-heading mb-4">What We're Building</h2>
            <div className="grid gap-3">
              {config.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 bg-panel rounded-xl px-4 py-3 border border-edge">
                  <svg className="w-5 h-5 text-aero-blue-light shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-body">{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DashTwo CTA */}
        {config.dashtwoPrompt && (
          <section className="mb-10 sm:mb-16 text-center">
            <div className="bg-gradient-to-r from-base to-panel rounded-2xl p-8 border border-edge">
              <img src="/dashtwo-icon.png" alt="DashTwo" className="h-16 w-16 mx-auto mb-3 object-contain" />
              <h3 className="text-lg font-semibold text-heading mb-2">Try DashTwo Now</h3>
              <p className="text-sm text-muted mb-4">DashTwo is live — ask it anything about aviation.</p>
              <button
                onClick={() => navigate('/dashtwo', { state: { prompt: config.dashtwoPrompt } })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-aero-blue hover:bg-aero-blue-dark text-white rounded-xl text-sm font-medium transition-colors btn-press"
              >
                <NavIcon icon="chat" className="w-4 h-4" />
                {config.dashtwoPrompt}
              </button>
            </div>
          </section>
        )}

        {/* Waitlist */}
        {config.status !== 'live' && (
          <section className="mb-10 sm:mb-16">
            <WaitlistForm feature={config.navLabel} />
          </section>
        )}

        {/* Social Proof */}
        <section className="mb-10 sm:mb-16">
          <SocialProof />
        </section>

        {/* Trust */}
        <section className="text-center space-y-4">
          <img src="/tally-aero-favicon.png" alt="Tally Aero" className="h-8 mx-auto object-contain" />
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
            <span>515K+ FAA documents</span>
            <span className="w-1 h-1 rounded-full bg-active" />
            <span>Source citations on every answer</span>
            <span className="w-1 h-1 rounded-full bg-active" />
            <span>Built by former fighter pilots</span>
          </div>
        </section>
      </div>
    </div>
  );
}
