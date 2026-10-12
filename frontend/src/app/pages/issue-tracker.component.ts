import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-issue-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="text-xs font-mono text-accent-mint uppercase">EXECUTION & ACCOUNTABILITY</div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">Issue Tracker (Feedback-to-Fix)</h1>
          <p class="text-xs text-text-secondary mt-1">Track accountable engineering remediations born directly from customer feedback evidence.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            (click)="showCreateModal = true" 
            class="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 transition-colors">
            + New Engineering Issue
          </button>
        </div>
      </div>

      <!-- Status Metrics Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="editorial-card p-4">
          <div class="text-[10px] font-mono text-text-muted uppercase">TOTAL REMEDIATIONS</div>
          <div class="text-2xl font-bold font-mono text-text-primary mt-1">{{ totalIssues }}</div>
        </div>

        <div class="editorial-card p-4 border-accent-coral/30">
          <div class="text-[10px] font-mono text-accent-coral uppercase">OPEN (AWAITING SQUAD)</div>
          <div class="text-2xl font-bold font-mono text-accent-coral mt-1">{{ statusCounts.open }}</div>
        </div>

        <div class="editorial-card p-4 border-accent-amber/30">
          <div class="text-[10px] font-mono text-accent-amber uppercase">IN PROGRESS (ACTIVE SPRINT)</div>
          <div class="text-2xl font-bold font-mono text-accent-amber mt-1">{{ statusCounts.in_progress }}</div>
        </div>

        <div class="editorial-card p-4 border-accent-mint/30">
          <div class="text-[10px] font-mono text-accent-mint uppercase">RESOLVED & VERIFIED</div>
          <div class="text-2xl font-bold font-mono text-accent-mint mt-1">{{ statusCounts.resolved }}</div>
        </div>
      </div>

      <!-- Filters Strip -->
      <div class="editorial-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="loadIssues()"
            class="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
            <option value="All">All Statuses</option>
            <option value="Open">Open Only</option>
            <option value="In Progress">In Progress Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>

          <select 
            [(ngModel)]="selectedPriority" 
            (change)="loadIssues()"
            class="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select 
            [(ngModel)]="selectedCategory" 
            (change)="loadIssues()"
            class="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
            <option value="All">All Categories</option>
            <option value="Fraud and Scam">Fraud and Scam</option>
            <option value="Operational Issues">Operational Issues</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Product Feedback">Product Feedback</option>
          </select>
        </div>

        <div class="text-xs font-mono text-text-secondary">
          Displaying {{ issues.length }} active issues
        </div>
      </div>

      <!-- Issue Cards List -->
      <div class="space-y-4">
        <div *ngFor="let issue of issues" class="editorial-card p-5 space-y-4 hover:border-accent-mint/40 transition-colors">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-text-muted">TASK #{{ issue.id }}</span>
              <span 
                [class.badge-critical]="issue.priority === 'Critical'"
                [class.badge-high]="issue.priority === 'High'"
                [class.badge-medium]="issue.priority === 'Medium'"
                class="px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {{ issue.priority }} Priority
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-dark border border-border-subtle text-text-secondary">
                {{ issue.category }}
              </span>
            </div>

            <!-- Status Transition Buttons -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-text-muted mr-1">Status:</span>
              <button 
                (click)="updateStatus(issue, 'Open')"
                [class.bg-accent-coral]="issue.status === 'Open'"
                [class.text-bg-dark]="issue.status === 'Open'"
                [class.bg-bg-dark]="issue.status !== 'Open'"
                class="px-2.5 py-1 rounded text-[11px] font-mono border border-border-subtle transition-colors">
                Open
              </button>
              <button 
                (click)="updateStatus(issue, 'In Progress')"
                [class.bg-accent-amber]="issue.status === 'In Progress'"
                [class.text-bg-dark]="issue.status === 'In Progress'"
                [class.bg-bg-dark]="issue.status !== 'In Progress'"
                class="px-2.5 py-1 rounded text-[11px] font-mono border border-border-subtle transition-colors">
                In Progress
              </button>
              <button 
                (click)="updateStatus(issue, 'Resolved')"
                [class.bg-accent-mint]="issue.status === 'Resolved'"
                [class.text-bg-dark]="issue.status === 'Resolved'"
                [class.bg-bg-dark]="issue.status !== 'Resolved'"
                class="px-2.5 py-1 rounded text-[11px] font-mono border border-border-subtle transition-colors">
                Resolved
              </button>
            </div>
          </div>

          <!-- Title and Description -->
          <div>
            <h3 class="text-base font-bold text-text-primary">{{ issue.title }}</h3>
            <div class="text-xs text-text-secondary mt-1 whitespace-pre-line leading-relaxed font-sans">{{ issue.description }}</div>
          </div>

          <!-- Metadata & Assignment -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs font-mono">
            <div class="flex items-center gap-4 text-text-secondary">
              <span>Assigned: <strong class="text-text-primary">{{ issue.assigned_to }}</strong></span>
              <span>•</span>
              <span>Updated: {{ issue.updated_at | date:'short' }}</span>
              <span>•</span>
              <span>Audits: {{ issue.activities_count }} entries</span>
            </div>

            <div class="flex items-center gap-2">
              <button 
                (click)="inspectDetail(issue)"
                class="px-3 py-1 rounded bg-bg-dark border border-border-subtle text-[11px] text-text-primary hover:border-accent-mint">
                Audit Timeline & Evidence →
              </button>
              <button 
                (click)="deleteIssue(issue.id)"
                class="px-2 py-1 rounded text-accent-coral hover:bg-accent-coral/10 text-[11px]">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="issues.length === 0" class="editorial-card p-12 text-center text-text-secondary text-xs">
          No tracked engineering issues match the active filters.
        </div>
      </div>

      <!-- Detail & Audit Timeline Modal -->
      <div *ngIf="selectedIssueDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="editorial-card w-full max-w-2xl bg-bg-surface p-6 shadow-2xl border-border-subtle max-h-[85vh] flex flex-col space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
            <div>
              <span class="text-xs font-mono text-accent-mint">ISSUE AUDIT LOG #{{ selectedIssueDetail.issue?.id }}</span>
              <h3 class="text-base font-bold text-text-primary">{{ selectedIssueDetail.issue?.title }}</h3>
            </div>
            <button (click)="selectedIssueDetail = null" class="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-1">
            <!-- Activity Timeline -->
            <div>
              <div class="text-xs font-mono uppercase text-accent-blue mb-2">Audit Log Activity History:</div>
              <div class="space-y-2">
                <div *ngFor="let act of selectedIssueDetail.activities" class="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-accent-mint font-semibold uppercase">{{ act.action_type }}</span>
                    <span class="text-[10px] font-mono text-text-muted">{{ act.timestamp | date:'medium' }}</span>
                  </div>
                  <div class="text-text-secondary">{{ act.notes }}</div>
                </div>
              </div>
            </div>

            <!-- Linked Evidence Quotes -->
            <div *ngIf="selectedIssueDetail.evidence?.length">
              <div class="text-xs font-mono uppercase text-accent-coral mb-2">Linked Customer Feedback Evidence:</div>
              <div class="space-y-2">
                <div *ngFor="let ev of selectedIssueDetail.evidence" class="p-2.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-secondary italic">
                  "{{ ev.quote_snippet }}"
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end pt-3 border-t border-border-subtle shrink-0">
            <button (click)="selectedIssueDetail = null" class="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs">
              Close Audit
            </button>
          </div>
        </div>
      </div>

      <!-- Create Manual Issue Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="editorial-card w-full max-w-lg bg-bg-surface p-6 shadow-2xl border-border-subtle space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span class="text-xs font-mono text-accent-mint uppercase">Create Engineering Issue</span>
            <button (click)="showCreateModal = false" class="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-mono text-text-secondary mb-1">ISSUE TITLE</label>
              <input 
                type="text" 
                [(ngModel)]="newIssueTitle"
                placeholder="e.g. Implement origin validation header on checkout widget"
                class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans">
            </div>

            <div>
              <label class="block text-xs font-mono text-text-secondary mb-1">DESCRIPTION & ACTION STEPS</label>
              <textarea 
                [(ngModel)]="newIssueDesc"
                rows="4"
                placeholder="Actionable steps and implementation plan..."
                class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-mono text-text-secondary mb-1">CATEGORY</label>
                <select 
                  [(ngModel)]="newIssueCategory"
                  class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                  <option value="Operational Issues">Operational Issues</option>
                  <option value="Fraud and Scam">Fraud and Scam</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Product Feedback">Product Feedback</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-mono text-text-secondary mb-1">PRIORITY</label>
                <select 
                  [(ngModel)]="newIssuePriority"
                  class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-mono text-text-secondary mb-1">ASSIGNED TEAM / OWNER</label>
              <input 
                type="text" 
                [(ngModel)]="newIssueOwner"
                placeholder="e.g. Platform Reliability Squad"
                class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans">
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <button (click)="showCreateModal = false" class="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-secondary">
              Cancel
            </button>
            <button 
              (click)="createIssue()" 
              [disabled]="!newIssueTitle.trim()"
              class="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs disabled:opacity-50">
              Create Tracked Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IssueTrackerComponent implements OnInit {
  issues: any[] = [];
  totalIssues = 0;
  statusCounts = { open: 0, in_progress: 0, resolved: 0 };

  selectedStatus = 'All';
  selectedPriority = 'All';
  selectedCategory = 'All';

  showCreateModal = false;
  newIssueTitle = '';
  newIssueDesc = '';
  newIssueCategory = 'Operational Issues';
  newIssuePriority = 'High';
  newIssueOwner = 'Core Platform Squad';

  selectedIssueDetail: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadIssues();
  }

  loadIssues() {
    this.api.listTrackedIssues({
      status: this.selectedStatus !== 'All' ? this.selectedStatus : undefined,
      priority: this.selectedPriority !== 'All' ? this.selectedPriority : undefined,
      category: this.selectedCategory !== 'All' ? this.selectedCategory : undefined
    }).subscribe({
      next: (res) => {
        this.issues = res.items || [];
        this.totalIssues = res.total || 0;
        this.statusCounts = res.status_counts || { open: 0, in_progress: 0, resolved: 0 };
      }
    });
  }

  updateStatus(issue: any, newStatus: string) {
    if (issue.status === newStatus) return;
    this.api.updateTrackedIssue(issue.id, {
      status: newStatus,
      notes: `Status transitioned to ${newStatus}.`
    }).subscribe({
      next: () => this.loadIssues()
    });
  }

  deleteIssue(id: number) {
    if (!confirm('Are you sure you want to delete this tracked issue?')) return;
    this.api.deleteTrackedIssue(id).subscribe({
      next: () => this.loadIssues()
    });
  }

  inspectDetail(issue: any) {
    this.api.getTrackedIssue(issue.id).subscribe({
      next: (res) => this.selectedIssueDetail = res
    });
  }

  createIssue() {
    if (!this.newIssueTitle.trim()) return;
    this.api.createTrackedIssue({
      title: this.newIssueTitle,
      description: this.newIssueDesc,
      category: this.newIssueCategory,
      priority: this.newIssuePriority,
      assigned_to: this.newIssueOwner
    }).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newIssueTitle = '';
        this.newIssueDesc = '';
        this.loadIssues();
      }
    });
  }
}
