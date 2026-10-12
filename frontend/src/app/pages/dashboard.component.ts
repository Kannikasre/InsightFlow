import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <!-- Dashboard Header with Live Filter Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <span class="text-accent-mint">● LIVE TELEMETRY</span>
            <span>/</span>
            <span>DATA-DRIVEN DECISION INTELLIGENCE</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">Executive Decision Canvas</h1>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Category Filter -->
          <select 
            [(ngModel)]="selectedCategory" 
            (change)="loadMetrics()"
            class="px-3 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
            <option value="All">All Categories (4)</option>
            <option value="Operational Issues">Operational Issues</option>
            <option value="Fraud and Scam">Fraud and Scam</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Product Feedback">Product Feedback</option>
          </select>

          <!-- Sentiment Filter -->
          <select 
            [(ngModel)]="selectedSentiment" 
            (change)="loadMetrics()"
            class="px-3 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
            <option value="All">All Sentiments</option>
            <option value="Negative">Negative Only</option>
            <option value="Neutral">Neutral</option>
            <option value="Positive">Positive</option>
          </select>

          <!-- Time Horizon Filter -->
          <select 
            [(ngModel)]="selectedDays" 
            (change)="loadMetrics()"
            class="px-3 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
            <option [ngValue]="null">All History (90 Days)</option>
            <option [ngValue]="30">Last 30 Days</option>
            <option [ngValue]="14">Last 14 Days</option>
            <option [ngValue]="7">Last 7 Days</option>
          </select>

          <button 
            (click)="resetFilters()" 
            class="px-2.5 py-1.5 rounded bg-bg-dark border border-border-subtle text-[11px] font-mono text-text-muted hover:text-text-primary hover:border-text-secondary transition-colors">
            Reset
          </button>
        </div>
      </div>

      <!-- Compact Metric Strip -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="editorial-card p-4">
          <div class="text-[11px] font-mono uppercase text-text-secondary">Total Ingested</div>
          <div class="text-2xl font-bold font-mono text-text-primary tabular-nums mt-1">
            {{ (metrics?.total_records || 0) | number }}
          </div>
          <div class="text-[10px] text-text-muted mt-1">Validated feedback records</div>
        </div>

        <div class="editorial-card p-4">
          <div class="text-[11px] font-mono uppercase text-accent-coral">Negative Dissatisfaction</div>
          <div class="text-2xl font-bold font-mono text-accent-coral tabular-nums mt-1">
            {{ metrics?.sentiment_percentages?.negative || 0 }}%
          </div>
          <div class="text-[10px] text-text-secondary mt-1">
            {{ (metrics?.sentiment_summary?.negative || 0) | number }} critical entries
          </div>
        </div>

        <div class="editorial-card p-4">
          <div class="text-[11px] font-mono uppercase text-accent-mint">Positive Sentiment</div>
          <div class="text-2xl font-bold font-mono text-accent-mint tabular-nums mt-1">
            {{ metrics?.sentiment_percentages?.positive || 0 }}%
          </div>
          <div class="text-[10px] text-text-secondary mt-1">
            {{ (metrics?.sentiment_summary?.positive || 0) | number }} promoter reviews
          </div>
        </div>

        <div class="editorial-card p-4">
          <div class="text-[11px] font-mono uppercase text-accent-amber">Customer Impact Index</div>
          <div class="text-2xl font-bold font-mono text-accent-amber tabular-nums mt-1">
            {{ metrics?.impact_index || 0 }}<span class="text-xs text-text-secondary font-normal">/100</span>
          </div>
          <div class="text-[10px] text-text-secondary mt-1">Weighted severity index</div>
        </div>

        <div class="editorial-card p-4">
          <div class="text-[11px] font-mono uppercase text-accent-blue">Adaption Pipeline</div>
          <div class="text-2xl font-bold font-mono text-accent-blue mt-1">Active</div>
          <div class="text-[10px] text-text-secondary mt-1">Adaptive Data optimization</div>
        </div>
      </div>

      <!-- Dominant Analytical Insight Banner (Editorial Asymmetric Layout) -->
      <div class="editorial-card p-6 border-accent-coral/30 bg-gradient-to-r from-bg-surface via-bg-surface to-accent-coral/5 relative overflow-hidden">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-2 max-w-3xl">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-accent-coral animate-ping"></span>
              <span class="text-xs font-mono uppercase tracking-wider text-accent-coral font-semibold">Priority #1 Action Required</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-dark border border-accent-coral/40 text-accent-coral">Impact Score 94.2/100</span>
            </div>
            <h2 class="text-xl font-bold text-text-primary">
              Severe Fraud & Phishing Impersonations Surge (+28.5% this month)
            </h2>
            <p class="text-xs text-text-secondary leading-relaxed">
              Third-party affiliate checkout widgets lack strict cryptographic origin validation. Spoofed payment iframes inject unauthorized repeat debit claims, driving immediate bank disputes and critical CSAT degradation.
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <a routerLink="/insights" class="px-4 py-2.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary hover:border-accent-mint font-medium transition-colors">
              Explore Evidence Trail (1,755 Records) →
            </a>
            <a routerLink="/recommendations" class="px-4 py-2.5 rounded bg-accent-mint text-bg-dark text-xs font-bold hover:bg-accent-mint/90 transition-colors">
              View Recommended Fix
            </a>
          </div>
        </div>
      </div>

      <!-- Analytical Canvas: Two Columns (Charts & Trends) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Temporal Sentiment & Volume Trend Chart -->
        <div class="lg:col-span-8 editorial-card p-5">
          <div class="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
            <div>
              <h3 class="text-sm font-bold text-text-primary">Sentiment Velocity & Weekly Volume</h3>
              <div class="text-[11px] text-text-secondary">12-Week period-over-period tracking across active filters</div>
            </div>
            <span class="text-xs font-mono text-accent-mint">Apache ECharts Engine</span>
          </div>
          <div #trendChartContainer style="width: 100%; height: 300px;"></div>
        </div>

        <!-- Category Distribution Chart -->
        <div class="lg:col-span-4 editorial-card p-5">
          <div class="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
            <div>
              <h3 class="text-sm font-bold text-text-primary">Category Composition</h3>
              <div class="text-[11px] text-text-secondary">Feedback volume by domain</div>
            </div>
            <span class="text-xs font-mono text-text-muted">Breakdown</span>
          </div>
          <div #categoryChartContainer style="width: 100%; height: 300px;"></div>
        </div>
      </div>

      <!-- Bottom Split: Highest Priority Issues & Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Highest Priority Issues Table -->
        <div class="lg:col-span-8 editorial-card p-5">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
            <h3 class="text-sm font-bold text-text-primary">Customer Pain Radar (Top Prioritized Issues)</h3>
            <a routerLink="/insights" class="text-xs font-mono text-accent-mint hover:underline">Full Pain Radar →</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-border-subtle text-[10px] font-mono text-text-secondary uppercase">
                  <th class="pb-2.5">Priority Issue</th>
                  <th class="pb-2.5">Category</th>
                  <th class="pb-2.5">Impact Score</th>
                  <th class="pb-2.5">Dissatisfaction</th>
                  <th class="pb-2.5">Velocity</th>
                  <th class="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr *ngFor="let iss of metrics?.top_issues" class="hover:bg-bg-elevated/50 transition-colors">
                  <td class="py-3 font-medium text-text-primary pr-3">
                    <div class="font-semibold">{{ iss.title }}</div>
                    <div class="text-[11px] text-text-secondary truncate max-w-xs">{{ iss.description }}</div>
                  </td>
                  <td class="py-3 font-mono text-text-secondary pr-2">{{ iss.category }}</td>
                  <td class="py-3 font-mono font-bold text-accent-coral">
                    {{ iss.impact_score }}/100
                  </td>
                  <td class="py-3 font-mono text-accent-amber">
                    {{ iss.negative_pct }}%
                  </td>
                  <td class="py-3 font-mono text-accent-mint">
                    {{ iss.trend }}
                  </td>
                  <td class="py-3 text-right">
                    <a routerLink="/insights" class="px-2 py-1 rounded bg-bg-dark border border-border-subtle text-[11px] hover:border-accent-mint text-text-primary">
                      Evidence
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Analysis Activity & Audit Log -->
        <div class="lg:col-span-4 editorial-card p-5 space-y-4">
          <div class="pb-3 border-b border-border-subtle flex items-center justify-between">
            <h3 class="text-sm font-bold text-text-primary">Activity Stream</h3>
            <span class="text-[11px] font-mono text-accent-blue">Real-Time</span>
          </div>

          <div class="space-y-3">
            <div *ngFor="let act of metrics?.recent_activity" class="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-medium text-text-primary">{{ act.title }}</span>
                <span class="text-[10px] font-mono text-accent-mint px-1.5 py-0.5 rounded bg-bg-surface">{{ act.badge }}</span>
              </div>
              <div class="text-[10px] font-mono text-text-muted">{{ act.time | date:'medium' }}</div>
            </div>

            <div *ngIf="!metrics?.recent_activity?.length" class="text-xs text-text-secondary text-center py-6">
              No recent activity recorded yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('trendChartContainer') trendChartRef!: ElementRef;
  @ViewChild('categoryChartContainer') categoryChartRef!: ElementRef;

  metrics: any = null;
  selectedCategory = 'All';
  selectedSentiment = 'All';
  selectedDays: number | null = null;

  private trendChart: echarts.ECharts | null = null;
  private categoryChart: echarts.ECharts | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMetrics();
  }

  ngAfterViewInit() {
    window.addEventListener('resize', () => {
      this.trendChart?.resize();
      this.categoryChart?.resize();
    });
  }

  loadMetrics() {
    this.api.getDashboardMetrics({
      category: this.selectedCategory !== 'All' ? this.selectedCategory : undefined,
      sentiment: this.selectedSentiment !== 'All' ? this.selectedSentiment : undefined,
      days: this.selectedDays || undefined
    }).subscribe({
      next: (data) => {
        this.metrics = data;
        setTimeout(() => this.renderCharts(), 50);
      }
    });
  }

  resetFilters() {
    this.selectedCategory = 'All';
    this.selectedSentiment = 'All';
    this.selectedDays = null;
    this.loadMetrics();
  }

  renderCharts() {
    if (!this.metrics) return;

    // 1. Trend Chart
    if (this.trendChartRef?.nativeElement) {
      if (!this.trendChart) {
        this.trendChart = echarts.init(this.trendChartRef.nativeElement, 'dark');
      }

      const trends = this.metrics.temporal_trends || [];
      const periods = trends.map((t: any) => t.period);
      const negData = trends.map((t: any) => t.negative);
      const posData = trends.map((t: any) => t.positive);
      const neuData = trends.map((t: any) => t.neutral);

      this.trendChart.setOption({
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
          data: periods,
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
            data: negData,
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
            data: posData,
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
            data: neuData,
            itemStyle: { color: '#78A9FF' }
          }
        ]
      });
    }

    // 2. Category Pie Chart
    if (this.categoryChartRef?.nativeElement) {
      if (!this.categoryChart) {
        this.categoryChart = echarts.init(this.categoryChartRef.nativeElement, 'dark');
      }

      const catDist = this.metrics.category_distribution || [];
      const pieData = catDist.map((c: any) => ({
        name: c.category,
        value: c.total
      }));

      this.categoryChart.setOption({
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
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#0B0D12',
              borderWidth: 2
            },
            label: { show: false },
            emphasis: {
              label: {
                show: true,
                fontSize: 11,
                fontWeight: 'bold',
                color: '#F1F4F8'
              }
            },
            data: pieData
          }
        ]
      });
    }
  }
}
