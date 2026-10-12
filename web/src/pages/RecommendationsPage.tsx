import React, { useEffect, useState } from 'react';
import { api } from '../api';

export const RecommendationsPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await api.listRecommendations();
      setRecommendations(res.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePromote = async (rec: any) => {
    try {
      await api.convertToIssue(rec.id, {
        assigned_to: 'Platform Reliability Squad',
        priority: rec.suggested_priority
      });
      loadData();
      setTab('issues');
    } catch (e) {
      alert('Failed to promote to tracked issue');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="text-xs font-mono text-accent-amber uppercase">STRATEGIC DECISION INTELLIGENCE</div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Actionable Recommendations</h1>
          <p className="text-xs text-text-secondary mt-1">Specific, evidence-supported engineering interventions ranked by transparent Customer Impact Scores.</p>
        </div>

        <button onClick={() => setTab('issues')} className="px-4 py-2 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary hover:bg-bg-elevated transition-colors">
          View Issue Tracker →
        </button>
      </div>

      {/* Priority Calculation Formula Box */}
      <div className="editorial-card p-4 border-border-subtle bg-bg-surface/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber font-mono font-bold text-xs">
            CIS
          </span>
          <div>
            <div className="text-xs font-bold text-text-primary">Transparent Customer Impact Score (0–100) Formulation</div>
            <div className="text-[11px] font-mono text-text-secondary mt-0.5">
              Impact = Volume(30%) + Negative Polarity(30%) + Severity Factor(25%) + Velocity Trend(15%)
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-text-muted">
          All recommendations tied to verified customer records
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-6">
        {recommendations.map((rec, idx) => (
          <div key={rec.id} className="editorial-card p-6 space-y-5 hover:border-accent-mint/40 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-text-muted">RECOMMENDATION 0{idx + 1}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  rec.suggested_priority === 'Critical' ? 'badge-critical' : rec.suggested_priority === 'High' ? 'badge-high' : 'badge-medium'
                }`}>
                  {rec.suggested_priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-dark border border-border-subtle text-text-secondary">
                  {rec.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-text-muted">Impact Score:</span>
                <span className="font-bold text-accent-coral">{rec.impact_score}/100</span>
                <span className="text-border-subtle">•</span>
                <span className="text-text-muted">{rec.evidence_count} Supporting Evidence</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-primary">{rec.title}</h3>
              <div className="text-xs text-text-secondary mt-1">
                Target Problem: <strong className="text-text-primary">{rec.issue_title}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-accent-mint font-semibold block">Prescribed Action Steps:</span>
                <div className="text-text-primary leading-relaxed whitespace-pre-line font-mono text-[11px]">{rec.action_steps}</div>
              </div>

              <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-accent-blue font-semibold block">Strategic Rationale:</span>
                <div className="text-text-secondary leading-relaxed">{rec.rationale}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded bg-accent-mint/5 border border-accent-mint/20 space-y-1">
                <span className="text-[10px] font-mono uppercase text-accent-mint font-semibold block">Projected Business Impact:</span>
                <span className="text-text-primary text-[11px]">{rec.potential_impact}</span>
              </div>

              <div className="p-3 rounded bg-accent-amber/5 border border-accent-amber/20 space-y-1">
                <span className="text-[10px] font-mono uppercase text-accent-amber font-semibold block">Documented Limitations & Trade-offs:</span>
                <span className="text-text-secondary text-[11px]">{rec.limitations}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <div className="flex items-center gap-2">
                {rec.has_tracked_issue ? (
                  <span className="px-2.5 py-1 rounded bg-accent-mint/10 border border-accent-mint/30 text-accent-mint text-xs font-mono">
                    ✓ Tracked in Engineering Pipeline (Issue #{rec.tracked_issue_id})
                  </span>
                ) : (
                  <span className="text-xs text-text-muted font-mono">
                    Proposed Recommendation • Awaiting Engineering Commitment
                  </span>
                )}
              </div>

              <div>
                {!rec.has_tracked_issue ? (
                  <button 
                    onClick={() => handlePromote(rec)}
                    className="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 transition-colors flex items-center gap-1.5">
                    <span>⚡ Convert to Tracked Issue (Feedback-to-Fix)</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setTab('issues')}
                    className="px-3.5 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs font-mono text-text-primary hover:border-accent-mint transition-colors">
                    Inspect in Issue Tracker →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
