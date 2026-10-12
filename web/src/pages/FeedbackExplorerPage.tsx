import React, { useEffect, useState } from 'react';
import { api } from '../api';

export const FeedbackExplorerPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [severity, setSeverity] = useState('');

  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCat, setNewCat] = useState('Operational Issues');
  const [newSource, setNewSource] = useState('Trustpilot');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.listFeedback({
        page,
        limit: 20,
        search,
        category,
        sentiment,
        severity
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, category, sentiment, severity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback record?')) return;
    await api.deleteFeedback(id);
    setSelectedDetail(null);
    loadData();
  };

  const handleCreate = async () => {
    if (!newText.trim()) return;
    await api.createFeedback({ text: newText, category: newCat, source: newSource });
    setShowModal(false);
    setNewText('');
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="text-xs font-mono text-accent-mint uppercase">DATA INVENTORY & PROVENANCE</div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Customer Feedback Explorer</h1>
          <p className="text-xs text-text-secondary mt-1">Browse, search, investigate, and audit {total.toLocaleString()} ingested feedback entries.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)} 
            className="px-4 py-2 rounded bg-accent-mint text-bg-dark font-semibold text-xs hover:bg-accent-mint/90 transition-colors">
            + Submit Manual Feedback
          </button>
          <button onClick={() => setTab('import')} className="px-4 py-2 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary hover:bg-bg-elevated transition-colors">
            Import CSV Batch →
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="editorial-card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback text, errors, or phrases..."
              className="w-full px-3.5 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint"
            />
          </div>

          <div className="md:col-span-2">
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
              <option value="">All Categories</option>
              <option value="Operational Issues">Operational Issues</option>
              <option value="Fraud and Scam">Fraud and Scam</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Product Feedback">Product Feedback</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select 
              value={sentiment} 
              onChange={(e) => { setSentiment(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
              <option value="">All Sentiments</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
              <option value="Positive">Positive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select 
              value={severity} 
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button 
              type="button"
              onClick={() => { setSearch(''); setCategory(''); setSentiment(''); setSeverity(''); setPage(1); }}
              className="w-full py-2 rounded bg-bg-surface border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary">
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="editorial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-surface/90 text-[10px] font-mono text-text-secondary uppercase">
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4">Original Feedback Text</th>
                <th className="py-3 px-4 w-36">Category</th>
                <th className="py-3 px-4 w-28">Sentiment</th>
                <th className="py-3 px-4 w-24">Severity</th>
                <th className="py-3 px-4 w-32">Source Channel</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-mono text-accent-mint animate-pulse">
                    Filtering and loading customer records...
                  </td>
                </tr>
              )}
              {!loading && items.map((fb) => (
                <tr key={fb.id} className="hover:bg-bg-elevated/40 transition-colors cursor-pointer" onClick={() => setSelectedDetail(fb)}>
                  <td className="py-3 px-4 font-mono text-text-muted">#{fb.id}</td>
                  <td className="py-3 px-4 text-text-primary font-medium pr-6">
                    <div className="line-clamp-2">{fb.text}</div>
                    {fb.hidden_cluster && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-dark border border-accent-amber/30 text-accent-amber">
                          Cluster: {fb.hidden_cluster}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-text-secondary">{fb.category}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      fb.sentiment === 'Negative' ? 'badge-critical' : fb.sentiment === 'Positive' ? 'badge-low' : 'badge-medium'
                    }`}>
                      {fb.sentiment} ({fb.sentiment_score})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] font-semibold">
                    <span className={
                      fb.severity === 'Critical' ? 'text-accent-coral' : fb.severity === 'High' ? 'text-accent-amber' : fb.severity === 'Medium' ? 'text-accent-blue' : 'text-accent-mint'
                    }>
                      {fb.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted">{fb.source}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDetail(fb); }}
                      className="px-2 py-1 rounded bg-bg-dark border border-border-subtle text-[11px] hover:border-accent-mint text-text-secondary hover:text-text-primary">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-text-secondary">
          <div>
            Showing Page {page} of {totalPages} ({total.toLocaleString()} records)
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-bg-dark border border-border-subtle hover:border-text-secondary disabled:opacity-40">
              ← Previous
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-bg-dark border border-border-subtle hover:border-text-secondary disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="editorial-card w-full max-w-2xl bg-bg-surface p-6 shadow-2xl border-border-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="text-xs font-mono text-accent-mint">FEEDBACK RECORD #{selectedDetail.id}</span>
              <button onClick={() => setSelectedDetail(null)} className="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
            </div>

            <div className="p-4 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary leading-relaxed">
              "{selectedDetail.text}"
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-bg-elevated border border-border-subtle">
                <div className="text-[10px] text-text-muted">CATEGORY</div>
                <div className="text-text-primary font-semibold mt-0.5">{selectedDetail.category}</div>
              </div>
              <div className="p-2.5 rounded bg-bg-elevated border border-border-subtle">
                <div className="text-[10px] text-text-muted">SENTIMENT</div>
                <div className="text-accent-coral font-semibold mt-0.5">{selectedDetail.sentiment} ({selectedDetail.sentiment_score})</div>
              </div>
              <div className="p-2.5 rounded bg-bg-elevated border border-border-subtle">
                <div className="text-[10px] text-text-muted">SEVERITY</div>
                <div className="text-accent-amber font-semibold mt-0.5">{selectedDetail.severity}</div>
              </div>
              <div className="p-2.5 rounded bg-bg-elevated border border-border-subtle">
                <div className="text-[10px] text-text-muted">SOURCE</div>
                <div className="text-text-primary font-semibold mt-0.5">{selectedDetail.source}</div>
              </div>
            </div>

            {selectedDetail.hidden_cluster && (
              <div className="p-3 rounded bg-accent-amber/5 border border-accent-amber/20 text-xs">
                <span className="font-mono text-accent-amber text-[10px] block">HIDDEN COMPLAINT DETECTOR PATTERN:</span>
                <span className="text-text-primary mt-1 block">{selectedDetail.hidden_cluster}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <button 
                onClick={() => handleDelete(selectedDetail.id)}
                className="px-3 py-1.5 rounded bg-accent-coral/10 border border-accent-coral/30 text-accent-coral text-xs font-mono hover:bg-accent-coral/20">
                Delete Record
              </button>
              <button 
                onClick={() => setSelectedDetail(null)} 
                className="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="editorial-card w-full max-w-lg bg-bg-surface p-6 shadow-2xl border-border-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="text-xs font-mono text-accent-mint uppercase">Add Single Customer Entry</span>
              <button onClick={() => setShowModal(false)} className="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">FEEDBACK TEXT</label>
                <textarea 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  rows={4}
                  placeholder="Enter customer review or support statement..."
                  className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">CATEGORY</label>
                  <select 
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                    <option value="Operational Issues">Operational Issues</option>
                    <option value="Fraud and Scam">Fraud and Scam</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Product Feedback">Product Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">SOURCE CHANNEL</label>
                  <select 
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                    <option value="Trustpilot">Trustpilot</option>
                    <option value="App Store">App Store</option>
                    <option value="Customer Support Ticket">Customer Support Ticket</option>
                    <option value="In-App Feedback">In-App Feedback</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-secondary">
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newText.trim()}
                className="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs disabled:opacity-50">
                Analyze & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
