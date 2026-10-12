import React from 'react';
import { api } from '../api';

export const LandingPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const launchDemo = async () => {
    try {
      await api.demoLogin();
    } catch (e) {
      console.error(e);
    }
    setTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary selection:bg-accent-mint/20">
      {/* Navigation Bar */}
      <header className="border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-mint to-accent-blue flex items-center justify-center font-bold text-bg-dark text-sm tracking-wider">
              IF
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-text-primary">InsightFlow</span>
              <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-bg-elevated text-accent-mint border border-border-subtle">BuildBattle 2026</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#workflow" className="hover:text-text-primary transition-colors">Workflow</a>
            <a href="#differentiators" className="hover:text-text-primary transition-colors">Evidence Engine</a>
            <a href="#preview" className="hover:text-text-primary transition-colors">Live Preview</a>
            <a href="#adaption" className="hover:text-text-primary transition-colors">Adaption Labs</a>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={launchDemo} className="px-4 py-2 text-xs font-mono font-medium rounded border border-accent-mint/40 text-accent-mint hover:bg-accent-mint/10 transition-colors">
              Instant Demo Access
            </button>
            <button onClick={() => setTab('auth')} className="px-4 py-2 text-xs font-medium rounded bg-accent-mint text-bg-dark font-semibold hover:bg-accent-mint/90 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-mint animate-pulse"></span>
              <span>Intelligent Decision Intelligence Architecture</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15] mb-6">
              Convert raw customer noise into <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-mint via-accent-blue to-accent-amber">evidence-backed executive decisions</span>.
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl font-light">
              Stop guessing what to fix next. InsightFlow synthesizes thousands of multi-channel customer reviews, reveals hidden complaint clusters, calculates transparent Customer Impact Scores, and powers a seamless Feedback-to-Fix workflow.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button onClick={launchDemo} className="px-6 py-3.5 rounded bg-accent-mint text-bg-dark font-semibold text-sm hover:bg-accent-mint/90 shadow-lg shadow-accent-mint/10 transition-all flex items-center gap-2">
                <span>Enter Workspace (7,000 Dataset Pre-Loaded)</span>
                <span>→</span>
              </button>
              <button onClick={() => setTab('auth')} className="px-6 py-3.5 rounded bg-bg-surface border border-border-subtle text-text-primary text-sm hover:bg-bg-elevated transition-colors">
                Sign In / Register
              </button>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border-subtle">
              <div>
                <div className="text-2xl font-bold font-mono text-accent-mint tabular-nums">7,000+</div>
                <div className="text-xs text-text-secondary mt-1">Multi-Category Ingestion</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-accent-amber tabular-nums">100%</div>
                <div className="text-xs text-text-secondary mt-1">Evidence-Backed Provenance</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-accent-blue tabular-nums">v0.14</div>
                <div className="text-xs text-text-secondary mt-1">Adaption SDK Integration</div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Surface */}
          <div className="lg:col-span-5" id="preview">
            <div className="editorial-card p-6 shadow-2xl bg-bg-surface/90 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-coral"></span>
                  <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Dominant Critical Issue</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono badge-critical">Score 94.2/100</span>
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-2">Severe Fraud & Phishing Impersonations</h3>
              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                Spoofed merchant links and unauthorized account debits resulting in immediate customer financial panic. Correlated with 1,755 real complaints.
              </p>

              {/* Evidence Quotes Preview */}
              <div className="space-y-2 mb-5">
                <div className="p-2.5 rounded bg-bg-dark/80 border border-border-subtle text-xs">
                  <div className="text-accent-amber text-[10px] font-mono mb-1">Customer Quote #2481 • Trustpilot • Critical</div>
                  <div className="text-text-primary italic">"I was charged twice without any confirmation email. Looks like a fake seller took my payment."</div>
                </div>
                <div className="p-2.5 rounded bg-bg-dark/80 border border-border-subtle text-xs">
                  <div className="text-accent-coral text-[10px] font-mono mb-1">Customer Quote #5102 • Zendesk • Critical</div>
                  <div className="text-text-primary italic">"This website stole my money and gave no receipt. Total scam company, unauthorized charge on my Visa."</div>
                </div>
              </div>

              {/* Recommendation Link */}
              <div className="p-3 rounded bg-bg-elevated border border-accent-mint/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-accent-mint font-medium">Recommended Engineering Fix:</div>
                  <div className="text-xs text-text-primary font-medium mt-0.5">Enforce Cryptographic Payment Widget Verification</div>
                </div>
                <button onClick={launchDemo} className="px-2.5 py-1 text-[11px] rounded bg-accent-mint text-bg-dark font-bold hover:bg-accent-mint/90">
                  Track →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-y border-border-subtle bg-bg-surface/40 py-20" id="workflow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-accent-mint uppercase tracking-wider">System Architecture</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary mt-2">The Closed-Loop Feedback-to-Fix Workflow</h2>
            <p className="text-sm text-text-secondary mt-3">From raw unstructured noise to deployed production resolutions with full traceability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="editorial-card p-6">
              <div className="text-accent-blue font-mono text-xs font-bold mb-3">STAGE 01</div>
              <h4 className="text-base font-bold text-text-primary mb-2">Ingest & Adapt</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Server-side CSV streaming and schema normalization, plugged into Adaption Labs data optimization pipeline.
              </p>
            </div>

            <div className="editorial-card p-6">
              <div className="text-accent-amber font-mono text-xs font-bold mb-3">STAGE 02</div>
              <h4 className="text-base font-bold text-text-primary mb-2">Hidden Detector</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Identifies disguised complaints across divergent phrases ("stuck spinning" vs "black box" vs "freezes").
              </p>
            </div>

            <div className="editorial-card p-6">
              <div className="text-accent-coral font-mono text-xs font-bold mb-3">STAGE 03</div>
              <h4 className="text-base font-bold text-text-primary mb-2">Impact Scoring</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Transparent 4-factor formula combining frequency, negative rate, severity weight, and trend velocity.
              </p>
            </div>

            <div className="editorial-card p-6">
              <div className="text-accent-mint font-mono text-xs font-bold mb-3">STAGE 04</div>
              <h4 className="text-base font-bold text-text-primary mb-2">Track & Resolve</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                1-click conversion to tracked engineering issues with attached customer quotes and resolution audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20" id="differentiators">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono text-accent-blue uppercase tracking-wider">Unique Capabilities</span>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary mt-2">Engineered for Rigorous Decision-Making</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="editorial-card p-6">
            <div className="w-10 h-10 rounded bg-accent-mint/10 border border-accent-mint/30 flex items-center justify-center text-accent-mint font-bold mb-4">
              A
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Evidence-First Intelligence</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every chart, metric, and recommendation links directly to verified customer submissions. Never hallucinate statistics or trust ungrounded summaries.
            </p>
          </div>

          <div className="editorial-card p-6">
            <div className="w-10 h-10 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber font-bold mb-4">
              B
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Customer Pain Radar</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Real-time monitoring of systemic failures with growth velocity tracking and cross-category complaint connection cascading maps.
            </p>
          </div>

          <div className="editorial-card p-6">
            <div className="w-10 h-10 rounded bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-bold mb-4">
              C
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Ask Your Feedback</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Conversational analytics engine answering complex queries grounded in SQL records: "Why is this ranked first?", "Show negative pricing feedback".
            </p>
          </div>
        </div>
      </section>

      {/* Adaption Section */}
      <section className="border-t border-border-subtle bg-bg-surface/60 py-16" id="adaption">
        <div className="max-w-7xl mx-auto px-6">
          <div className="editorial-card p-8 border-accent-blue/40 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono text-accent-blue uppercase tracking-wider">Mandatory Hackathon Requirement</span>
                <h3 className="text-2xl font-bold text-text-primary mt-1">Official Adaption Labs Integration</h3>
                <p className="text-xs text-text-secondary mt-2 max-w-2xl leading-relaxed">
                  InsightFlow integrates the official Adaption Python SDK (<code className="text-accent-mint">pip install adaption</code>). It manages <code className="text-text-primary">client.datasets.upload_file</code> and <code className="text-text-primary">client.datasets.adapt</code> with transparent fallback diagnostic tracing and execution provenance.
                </p>
              </div>
              <button onClick={() => setTab('settings')} className="px-5 py-3 rounded bg-accent-blue text-bg-dark font-bold text-xs hover:bg-accent-blue/90 shrink-0">
                Inspect Adaption Diagnostics →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-10 px-6 text-center text-xs text-text-secondary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>InsightFlow © 2026 • Build Battle AI Web Development Hackathon</div>
          <div className="font-mono text-[11px] text-text-muted">Built with TypeScript • Python Flask • PostgreSQL / SQLite • Adaption SDK</div>
        </div>
      </footer>
    </div>
  );
};
