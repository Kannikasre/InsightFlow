import React, { useEffect, useState } from 'react';
import { api } from '../api';

export const IssueTrackerPage: React.FC<{ setTab: (tab: string) => void }> = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ open: 0, in_progress: 0, resolved: 0 });

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Operational Issues');
  const [priority, setPriority] = useState('High');
  const [assigned, setAssigned] = useState('Platform Squad');

  const [detailModal, setDetailModal] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await api.listIssues({
        status: selectedStatus,
        priority: selectedPriority,
        category: selectedCategory
      });
      setIssues(res.items || []);
      setTotal(res.total || 0);
      setStatusCounts(res.status_counts || { open: 0, in_progress: 0, resolved: 0 });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedPriority, selectedCategory]);

  const handleStatusChange = async (issue: any, newStatus: string) => {
    if (issue.status === newStatus) return;
    await api.updateIssue(issue.id, {
      status: newStatus,
      notes: `Status transitioned to ${newStatus}.`
    });
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    await api.deleteIssue(id);
    loadData();
  };

  const inspectDetail = async (issue: any) => {
    try {
      const data = await api.getIssue(issue.id);
      setDetailModal(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    await api.createIssue({
      title,
      description: desc,
      category: cat,
      priority,
      assigned_to: assigned
    });
    setShowModal(false);
    setTitle('');
    setDesc('');
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="text-xs font-mono text-accent-mint uppercase">EXECUTION & ACCOUNTABILITY</div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Issue Tracker (Feedback-to-Fix)</h1>
          <p className="text-xs text-text-secondary mt-1">Track accountable engineering remediations born directly from customer feedback evidence.</p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 transition-colors">
          + New Engineering Issue
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="editorial-card p-4">
          <div className="text-[10px] font-mono text-text-muted uppercase">TOTAL REMEDIATIONS</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">{total}</div>
        </div>
        <div className="editorial-card p-4 border-accent-coral/30">
          <div className="text-[10px] font-mono text-accent-coral uppercase">OPEN (AWAITING SQUAD)</div>
          <div className="text-2xl font-bold font-mono text-accent-coral mt-1">{statusCounts.open}</div>
        </div>
        <div className="editorial-card p-4 border-accent-amber/30">
          <div className="text-[10px] font-mono text-accent-amber uppercase">IN PROGRESS (ACTIVE SPRINT)</div>
          <div className="text-2xl font-bold font-mono text-accent-amber mt-1">{statusCounts.in_progress}</div>
        </div>
        <div className="editorial-card p-4 border-accent-mint/30">
          <div className="text-[10px] font-mono text-accent-mint uppercase">RESOLVED & VERIFIED</div>
          <div className="text-2xl font-bold font-mono text-accent-mint mt-1">{statusCounts.resolved}</div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="editorial-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
            <option value="All">All Statuses</option>
            <option value="Open">Open Only</option>
            <option value="In Progress">In Progress Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>

          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
            <option value="All">All Categories</option>
            <option value="Fraud and Scam">Fraud and Scam</option>
            <option value="Operational Issues">Operational Issues</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Product Feedback">Product Feedback</option>
          </select>
        </div>

        <div className="text-xs font-mono text-text-secondary">
          Displaying {issues.length} active issues
        </div>
      </div>

      {/* List of Issues */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="editorial-card p-5 space-y-4 hover:border-accent-mint/40 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-text-muted">TASK #{issue.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  issue.priority === 'Critical' ? 'badge-critical' : issue.priority === 'High' ? 'badge-high' : 'badge-medium'
                }`}>
                  {issue.priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-dark border border-border-subtle text-text-secondary">
                  {issue.category}
                </span>
              </div>

              {/* Status Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted mr-1">Status:</span>
                <button 
                  onClick={() => handleStatusChange(issue, 'Open')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border border-border-subtle transition-colors ${
                    issue.status === 'Open' ? 'bg-accent-coral text-bg-dark font-bold' : 'bg-bg-dark text-text-secondary'
                  }`}>
                  Open
                </button>
                <button 
                  onClick={() => handleStatusChange(issue, 'In Progress')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border border-border-subtle transition-colors ${
                    issue.status === 'In Progress' ? 'bg-accent-amber text-bg-dark font-bold' : 'bg-bg-dark text-text-secondary'
                  }`}>
                  In Progress
                </button>
                <button 
                  onClick={() => handleStatusChange(issue, 'Resolved')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border border-border-subtle transition-colors ${
                    issue.status === 'Resolved' ? 'bg-accent-mint text-bg-dark font-bold' : 'bg-bg-dark text-text-secondary'
                  }`}>
                  Resolved
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-text-primary">{issue.title}</h3>
              <div className="text-xs text-text-secondary mt-1 whitespace-pre-line leading-relaxed font-sans">{issue.description}</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs font-mono">
              <div className="flex items-center gap-4 text-text-secondary">
                <span>Assigned: <strong className="text-text-primary">{issue.assigned_to}</strong></span>
                <span>•</span>
                <span>Updated: {new Date(issue.updated_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>Audits: {issue.activities_count} entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => inspectDetail(issue)}
                  className="px-3 py-1 rounded bg-bg-dark border border-border-subtle text-[11px] text-text-primary hover:border-accent-mint">
                  Audit Timeline & Evidence →
                </button>
                <button 
                  onClick={() => handleDelete(issue.id)}
                  className="px-2 py-1 rounded text-accent-coral hover:bg-accent-coral/10 text-[11px]">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="editorial-card w-full max-w-2xl bg-bg-surface p-6 shadow-2xl border-border-subtle max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
              <div>
                <span className="text-xs font-mono text-accent-mint">ISSUE AUDIT LOG #{detailModal.issue?.id}</span>
                <h3 className="text-base font-bold text-text-primary">{detailModal.issue?.title}</h3>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <div className="text-xs font-mono uppercase text-accent-blue mb-2">Audit Log Activity History:</div>
                <div className="space-y-2">
                  {detailModal.activities?.map((act: any, idx: number) => (
                    <div key={idx} className="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-accent-mint font-semibold uppercase">{act.action_type}</span>
                        <span className="text-[10px] font-mono text-text-muted">{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-text-secondary">{act.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {detailModal.evidence && detailModal.evidence.length > 0 && (
                <div>
                  <div className="text-xs font-mono uppercase text-accent-coral mb-2">Linked Customer Feedback Evidence:</div>
                  <div className="space-y-2">
                    {detailModal.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-secondary italic">
                        "{ev.quote_snippet}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border-subtle shrink-0">
              <button onClick={() => setDetailModal(null)} className="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs">
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="editorial-card w-full max-w-lg bg-bg-surface p-6 shadow-2xl border-border-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="text-xs font-mono text-accent-mint uppercase">Create Engineering Issue</span>
              <button onClick={() => setShowModal(false)} className="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">ISSUE TITLE</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement origin validation header on checkout widget"
                  className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">DESCRIPTION & ACTION STEPS</label>
                <textarea 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  placeholder="Actionable steps and implementation plan..."
                  className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">CATEGORY</label>
                  <select 
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                    <option value="Operational Issues">Operational Issues</option>
                    <option value="Fraud and Scam">Fraud and Scam</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Product Feedback">Product Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">PRIORITY</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">ASSIGNED TEAM / OWNER</label>
                <input 
                  type="text" 
                  value={assigned}
                  onChange={(e) => setAssigned(e.target.value)}
                  placeholder="e.g. Platform Reliability Squad"
                  className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-secondary">
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!title.trim()}
                className="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs disabled:opacity-50">
                Create Tracked Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
