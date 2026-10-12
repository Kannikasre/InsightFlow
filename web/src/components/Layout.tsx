import React, { useState } from 'react';
import { api } from '../api';

interface LayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, setTab, children }) => {
  const [showAsk, setShowAsk] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResponse, setAskResponse] = useState<any>(null);

  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: '📊', group: 'Analytics' },
    { id: 'feedback', label: 'Feedback Explorer', icon: '🔍', group: 'Analytics' },
    { id: 'import', label: 'Import & Workbench', icon: '📥', group: 'Analytics' },
    { id: 'insights', label: 'AI Insights & Radar', icon: '🧠', group: 'Intelligence' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡', group: 'Intelligence' },
    { id: 'issues', label: 'Issue Tracker', icon: '🎯', group: 'Intelligence' },
    { id: 'reports', label: 'Executive Reports', icon: '📄', group: 'Audit' },
    { id: 'settings', label: 'Settings & Adaption', icon: '⚙️', group: 'Audit' },
  ];

  const suggestedQuestions = [
    'What are customers most unhappy about?',
    'Which complaints increased recently?',
    'Show negative feedback about fraud',
    'Why is this issue ranked first?',
    'Which tracked issues remain unresolved?'
  ];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setAskQuestion(q);
    setAskLoading(true);
    try {
      const res = await api.ask(q);
      setAskResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAskLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('insightflow_token');
    localStorage.removeItem('insightflow_user');
    setTab('landing');
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col font-sans">
      {/* Header */}
      <header className="h-14 border-b border-border-subtle bg-bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setTab('landing')} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-accent-mint to-accent-blue flex items-center justify-center font-bold text-bg-dark text-xs">
              IF
            </div>
            <span className="font-bold tracking-tight text-sm text-text-primary">InsightFlow</span>
          </button>
          <span className="text-border-subtle">/</span>
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-mint"></span>
            <span>Workspace: <strong>BuildBattle-2026-Production</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Ask Your Feedback Button */}
          <button 
            onClick={() => {
              setShowAsk(true);
              if (!askResponse) handleAsk('What are customers most unhappy about?');
            }}
            className="px-3 py-1.5 rounded bg-bg-elevated border border-accent-blue/40 text-accent-blue text-xs font-mono flex items-center gap-2 hover:bg-accent-blue/10 transition-colors">
            <span>✨</span>
            <span>Ask Your Feedback (AI Assistant)</span>
            <kbd className="px-1.5 py-0.5 rounded bg-bg-dark text-[10px] text-text-muted border border-border-subtle">⌘K</kbd>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-border-subtle">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-text-primary">Alex Chen</div>
              <div className="text-[10px] font-mono text-text-muted">VP of Product</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded text-text-secondary hover:text-accent-coral hover:bg-bg-elevated transition-colors text-xs font-mono">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <aside className="w-60 border-r border-border-subtle bg-bg-surface/50 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2.5 mb-2">Core Analytics</div>
              <nav className="space-y-1 text-xs">
                {navItems.filter(i => i.group === 'Analytics').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors ${
                      currentTab === item.id 
                        ? 'bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2.5 mb-2">Intelligence & Action</div>
              <nav className="space-y-1 text-xs">
                {navItems.filter(i => i.group === 'Intelligence').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors ${
                      currentTab === item.id 
                        ? 'bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2.5 mb-2">Reports & Audit</div>
              <nav className="space-y-1 text-xs">
                {navItems.filter(i => i.group === 'Audit').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors ${
                      currentTab === item.id 
                        ? 'bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Workspace Stats */}
          <div className="p-3 rounded bg-bg-surface border border-border-subtle text-[11px]">
            <div className="flex items-center justify-between text-text-secondary font-mono mb-1">
              <span>Adaption Status</span>
              <span className="w-2 h-2 rounded-full bg-accent-mint"></span>
            </div>
            <div className="text-accent-mint font-mono font-medium">SDK v0.14.0 Connected</div>
            <div className="text-[10px] text-text-muted mt-1">7,000 Ingested Records</div>
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-bg-dark">
          {children}
        </main>
      </div>

      {/* Ask Your Feedback Modal */}
      {showAsk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="editorial-card w-full max-w-2xl bg-bg-surface p-6 shadow-2xl border-accent-blue/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <span className="font-bold text-sm text-text-primary">Ask Your Feedback — Conversational Intelligence</span>
              </div>
              <button onClick={() => setShowAsk(false)} className="text-text-secondary hover:text-text-primary text-xs font-mono">✕ Close</button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle text-[11px] text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors">
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk(askQuestion)}
                placeholder="Ask any question about customer sentiment or issues..."
                className="flex-1 px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-blue"
              />
              <button
                onClick={() => handleAsk(askQuestion)}
                disabled={askLoading}
                className="px-4 py-2.5 rounded bg-accent-blue text-bg-dark font-bold text-xs hover:bg-accent-blue/90 disabled:opacity-50">
                {askLoading ? 'Querying...' : 'Query'}
              </button>
            </div>

            {/* Response */}
            {askResponse && (
              <div className="p-4 rounded bg-bg-dark border border-border-subtle max-h-80 overflow-y-auto space-y-3">
                <div 
                  className="text-xs text-text-primary leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: askResponse.answer
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }}
                />

                {askResponse.evidence && askResponse.evidence.length > 0 && (
                  <div className="pt-3 border-t border-border-subtle">
                    <div className="text-[10px] font-mono uppercase text-accent-mint mb-2">Supporting Feedback Evidence:</div>
                    <div className="space-y-1.5">
                      {askResponse.evidence.map((ev: any, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-bg-surface border border-border-subtle text-[11px] text-text-secondary italic">
                          "{ev.text}"
                          <span className="not-italic text-[10px] font-mono text-accent-blue ml-2">— {ev.source} ({ev.category})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
