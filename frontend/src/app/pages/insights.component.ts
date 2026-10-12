import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="text-xs font-mono text-accent-coral uppercase">DEEP DECISION INTELLIGENCE</div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">AI Insights & Evidence Laboratory</h1>
          <p class="text-xs text-text-secondary mt-1">Investigate customer pain radars, semantic complaint cascades, and verified evidence trails.</p>
        </div>

        <!-- View Mode Navigation Tabs -->
        <div class="flex items-center gap-2 bg-bg-surface p-1 rounded-lg border border-border-subtle text-xs font-mono">
          <button 
            (click)="activeTab = 'radar'" 
            [class.bg-bg-elevated]="activeTab === 'radar'"
            [class.text-accent-mint]="activeTab === 'radar'"
            class="px-3 py-1.5 rounded text-text-secondary hover:text-text-primary transition-colors">
            Pain Radar
          </button>
          <button 
            (click)="activeTab = 'cascade'" 
            [class.bg-bg-elevated]="activeTab === 'cascade'"
            [class.text-accent-mint]="activeTab === 'cascade'"
            class="px-3 py-1.5 rounded text-text-secondary hover:text-text-primary transition-colors">
            Connection Map
          </button>
          <button 
            (click)="activeTab = 'timeline'" 
            [class.bg-bg-elevated]="activeTab === 'timeline'"
            [class.text-accent-mint]="activeTab === 'timeline'"
            class="px-3 py-1.5 rounded text-text-secondary hover:text-text-primary transition-colors">
            What Changed?
          </button>
          <button 
            (click)="activeTab = 'hidden'" 
            [class.bg-bg-elevated]="activeTab === 'hidden'"
            [class.text-accent-mint]="activeTab === 'hidden'"
            class="px-3 py-1.5 rounded text-text-secondary hover:text-text-primary transition-colors">
            Hidden Detector
          </button>
        </div>
      </div>

      <!-- TAB 1: Customer Pain Radar -->
      <div *ngIf="activeTab === 'radar'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div *ngFor="let iss of painRadarIssues" class="editorial-card p-6 space-y-4 hover:border-accent-mint/50 transition-colors">
            <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-bg-dark border border-border-subtle text-text-secondary">
                {{ iss.category }}
              </span>
              <span 
                [class.badge-critical]="iss.severity === 'Critical'"
                [class.badge-high]="iss.severity === 'High'"
                [class.badge-medium]="iss.severity === 'Medium'"
                class="px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                Impact: {{ iss.impact_score }}/100
              </span>
            </div>

            <div>
              <h3 class="text-base font-bold text-text-primary">{{ iss.title }}</h3>
              <p class="text-xs text-text-secondary mt-1.5 leading-relaxed">{{ iss.description }}</p>
            </div>

            <!-- Metrics bar -->
            <div class="grid grid-cols-3 gap-2 py-2 px-3 rounded bg-bg-dark border border-border-subtle text-xs font-mono">
              <div>
                <span class="text-[10px] text-text-muted block">VOLUME</span>
                <span class="font-bold text-text-primary">{{ iss.frequency | number }}</span>
              </div>
              <div>
                <span class="text-[10px] text-accent-coral block">NEGATIVE</span>
                <span class="font-bold text-accent-coral">{{ iss.negative_pct }}%</span>
              </div>
              <div>
                <span class="text-[10px] text-accent-mint block">VELOCITY</span>
                <span class="font-bold text-accent-mint">{{ iss.trend }}</span>
              </div>
            </div>

            <!-- Representative Quote Sample -->
            <div *ngIf="iss.representative_quotes?.length" class="p-3 rounded bg-bg-dark/80 border border-border-subtle text-xs text-text-secondary italic">
              "{{ iss.representative_quotes[0] }}"
            </div>

            <div class="flex items-center justify-between pt-2">
              <button 
                (click)="loadEvidenceExplorer(iss.id)"
                class="text-xs font-mono text-accent-blue hover:underline flex items-center gap-1">
                <span>Inspect Evidence Trail ({{ iss.evidence_count }} items)</span>
                <span>→</span>
              </button>
              <a routerLink="/recommendations" class="px-3 py-1 rounded bg-bg-elevated border border-border-subtle text-xs font-medium hover:border-accent-mint text-text-primary">
                View Fix
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: Complaint Connection Map (Causal Cascades) -->
      <div *ngIf="activeTab === 'cascade'" class="space-y-6">
        <div class="editorial-card p-6 border-accent-blue/30 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 class="text-base font-bold text-text-primary">Systemic Cause-and-Effect Cascade</h3>
              <p class="text-xs text-text-secondary mt-1">Cross-category telemetry mapping how operational latency cascades into fraud claims and user churn.</p>
            </div>
            <span class="text-xs font-mono text-accent-blue">Hypothesis Graph</span>
          </div>

          <!-- Hypothesis Statement -->
          <div class="p-4 rounded bg-accent-blue/10 border border-accent-blue/30 text-xs text-text-primary leading-relaxed font-sans">
            {{ connectionData?.hypothesis_summary }}
          </div>

          <!-- Flow Chart Visualizer -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
            <div *ngFor="let node of connectionData?.nodes; let idx = index" class="p-4 rounded bg-bg-dark border border-border-subtle space-y-2 relative">
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-text-muted">STEP 0{{ idx + 1 }}</span>
                <span [class.text-accent-coral]="node.severity === 'Critical'" [class.text-accent-amber]="node.severity === 'High'" class="font-bold">
                  {{ node.severity }}
                </span>
              </div>
              <div class="font-bold text-xs text-text-primary">{{ node.label }}</div>
              <div class="text-[11px] font-mono text-accent-mint">Impact: {{ node.impact }}/100</div>
              <div class="text-[10px] text-text-secondary">{{ node.category }}</div>
            </div>
          </div>

          <!-- Edges List -->
          <div class="pt-4 border-t border-border-subtle space-y-2">
            <div class="text-xs font-mono text-text-secondary uppercase">Verified Causal Links:</div>
            <div *ngFor="let edge of connectionData?.edges" class="p-2.5 rounded bg-bg-dark border border-border-subtle text-xs flex items-center justify-between font-mono">
              <div class="flex items-center gap-3">
                <span class="text-accent-coral">{{ edge.from }}</span>
                <span class="text-text-muted">───────►</span>
                <span class="text-accent-blue">{{ edge.to }}</span>
              </div>
              <span class="text-text-secondary italic">{{ edge.label }} (Confidence: {{ (edge.strength * 100) | number:'1.0-0' }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: What Changed? Timeline -->
      <div *ngIf="activeTab === 'timeline'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let p of timelineData?.periods; let i = index" class="editorial-card p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span class="text-xs font-mono uppercase text-accent-mint">{{ p.period }}</span>
              <span class="text-[10px] font-mono text-text-muted">Period #{{ i + 1 }}</span>
            </div>

            <div class="space-y-2">
              <div class="text-2xl font-bold font-mono text-text-primary">{{ p.total_volume | number }} Records</div>
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-accent-coral">Negative Dissatisfaction:</span>
                <span class="font-bold text-accent-coral">{{ p.negative_rate }}%</span>
              </div>
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-accent-mint">Positive Praise:</span>
                <span class="font-bold text-accent-mint">{{ p.positive_rate }}%</span>
              </div>
            </div>

            <div class="pt-3 border-t border-border-subtle">
              <div class="text-[10px] font-mono text-text-muted uppercase mb-1">Dominant Ingestion Topic:</div>
              <div class="text-xs font-semibold text-text-primary">{{ p.top_category }}</div>
            </div>
          </div>
        </div>

        <!-- Key Shifts Banner -->
        <div class="editorial-card p-6 space-y-3">
          <h3 class="text-sm font-bold text-text-primary">Key Period-Over-Period Inflection Signals</h3>
          <div class="space-y-2">
            <div *ngFor="let shift of timelineData?.key_shifts" class="p-3 rounded bg-bg-dark border border-border-subtle text-xs flex items-center justify-between">
              <div>
                <span class="font-bold text-accent-coral font-mono mr-2">{{ shift.shift }}</span>
                <span class="text-text-secondary">{{ shift.impact }}</span>
              </div>
              <span class="text-[10px] font-mono text-text-muted">{{ shift.timeframe }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: Hidden Complaint Detector (Differentiator B) -->
      <div *ngIf="activeTab === 'hidden'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let c of hiddenClusters" class="editorial-card p-6 space-y-4 border-accent-amber/30">
            <div class="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span class="text-xs font-mono text-accent-amber font-semibold">{{ c.detected_category }}</span>
              <span class="text-[10px] font-mono text-text-muted">{{ c.affected_volume }} affected</span>
            </div>

            <div>
              <h3 class="text-sm font-bold text-text-primary">{{ c.cluster_title }}</h3>
              <p class="text-[11px] text-text-secondary mt-1">Underlying Root Cause: <strong class="text-text-primary">{{ c.underlying_cause }}</strong></p>
            </div>

            <div class="space-y-2 pt-2 border-t border-border-subtle">
              <div class="text-[10px] font-mono uppercase text-text-muted">Semantic Phrasing Variants:</div>
              <div *ngFor="let phrase of c.variant_phrasings" class="p-2 rounded bg-bg-dark border border-border-subtle text-[11px] text-text-secondary italic">
                "{{ phrase }}"
              </div>
            </div>

            <div class="pt-2 text-right">
              <span class="text-[10px] font-mono text-accent-mint">Cluster Match Confidence: {{ (c.confidence * 100) | number:'1.0-0' }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Insight-to-Evidence Explorer Drawer / Modal (Differentiator A) -->
      <div *ngIf="evidenceData" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="editorial-card w-full max-w-3xl bg-bg-surface p-6 shadow-2xl border-accent-mint/40 max-h-[90vh] flex flex-col space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
            <div>
              <span class="text-[10px] font-mono uppercase text-accent-mint">INSIGHT-TO-EVIDENCE EXPLORER</span>
              <h3 class="text-lg font-bold text-text-primary">{{ evidenceData.issue?.title }}</h3>
            </div>
            <button (click)="evidenceData = null" class="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
          </div>

          <!-- Methodology & Calculation Box -->
          <div class="p-4 rounded bg-bg-dark border border-border-subtle text-xs space-y-2 shrink-0">
            <div class="font-mono text-accent-mint font-semibold">Mathematical Provenance & Impact Score Formula:</div>
            <div class="text-[11px] text-text-secondary font-mono">{{ evidenceData.methodology?.formula }}</div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[10px] font-mono">
              <div class="p-1.5 rounded bg-bg-surface">
                <span class="text-text-muted block">Volume Weight:</span>
                <span class="text-text-primary font-bold">{{ evidenceData.methodology?.factor_breakdown?.volume_contribution }}</span>
              </div>
              <div class="p-1.5 rounded bg-bg-surface">
                <span class="text-text-muted block">Negative Polarity:</span>
                <span class="text-accent-coral font-bold">{{ evidenceData.methodology?.factor_breakdown?.negative_rate_contribution }}</span>
              </div>
              <div class="p-1.5 rounded bg-bg-surface">
                <span class="text-text-muted block">Severity Multiplier:</span>
                <span class="text-accent-amber font-bold">{{ evidenceData.methodology?.factor_breakdown?.severity_weight }}</span>
              </div>
              <div class="p-1.5 rounded bg-bg-surface">
                <span class="text-text-muted block">Velocity Rate:</span>
                <span class="text-accent-mint font-bold">{{ evidenceData.methodology?.factor_breakdown?.velocity_weight }}</span>
              </div>
            </div>
          </div>

          <!-- Evidence Records List (Scrollable) -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div class="text-xs font-mono text-text-secondary uppercase mb-2">Supporting Feedback Entries (Sample Size: {{ evidenceData.evidence_records?.length }}):</div>
            <div *ngFor="let rec of evidenceData.evidence_records" class="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
              <div class="text-text-primary leading-relaxed font-sans italic">"{{ rec.text }}"</div>
              <div class="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1">
                <span>{{ rec.source }} • Severity: {{ rec.severity }} • {{ rec.timestamp | date:'shortDate' }}</span>
                <span class="text-accent-mint">Relevance: {{ (rec.relevance_score * 100) | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end pt-3 border-t border-border-subtle shrink-0">
            <button (click)="evidenceData = null" class="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs">
              Done Reviewing Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InsightsComponent implements OnInit {
  activeTab = 'radar';
  painRadarIssues: any[] = [];
  connectionData: any = null;
  timelineData: any = null;
  hiddenClusters: any[] = [];
  evidenceData: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPainRadar().subscribe(res => this.painRadarIssues = res.issues || []);
    this.api.getConnectionMap().subscribe(res => this.connectionData = res);
    this.api.getTimeline().subscribe(res => this.timelineData = res);
    this.api.getHiddenComplaints().subscribe(res => this.hiddenClusters = res.clusters || []);
  }

  loadEvidenceExplorer(issueId: number) {
    this.api.getEvidenceExplorer(issueId).subscribe(res => {
      this.evidenceData = res;
    });
  }
}
