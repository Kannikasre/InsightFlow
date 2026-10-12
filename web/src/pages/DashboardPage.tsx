import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts';
import { api } from '../api';

export const DashboardPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [selectedDays, setSelectedDays] = useState<number | null>(null);

  const trendChartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const data = await api.getDashboardMetrics({
        category: selectedCategory,
        sentiment: selectedSentiment,
        days: selectedDays
      });
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedSentiment, selectedDays]);

  useEffect(() => {
    if (!metrics) return;

    // Trend chart
    let trendChart: echarts.ECharts | null = null;
    if (trendChartRef.current) {
      trendChart = echarts.init(trendChartRef.current, 'dark');
      const trends = metrics.temporal_trends || [];
      trendChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#131720',
          borderColor: '#293140',
          textStyle: { color: '#F1F4F8', fontSize: 11 }
        },
        legend: {
          data: ['Negative Complaints', 'Positive Reviews', 'Neutral Feedback'],
          textStyle: { color: '#9AA5B5', fontSize: 11 },
          top: 0
        },
        grid: { left: '3%', right: '3%', bottom: '8%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: trends.map((t: any) => t.period),
          axisLine: { lineStyle: { color: '#293140' } },
          axisLabel: { color: '#9AA5B5', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#1e2533' } },
          axisLabel: { color: '#9AA5B5', fontSize: 10 }
        },
        series: [
          {
            name: 'Negative Complaints',
            type: 'line',
            smooth: true,
            data: trends.map((t: any) => t.negative),
            itemStyle: { color: '#FF737D' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,115,125,0.3)' },
                { offset: 1, color: 'rgba(255,115,125,0.0)' }
              ])
            }
          },
          {
            name: 'Positive Reviews',
            type: 'line',
            smooth: true,
            data: trends.map((t: any) => t.positive),
            itemStyle: { color: '#71E3BD' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(113,227,189,0.2)' },
                { offset: 1, color: 'rgba(113,227,189,0.0)' }
              ])
            }
          },
          {
            name: 'Neutral Feedback',
            type: 'line',
            smooth: true,
            data: trends.map((t: any) => t.neutral),
            itemStyle: { color: '#78A9FF' }
          }
        ]
      });
    }

    // Category chart
    let catChart: echarts.ECharts | null = null;
    if (categoryChartRef.current) {
      catChart = echarts.init(categoryChartRef.current, 'dark');
      const catDist = metrics.category_distribution || [];
      catChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#131720',
          borderColor: '#293140',
          textStyle: { color: '#F1F4F8', fontSize: 11 }
        },
        color: ['#FF737D', '#F3BC66', '#71E3BD', '#78A9FF'],
        series: [
          {
            name: 'Category Share',
            type: 'pie',
            radius: ['45%', '70%'],
            itemStyle: {
              borderRadius: 4,
              borderColor: '#0B0D12',
              borderWidth: 2
            },
            data: catDist.map((c: any) => ({ name: c.category, value: c.total }))
          }
        ]
      });
    }

    const resize = () => {
      trendChart?.resize();
      catChart?.resize();
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      trendChart?.dispose();
      catChart?.dispose();
    };
  }, [metrics]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <span className="text-accent-mint">● LIVE TELEMETRY</span>
            <span>/</span>
            <span>DATA-DRIVEN DECISION INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Executive Decision Canvas</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
            <option value="All">All Categories (4)</option>
            <option value="Operational Issues">Operational Issues</option>
            <option value="Fraud and Scam">Fraud and Scam</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Product Feedback">Product Feedback</option>
          </select>

          <select 
            value={selectedSentiment} 
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="px-3 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
            <option value="All">All Sentiments</option>
            <option value="Negative">Negative Only</option>
            <option value="Neutral">Neutral</option>
            <option value="Positive">Positive</option>
          </select>

          <select 
            value={selectedDays || ''} 
            onChange={(e) => setSelectedDays(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
            <option value="">All History (90 Days)</option>
            <option value="30">Last 30 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="7">Last 7 Days</option>
          </select>

          <button 
            onClick={() => { setSelectedCategory('All'); setSelectedSentiment('All'); setSelectedDays(null); }}
            className="px-2.5 py-1.5 rounded bg-bg-dark border border-border-subtle text-[11px] font-mono text-text-muted hover:text-text-primary">
            Reset
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="editorial-card p-4">
          <div className="text-[11px] font-mono uppercase text-text-secondary">Total Ingested</div>
          <div className="text-2xl font-bold font-mono text-text-primary tabular-nums mt-1">
            {metrics?.total_records?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-text-muted mt-1">Validated feedback records</div>
        </div>

        <div className="editorial-card p-4">
          <div className="text-[11px] font-mono uppercase text-accent-coral">Negative Dissatisfaction</div>
          <div className="text-2xl font-bold font-mono text-accent-coral tabular-nums mt-1">
            {metrics?.sentiment_percentages?.negative || 0}%
          </div>
          <div className="text-[10px] text-text-secondary mt-1">
            {metrics?.sentiment_summary?.negative?.toLocaleString() || 0} critical entries
          </div>
        </div>

        <div className="editorial-card p-4">
          <div className="text-[11px] font-mono uppercase text-accent-mint">Positive Sentiment</div>
          <div className="text-2xl font-bold font-mono text-accent-mint tabular-nums mt-1">
            {metrics?.sentiment_percentages?.positive || 0}%
          </div>
          <div className="text-[10px] text-text-secondary mt-1">
            {metrics?.sentiment_summary?.positive?.toLocaleString() || 0} promoter reviews
          </div>
        </div>

        <div className="editorial-card p-4">
          <div className="text-[11px] font-mono uppercase text-accent-amber">Customer Impact Index</div>
          <div className="text-2xl font-bold font-mono text-accent-amber tabular-nums mt-1">
            {metrics?.impact_index || 0}<span className="text-xs text-text-secondary font-normal">/100</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Weighted severity index</div>
        </div>

        <div className="editorial-card p-4">
          <div className="text-[11px] font-mono uppercase text-accent-blue">Adaption Pipeline</div>
          <div className="text-2xl font-bold font-mono text-accent-blue mt-1">Active</div>
          <div className="text-[10px] text-text-secondary mt-1">Adaptive Data optimization</div>
        </div>
      </div>

      {/* Priority Insight Banner */}
      <div className="editorial-card p-6 border-accent-coral/30 bg-gradient-to-r from-bg-surface via-bg-surface to-accent-coral/5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-coral animate-ping"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-accent-coral font-semibold">Priority #1 Action Required</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-dark border border-accent-coral/40 text-accent-coral">Impact Score 94.2/100</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              Severe Fraud & Phishing Impersonations Surge (+28.5% this month)
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Third-party affiliate checkout widgets lack strict cryptographic origin validation. Spoofed payment iframes inject unauthorized repeat debit claims, driving immediate bank disputes and critical CSAT degradation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setTab('insights')} className="px-4 py-2.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary hover:border-accent-mint font-medium transition-colors">
              Explore Evidence Trail (1,755 Records) →
            </button>
            <button onClick={() => setTab('recommendations')} className="px-4 py-2.5 rounded bg-accent-mint text-bg-dark text-xs font-bold hover:bg-accent-mint/90 transition-colors">
              View Recommended Fix
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 editorial-card p-5">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Sentiment Velocity & Weekly Volume</h3>
              <div className="text-[11px] text-text-secondary">12-Week period-over-period tracking across active filters</div>
            </div>
            <span className="text-xs font-mono text-accent-mint">Apache ECharts Engine</span>
          </div>
          <div ref={trendChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        <div className="lg:col-span-4 editorial-card p-5">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Category Composition</h3>
              <div className="text-[11px] text-text-secondary">Feedback volume by domain</div>
            </div>
            <span className="text-xs font-mono text-text-muted">Breakdown</span>
          </div>
          <div ref={categoryChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>

      {/* Bottom Table & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 editorial-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">Customer Pain Radar (Top Prioritized Issues)</h3>
            <button onClick={() => setTab('insights')} className="text-xs font-mono text-accent-mint hover:underline">Full Pain Radar →</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] font-mono text-text-secondary uppercase">
                  <th className="pb-2.5">Priority Issue</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Impact Score</th>
                  <th className="pb-2.5">Dissatisfaction</th>
                  <th className="pb-2.5">Velocity</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {metrics?.top_issues?.map((iss: any) => (
                  <tr key={iss.id} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="py-3 font-medium text-text-primary pr-3">
                      <div className="font-semibold">{iss.title}</div>
                      <div className="text-[11px] text-text-secondary truncate max-w-xs">{iss.description}</div>
                    </td>
                    <td className="py-3 font-mono text-text-secondary pr-2">{iss.category}</td>
                    <td className="py-3 font-mono font-bold text-accent-coral">{iss.impact_score}/100</td>
                    <td className="py-3 font-mono text-accent-amber">{iss.negative_pct}%</td>
                    <td className="py-3 font-mono text-accent-mint">{iss.trend}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => setTab('insights')} className="px-2 py-1 rounded bg-bg-dark border border-border-subtle text-[11px] hover:border-accent-mint text-text-primary">
                        Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 editorial-card p-5 space-y-4">
          <div className="pb-3 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Activity Stream</h3>
            <span className="text-[11px] font-mono text-accent-blue">Real-Time</span>
          </div>

          <div className="space-y-3">
            {metrics?.recent_activity?.map((act: any, idx: number) => (
              <div key={idx} className="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">{act.title}</span>
                  <span className="text-[10px] font-mono text-accent-mint px-1.5 py-0.5 rounded bg-bg-surface">{act.badge}</span>
                </div>
                <div className="text-[10px] font-mono text-text-muted">{new Date(act.time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
