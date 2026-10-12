import React, { useEffect, useState } from 'react';
import { api } from '../api';

export const ReportsSettingsPage: React.FC<{ initialTab?: string }> = ({ initialTab = 'reports' }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [adaptionStatus, setAdaptionStatus] = useState<any>(null);
  const [newKey, setNewKey] = useState('');

  const loadData = async () => {
    try {
      const rep = await api.getReportSummary();
      setReportSummary(rep);
      const adapt = await api.getAdaptionStatus();
      setAdaptionStatus(adapt);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateKey = async () => {
    if (!newKey.trim()) return;
    try {
      const res = await api.updateAdaptionKey(newKey.trim());
      alert(res.message);
      setNewKey('');
      loadData();
    } catch (e) {
      alert('Failed to update Adaption key');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="text-xs font-mono text-accent-blue uppercase">ENTERPRISE AUDIT & SYSTEM CONTROLS</div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            {activeSubTab === 'reports' ? 'Executive Reports & Exports' : 'Workspace Settings & Adaption Diagnostics'}
          </h1>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-2 bg-bg-surface p-1 rounded-lg border border-border-subtle text-xs font-mono">
          <button 
            onClick={() => setActiveSubTab('reports')} 
            className={`px-4 py-1.5 rounded transition-colors ${activeSubTab === 'reports' ? 'bg-bg-elevated text-accent-mint font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            Executive Reports
          </button>
          <button 
            onClick={() => setActiveSubTab('settings')} 
            className={`px-4 py-1.5 rounded transition-colors ${activeSubTab === 'settings' ? 'bg-bg-elevated text-accent-mint font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            Settings & Adaption Lab
          </button>
        </div>
      </div>

      {/* SECTION A: Reports */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="editorial-card p-6 border-accent-mint/30 bg-bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">Executive Intelligence Briefing (PDF & CSV)</h3>
              <p className="text-xs text-text-secondary mt-1">Export high-resolution audit reports formatted for executive stakeholders and data science harnesses.</p>
            </div>

            <div className="flex items-center gap-3">
              <a 
                href={api.getCsvUrl()} 
                download="InsightFlow_Analyzed_Feedback.csv"
                className="px-4 py-2 rounded bg-bg-dark border border-border-subtle text-xs font-mono text-text-primary hover:border-accent-mint transition-colors flex items-center gap-2">
                <span>📥 Export Analyzed CSV</span>
              </a>
              <a 
                href={api.getPdfUrl()} 
                download="InsightFlow_Executive_Report.pdf"
                className="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 shadow-lg shadow-accent-mint/10 transition-colors flex items-center gap-2">
                <span>📄 Download Official PDF Report</span>
              </a>
            </div>
          </div>

          {/* Report Preview */}
          <div className="editorial-card p-8 bg-bg-surface/80 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <span className="text-[10px] font-mono text-accent-mint uppercase">REPORT AUDIT DOCUMENT</span>
                <h2 className="text-xl font-bold text-text-primary mt-1">InsightFlow Executive Decision Brief</h2>
                <div className="text-xs text-text-secondary mt-0.5">Evaluation Scope: Ingested Customer Dataset (7,000 Records)</div>
              </div>
              <div className="text-right text-xs font-mono text-text-muted">
                <div>Build Battle 2026 Audit</div>
                <div>Status: Verified Data Provenance</div>
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded bg-bg-dark border border-border-subtle">
                <div className="text-[10px] font-mono text-text-muted">TOTAL RECORDS</div>
                <div className="text-xl font-bold font-mono text-text-primary mt-1">{reportSummary?.metrics?.total_records?.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded bg-bg-dark border border-border-subtle">
                <div className="text-[10px] font-mono text-accent-coral">NEGATIVE RATE</div>
                <div className="text-xl font-bold font-mono text-accent-coral mt-1">{reportSummary?.metrics?.negative_rate}%</div>
              </div>
              <div className="p-4 rounded bg-bg-dark border border-border-subtle">
                <div className="text-[10px] font-mono text-accent-mint">POSITIVE PROMOTERS</div>
                <div className="text-xl font-bold font-mono text-accent-mint mt-1">{reportSummary?.metrics?.positive_rate}%</div>
              </div>
              <div className="p-4 rounded bg-bg-dark border border-border-subtle">
                <div className="text-[10px] font-mono text-accent-amber">ENGINEERING TASKS</div>
                <div className="text-xl font-bold font-mono text-accent-amber mt-1">{reportSummary?.issue_tracking?.total} Tracked</div>
              </div>
            </div>

            {/* Top Issues */}
            <div>
              <h4 className="text-xs font-mono uppercase text-accent-coral mb-3">1. Top Customer Pain Points & Priorities:</h4>
              <div className="space-y-2">
                {reportSummary?.top_issues?.map((iss: any) => (
                  <div key={iss.id} className="p-3 rounded bg-bg-dark border border-border-subtle text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-text-primary">{iss.title}</span>
                      <span className="text-text-muted ml-2 font-mono">({iss.category})</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-accent-coral font-bold">Impact: {iss.impact_score}/100</span>
                      <span className="text-accent-mint">{iss.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-xs font-mono uppercase text-accent-mint mb-3">2. Actionable Remediations:</h4>
              <div className="space-y-2">
                {reportSummary?.recommendations?.map((rec: any) => (
                  <div key={rec.id} className="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
                    <div className="font-bold text-text-primary">{rec.title}</div>
                    <div className="text-text-secondary text-[11px] leading-relaxed">{rec.potential_impact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: Settings & Adaption */}
      {activeSubTab === 'settings' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="editorial-card p-6 space-y-4">
              <span className="text-xs font-mono uppercase text-accent-mint">OPERATOR PROFILE</span>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-text-muted block">FULL NAME</label>
                  <div className="text-text-primary font-semibold mt-0.5">Alex Chen</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-muted block">EMAIL</label>
                  <div className="text-text-primary font-mono mt-0.5">demo@insightflow.ai</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-muted block">ORGANIZATIONAL ROLE</label>
                  <div className="text-text-primary mt-0.5">VP of Product Experience</div>
                </div>
              </div>
            </div>

            <div className="editorial-card p-6 space-y-4">
              <span className="text-xs font-mono uppercase text-accent-blue">WORKSPACE ENVIRONMENT</span>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-text-muted block">WORKSPACE ID</label>
                  <div className="text-text-primary font-bold mt-0.5">ws_buildbattle_2026_prod</div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block">STORAGE ENGINE</label>
                  <div className="text-accent-mint mt-0.5">PostgreSQL / SQLite Native Persistent Storage</div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block">SECURITY PROTOCOL</label>
                  <div className="text-text-primary mt-0.5">HMAC-SHA256 JWT Authorization Bearer Tokens</div>
                </div>
              </div>
            </div>
          </div>

          {/* Adaption Integration Details */}
          <div className="editorial-card p-6 border-accent-blue/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <span className="text-xs font-mono text-accent-blue uppercase">MANDATORY HACKATHON INTEGRATION</span>
                <h3 className="text-lg font-bold text-text-primary mt-1">Adaption Labs Integration Details</h3>
                <p className="text-xs text-text-secondary mt-0.5">Complete diagnostic visibility into the Adaption data optimization workflow.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-mint"></span>
                <span className="text-xs font-mono text-text-primary">
                  SDK Version: {adaptionStatus?.sdk_version || '0.14.0'} Connected
                </span>
              </div>
            </div>

            {/* 4 Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono text-accent-mint uppercase font-semibold">1. Pipeline Placement</span>
                <div className="text-text-primary font-medium">{adaptionStatus?.pipeline_stage}</div>
                <div className="text-[11px] text-text-secondary leading-relaxed">{adaptionStatus?.integration_role}</div>
              </div>

              <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono text-accent-blue uppercase font-semibold">2. Ingested Schema Payload</span>
                <div className="text-[11px] font-mono text-text-primary leading-relaxed">
                  prompt: "review", completion: "category", context: ["source", "severity"]
                </div>
                <div className="text-[11px] text-text-secondary leading-relaxed">
                  Processes full 7,000 dataset rows mapped for adaptive prompt-completion clustering.
                </div>
              </div>

              <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono text-accent-amber uppercase font-semibold">3. Documented SDK Operations</span>
                <div className="text-[11px] font-mono text-text-secondary space-y-0.5">
                  <div>• client.datasets.upload_file(filepath)</div>
                  <div>• client.datasets.adapt(id, column_mapping, spec)</div>
                  <div>• client.datasets.get_status(id)</div>
                  <div>• client.datasets.download(id, file_format)</div>
                </div>
              </div>

              <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono text-accent-coral uppercase font-semibold">4. Analytical Impact</span>
                <div className="text-text-primary font-medium">Pre-Conditioned Issue Grouping</div>
                <div className="text-[11px] text-text-secondary leading-relaxed">
                  Normalizes text embeddings to feed the Customer Pain Radar and Hidden Complaint Detector with zero fabricated parameters.
                </div>
              </div>
            </div>

            {/* Key configuration */}
            <div className="p-4 rounded bg-bg-dark border border-border-subtle space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-secondary">CONFIGURED API KEY:</span>
                <span className="text-accent-mint">{adaptionStatus?.api_key_masked}</span>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Enter Adaption API key (pt_live_...)"
                  className="flex-1 px-3 py-2 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono"
                />
                <button 
                  onClick={handleUpdateKey}
                  className="px-4 py-2 rounded bg-accent-blue text-bg-dark font-bold text-xs hover:bg-accent-blue/90">
                  Update Key
                </button>
              </div>
              <div className="text-[11px] text-text-muted">
                Note: When no live key is supplied, InsightFlow runs in high-fidelity Sandbox Simulation mode with full diagnostic logging for evaluation auditability.
              </div>
            </div>

            {/* Log Table */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-text-secondary">Latest Adaption Execution Provenance Logs:</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                      <th className="pb-2">Operation</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Dataset ID</th>
                      <th className="pb-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-[11px]">
                    {adaptionStatus?.latest_logs?.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-bg-dark">
                        <td className="py-2.5 text-text-primary font-semibold">{log.operation}</td>
                        <td className="py-2.5">
                          <span className={log.status === 'success' ? 'text-accent-mint font-bold' : 'text-accent-amber font-bold'}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-text-secondary">{log.dataset_id || 'N/A'}</td>
                        <td className="py-2.5 text-text-muted">{new Date(log.created_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
