import React, { useState } from 'react';
import { api } from '../api';

export const AuthPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Product Lead');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        if (res.token) {
          localStorage.setItem('insightflow_token', res.token);
          localStorage.setItem('insightflow_user', JSON.stringify(res.user));
          setTab('dashboard');
        } else {
          setError(res.error || 'Login failed');
        }
      } else {
        const res = await api.register({ email, password, full_name: fullName, role });
        if (res.token) {
          localStorage.setItem('insightflow_token', res.token);
          localStorage.setItem('insightflow_user', JSON.stringify(res.user));
          setTab('dashboard');
        } else {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      const res = await api.demoLogin();
      if (res.token) {
        localStorage.setItem('insightflow_token', res.token);
        localStorage.setItem('insightflow_user', JSON.stringify(res.user));
        setTab('dashboard');
      }
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="editorial-card w-full max-w-md p-8 relative z-10 bg-bg-surface shadow-2xl border-border-subtle">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-mint to-accent-blue flex items-center justify-center font-bold text-bg-dark text-sm">
            IF
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-text-primary">InsightFlow</span>
            <span className="block text-[11px] font-mono text-text-muted">Decision Intelligence Platform</span>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex border-b border-border-subtle mb-6">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-2.5 text-xs font-mono font-medium border-b-2 transition-colors text-center ${
              isLogin ? 'border-accent-mint text-accent-mint' : 'border-transparent text-text-secondary'
            }`}>
            SIGN IN
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-2.5 text-xs font-mono font-medium border-b-2 transition-colors text-center ${
              !isLogin ? 'border-accent-mint text-accent-mint' : 'border-transparent text-text-secondary'
            }`}>
            REGISTER
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-accent-coral/10 border border-accent-coral/30 text-accent-coral text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">FULL NAME</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
                required
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">ROLE / TITLE</label>
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Head of Product / Support Lead"
                className="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">EMAIL ADDRESS</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded bg-accent-mint text-bg-dark font-semibold text-xs hover:bg-accent-mint/90 transition-colors disabled:opacity-50">
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Workspace' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
          <span className="relative px-3 bg-bg-surface text-[10px] font-mono text-text-muted">OR FOR EVALUATORS</span>
        </div>

        <button 
          onClick={handleDemo} 
          type="button"
          className="w-full py-2.5 rounded bg-bg-elevated border border-border-subtle text-accent-blue font-mono text-xs hover:bg-bg-elevated/80 hover:border-accent-blue/40 transition-colors flex items-center justify-center gap-2">
          <span>⚡ Instant Demo Access (Pre-Seeded 7,000 Records)</span>
        </button>

        <div className="mt-6 text-center">
          <button onClick={() => setTab('landing')} className="text-xs text-text-secondary hover:text-text-primary">
            ← Back to Product Overview
          </button>
        </div>
      </div>
    </div>
  );
};
