import React, { useEffect, useState } from 'react';
import { api } from '../api';

export const InsightsPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'radar' | 'cascade' | 'timeline' | 'hidden'>('radar');
  const [painRadar, setPainRadar] = useState<any[]>([]);
  const [connectionData, setConnectionData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [hiddenClusters, setHiddenClusters] = useState<any[]>([]);
  const [evidenceData, setEvidenceData] = useState<any>(null);

  useEffect(() => {
    api.getPainRadar().then(res => setPainRadar(res.issues || []));
    api.getConnectionMap().then(res => setConnectionData(res));
    api.getTimeline().then(res => setTimelineData(res));
    api.getHiddenComplaints().then(res => setHiddenClusters(res.clusters || []));
  }, []);

  const openEvidence = async (issueId: number) => {
    try {
      const data = await api.getEvidence(issueId);
      setEvidenceData(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="text-xs font-mono text-accent-coral uppercase">DEEP DECISION INTELLIGENCE</div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">AI Insights & Evidence Laboratory</h1>
          <p className="text-xs text-text-secondary mt-1">Investigate customer pain radars, semantic complaint cascades, and verified evidence trails.</p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 bg-bg-surface p-1 rounded-lg border border-border-subtle text-xs font-mono">
          <button 
            onClick={() => setActiveSubTab('radar')}
            className={`px-3 py-1.5 rounded transition-colors ${activeSubTab === 'radar' ? 'bg-bg-elevated text-accent-mint font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            Pain Radar
          </button>
          <button 
            onClick={() => setActiveSubTab('cascade')}
            className={`px-3 py-1.5 rounded transition-colors ${activeSubTab === 'cascade' ? 'bg-bg-elevated text-accent-mint font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            Connection Map
          </button>
          <button 
            onClick={() => setActiveSubTab('timeline')}
            className={`px-3 py-1.5 rounded transition-colors ${activeSubTab === 'timeline' ? 'bg-bg-elevated text-accent-mint font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            What Changed?
          </button>
          <button 
            onClick={() => setActiveSubTab('hidden')}
            className={`px-3 py-1.5 rounded transition-colors ${activeSubTab === 'hidden' ? 'bg-bg-elevated text-accent-mint font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            Hidden Detector
          </button>
        </div>
      </div>

      {/* TAB 1: Pain Radar */}
      {activeSubTab === 'radar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painRadar.map((iss) => (
            <div key={iss.id} className="editorial-card p-6 space-y-4 hover:border-accent-mint/50 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-dark border border-border-subtle text-text-secondary">
                  {iss.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  iss.severity === 'Critical' ? 'badge-critical' : iss.severity === 'High' ? 'badge-high' : 'badge-medium'
                }`}>
                  Impact: {iss.impact_score}/100
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-text-primary">{iss.title}</h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{iss.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded bg-bg-dark border border-border-subtle text-xs font-mono">
                <div>
                  <span className="text-[10px] text-text-muted block">VOLUME</span>
                  <span className="font-bold text-text-primary">{iss.frequency?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-accent-coral block">NEGATIVE</span>
                  <span className="font-bold text-accent-coral">{iss.negative_pct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-accent-mint block">VELOCITY</span>
                  <span className="font-bold text-accent-mint">{iss.trend}</span>
                </div>
              </div>

              {iss.representative_quotes?.[0] && (
                <div className="p-3 rounded bg-bg-dark/80 border border-border-subtle text-xs text-text-secondary italic">
                  "{iss.representative_quotes[0]}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={() => openEvidence(iss.id)}
                  className="text-xs font-mono text-accent-blue hover:underline flex items-center gap-1">
                  <span>Inspect Evidence Trail ({iss.evidence_count} items)</span>
                  <span>→</span>
                </button>
                <button 
                  onClick={() => setTab('recommendations')} 
                  className="px-3 py-1 rounded bg-bg-elevated border border-border-subtle text-xs font-medium hover:border-accent-mint text-text-primary">
                  View Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Connection Map */}
      {activeSubTab === 'cascade' && connectionData && (
        <div className="editorial-card p-6 border-accent-blue/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-bold text-text-primary">Systemic Cause-and-Effect Cascade</h3>
              <p className="text-xs text-text-secondary mt-1">Cross-category telemetry mapping how operational latency cascades into fraud claims and user churn.</p>
            </div>
            <span className="text-xs font-mono text-accent-blue">Hypothesis Graph</span>
          </div>

          <div className="p-4 rounded bg-accent-blue/10 border border-accent-blue/30 text-xs text-text-primary leading-relaxed">
            {connectionData.hypothesis_summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-4">
            {connectionData.nodes?.map((node: any, idx: number) => (
              <div key={idx} className="p-4 rounded bg-bg-dark border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-text-muted">STEP 0{idx + 1}</span>
                  <span className={node.severity === 'Critical' ? 'text-accent-coral font-bold' : 'text-accent-amber font-bold'}>
                    {node.severity}
                  </span>
                </div>
                <div className="font-bold text-xs text-text-primary">{node.label}</div>
                <div className="text-[11px] font-mono text-accent-mint">Impact: {node.impact}/100</div>
                <div className="text-[10px] text-text-secondary">{node.category}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-2">
            <div className="text-xs font-mono text-text-secondary uppercase">Verified Causal Links:</div>
            {connectionData.edges?.map((edge: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded bg-bg-dark border border-border-subtle text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-accent-coral">{edge.from}</span>
                  <span className="text-text-muted">───────►</span>
                  <span className="text-accent-blue">{edge.to}</span>
                </div>
                <span className="text-text-secondary italic">{edge.label} (Confidence: {(edge.strength * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: What Changed? */}
      {activeSubTab === 'timeline' && timelineData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timelineData.periods?.map((p: any, i: number) => (
              <div key={i} className="editorial-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <span className="text-xs font-mono uppercase text-accent-mint">{p.period}</span>
                  <span className="text-[10px] font-mono text-text-muted">Period #{i + 1}</span>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold font-mono text-text-primary">{p.total_volume?.toLocaleString()} Records</div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-accent-coral">Negative Dissatisfaction:</span>
                    <span className="font-bold text-accent-coral">{p.negative_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-accent-mint">Positive Praise:</span>
                    <span className="font-bold text-accent-mint">{p.positive_rate}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle">
                  <div className="text-[10px] font-mono text-text-muted uppercase mb-1">Dominant Ingestion Topic:</div>
                  <div className="text-xs font-semibold text-text-primary">{p.top_category}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="editorial-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Key Period-Over-Period Inflection Signals</h3>
            <div className="space-y-2">
              {timelineData.key_shifts?.map((shift: any, idx: number) => (
                <div key={idx} className="p-3 rounded bg-bg-dark border border-border-subtle text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-accent-coral font-mono mr-2">{shift.shift}</span>
                    <span className="text-text-secondary">{shift.impact}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{shift.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hidden Complaint Detector */}
      {activeSubTab === 'hidden' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hiddenClusters.map((c, idx) => (
            <div key={idx} className="editorial-card p-6 space-y-4 border-accent-amber/30">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-mono text-accent-amber font-semibold">{c.detected_category}</span>
                <span className="text-[10px] font-mono text-text-muted">{c.affected_volume} affected</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-text-primary">{c.cluster_title}</h3>
                <p className="text-[11px] text-text-secondary mt-1">Underlying Root Cause: <strong className="text-text-primary">{c.underlying_cause}</strong></p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="text-[10px] font-mono uppercase text-text-muted">Semantic Phrasing Variants:</div>
                {c.variant_phrasings?.map((phrase: string, pIdx: number) => (
                  <div key={pIdx} className="p-2 rounded bg-bg-dark border border-border-subtle text-[11px] text-text-secondary italic">
                    "{phrase}"
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <span className="text-[10px] font-mono text-accent-mint">Cluster Match Confidence: {(c.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Modal */}
      {evidenceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="editorial-card w-full max-w-3xl bg-bg-surface p-6 shadow-2xl border-accent-mint/40 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase text-accent-mint">INSIGHT-TO-EVIDENCE EXPLORER</span>
                <h3 className="text-lg font-bold text-text-primary">{evidenceData.issue?.title}</h3>
              </div>
              <button onClick={() => setEvidenceData(null)} className="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
            </div>

            {/* Methodology */}
            <div className="p-4 rounded bg-bg-dark border border-border-subtle text-xs space-y-2 shrink-0">
              <div className="font-mono text-accent-mint font-semibold">Mathematical Provenance & Impact Score Formula:</div>
              <div className="text-[11px] text-text-secondary font-mono">{evidenceData.methodology?.formula}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-bg-surface">
                  <span className="text-text-muted block">Volume Weight:</span>
                  <span className="text-text-primary font-bold">{evidenceData.methodology?.factor_breakdown?.volume_contribution}</span>
                </div>
                <div className="p-1.5 rounded bg-bg-surface">
                  <span className="text-text-muted block">Negative Polarity:</span>
                  <span className="text-accent-coral font-bold">{evidenceData.methodology?.factor_breakdown?.negative_rate_contribution}</span>
                </div>
                <div className="p-1.5 rounded bg-bg-surface">
                  <span className="text-text-muted block">Severity Multiplier:</span>
                  <span className="text-accent-amber font-bold">{evidenceData.methodology?.factor_breakdown?.severity_weight}</span>
                </div>
                <div className="p-1.5 rounded bg-bg-surface">
                  <span className="text-text-muted block">Velocity Rate:</span>
                  <span className="text-accent-mint font-bold">{evidenceData.methodology?.factor_breakdown?.velocity_weight}</span>
                </div>
              </div>
            </div>

            {/* Evidence List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="text-xs font-mono text-text-secondary uppercase mb-2">Supporting Feedback Entries (Sample Size: {evidenceData.evidence_records?.length}):</div>
              {evidenceData.evidence_records?.map((rec: any, idx: number) => (
                <div key={idx} className="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
                  <div className="text-text-primary leading-relaxed font-sans italic">"{rec.text}"</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1">
                    <span>{rec.source} • Severity: {rec.severity} • {new Date(rec.timestamp).toLocaleDateString()}</span>
                    <span className="text-accent-mint">Relevance: {(rec.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border-subtle shrink-0">
              <button onClick={() => setEvidenceData(null)} className="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs">
                Done Reviewing Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
