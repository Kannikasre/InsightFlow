import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="text-xs font-mono text-accent-amber uppercase">STRATEGIC DECISION INTELLIGENCE</div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">Actionable Recommendations</h1>
          <p class="text-xs text-text-secondary mt-1">Specific, evidence-supported engineering interventions ranked by transparent Customer Impact Scores.</p>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/issues" class="px-4 py-2 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary hover:bg-bg-elevated transition-colors">
            View Issue Tracker →
          </a>
        </div>
      </div>

      <!-- Priority Calculation Formula Box -->
      <div class="editorial-card p-4 border-border-subtle bg-bg-surface/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber font-mono font-bold text-xs">
            CIS
          </span>
          <div>
            <div class="text-xs font-bold text-text-primary">Transparent Customer Impact Score (0–100) Formulation</div>
            <div class="text-[11px] font-mono text-text-secondary mt-0.5">
              Impact = Volume(30%) + Negative Polarity(30%) + Severity Factor(25%) + Velocity Trend(15%)
            </div>
          </div>
        </div>
        <div class="text-xs font-mono text-text-muted">
          All recommendations tied to verified customer records
        </div>
      </div>

      <!-- Recommendations List -->
      <div class="space-y-6">
        <div *ngFor="let rec of recommendations; let idx = index" class="editorial-card p-6 space-y-5 hover:border-accent-mint/40 transition-colors">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-text-muted">RECOMMENDATION 0{{ idx + 1 }}</span>
              <span 
                [class.badge-critical]="rec.suggested_priority === 'Critical'"
                [class.badge-high]="rec.suggested_priority === 'High'"
                [class.badge-medium]="rec.suggested_priority === 'Medium'"
                class="px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {{ rec.suggested_priority }} Priority
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-dark border border-border-subtle text-text-secondary">
                {{ rec.category }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-xs font-mono">
              <span class="text-text-muted">Impact Score:</span>
              <span class="font-bold text-accent-coral">{{ rec.impact_score }}/100</span>
              <span class="text-border-subtle">•</span>
              <span class="text-text-muted">{{ rec.evidence_count }} Supporting Evidence</span>
            </div>
          </div>

          <!-- Recommendation Title & Strategy -->
          <div>
            <h3 class="text-lg font-bold text-text-primary">{{ rec.title }}</h3>
            <div class="text-xs text-text-secondary mt-1">
              Target Problem: <strong class="text-text-primary">{{ rec.issue_title }}</strong>
            </div>
          </div>

          <!-- Action Steps & Rationale Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-1.5">
              <span class="text-[10px] font-mono uppercase text-accent-mint font-semibold block">Prescribed Action Steps:</span>
              <div class="text-text-primary leading-relaxed whitespace-pre-line font-mono text-[11px]">{{ rec.action_steps }}</div>
            </div>

            <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-1.5">
              <span class="text-[10px] font-mono uppercase text-accent-blue font-semibold block">Strategic Rationale:</span>
              <div class="text-text-secondary leading-relaxed">{{ rec.rationale }}</div>
            </div>
          </div>

          <!-- Expected Impact & Limitations -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div class="p-3 rounded bg-accent-mint/5 border border-accent-mint/20 space-y-1">
              <span class="text-[10px] font-mono uppercase text-accent-mint font-semibold block">Projected Business Impact:</span>
              <span class="text-text-primary text-[11px]">{{ rec.potential_impact }}</span>
            </div>

            <div class="p-3 rounded bg-accent-amber/5 border border-accent-amber/20 space-y-1">
              <span class="text-[10px] font-mono uppercase text-accent-amber font-semibold block">Documented Limitations & Trade-offs:</span>
              <span class="text-text-secondary text-[11px]">{{ rec.limitations }}</span>
            </div>
          </div>

          <!-- Convert to Tracked Issue Workflow Trigger (Differentiator E) -->
          <div class="flex items-center justify-between pt-3 border-t border-border-subtle">
            <div class="flex items-center gap-2">
              <span *ngIf="rec.has_tracked_issue" class="px-2.5 py-1 rounded bg-accent-mint/10 border border-accent-mint/30 text-accent-mint text-xs font-mono">
                ✓ Tracked in Engineering Pipeline (Issue #{{ rec.tracked_issue_id }})
              </span>
              <span *ngIf="!rec.has_tracked_issue" class="text-xs text-text-muted font-mono">
                Proposed Recommendation • Awaiting Engineering Commitment
              </span>
            </div>

            <div>
              <button 
                *ngIf="!rec.has_tracked_issue"
                (click)="promoteToTrackedIssue(rec)"
                class="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 transition-colors flex items-center gap-1.5">
                <span>⚡ Convert to Tracked Issue (Feedback-to-Fix)</span>
              </button>
              <a 
                *ngIf="rec.has_tracked_issue"
                routerLink="/issues" 
                class="px-3.5 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs font-mono text-text-primary hover:border-accent-mint transition-colors">
                Inspect in Issue Tracker →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecommendationsComponent implements OnInit {
  recommendations: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.api.listRecommendations().subscribe({
      next: (res) => this.recommendations = res.items || []
    });
  }

  promoteToTrackedIssue(rec: any) {
    this.api.convertRecommendationToIssue(rec.id, {
      assigned_to: 'Platform Reliability Squad',
      priority: rec.suggested_priority
    }).subscribe({
      next: () => {
        this.loadRecommendations();
        this.router.navigate(['/issues']);
      },
      error: (err) => alert(err.error?.error || 'Failed to convert to issue')
    });
  }
}
