import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-feedback-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="text-xs font-mono text-accent-mint uppercase">DATA INVENTORY & PROVENANCE</div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">Customer Feedback Explorer</h1>
          <p class="text-xs text-text-secondary mt-1">Browse, search, investigate, and audit {{ totalCount | number }} ingested feedback entries.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            (click)="openSubmitModal()" 
            class="px-4 py-2 rounded bg-accent-mint text-bg-dark font-semibold text-xs hover:bg-accent-mint/90 transition-colors flex items-center gap-1.5">
            <span>+</span>
            <span>Submit Manual Feedback</span>
          </button>
          <a routerLink="/import" class="px-4 py-2 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary hover:bg-bg-elevated transition-colors">
            Import CSV Batch →
          </a>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="editorial-card p-4 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- Search Input -->
          <div class="md:col-span-5 relative">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="onFilterChange()"
              placeholder="Search feedback text, errors, or customer phrases..."
              class="w-full px-3.5 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
          </div>

          <!-- Category Filter -->
          <div class="md:col-span-2">
            <select 
              [(ngModel)]="selectedCategory" 
              (change)="onFilterChange()"
              class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
              <option value="">All Categories</option>
              <option value="Operational Issues">Operational Issues</option>
              <option value="Fraud and Scam">Fraud and Scam</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Product Feedback">Product Feedback</option>
            </select>
          </div>

          <!-- Sentiment Filter -->
          <div class="md:col-span-2">
            <select 
              [(ngModel)]="selectedSentiment" 
              (change)="onFilterChange()"
              class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
              <option value="">All Sentiments</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
              <option value="Positive">Positive</option>
            </select>
          </div>

          <!-- Severity Filter -->
          <div class="md:col-span-2">
            <select 
              [(ngModel)]="selectedSeverity" 
              (change)="onFilterChange()"
              class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <!-- Reset Button -->
          <div class="md:col-span-1">
            <button 
              (click)="resetFilters()" 
              class="w-full py-2 rounded bg-bg-surface border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary">
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Feedback Records Table -->
      <div class="editorial-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-border-subtle bg-bg-surface/90 text-[10px] font-mono text-text-secondary uppercase">
                <th class="py-3 px-4 w-16">ID</th>
                <th class="py-3 px-4">Original Feedback Text</th>
                <th class="py-3 px-4 w-36">Category</th>
                <th class="py-3 px-4 w-28">Sentiment</th>
                <th class="py-3 px-4 w-24">Severity</th>
                <th class="py-3 px-4 w-32">Source Channel</th>
                <th class="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr *ngFor="let fb of items" class="hover:bg-bg-elevated/40 transition-colors cursor-pointer" (click)="openDetail(fb)">
                <td class="py-3 px-4 font-mono text-text-muted">#{{ fb.id }}</td>
                <td class="py-3 px-4 text-text-primary font-medium pr-6">
                  <div class="line-clamp-2">{{ fb.text }}</div>
                  <div *ngIf="fb.hidden_cluster" class="mt-1 flex items-center gap-1.5">
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-dark border border-accent-amber/30 text-accent-amber">
                      Cluster: {{ fb.hidden_cluster }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-text-secondary">{{ fb.category }}</td>
                <td class="py-3 px-4">
                  <span 
                    [class.badge-critical]="fb.sentiment === 'Negative'"
                    [class.badge-low]="fb.sentiment === 'Positive'"
                    [class.badge-medium]="fb.sentiment === 'Neutral'"
                    class="px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                    {{ fb.sentiment }} ({{ fb.sentiment_score }})
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span 
                    [class.text-accent-coral]="fb.severity === 'Critical'"
                    [class.text-accent-amber]="fb.severity === 'High'"
                    [class.text-accent-blue]="fb.severity === 'Medium'"
                    [class.text-accent-mint]="fb.severity === 'Low'"
                    class="font-mono text-[11px] font-semibold">
                    {{ fb.severity }}
                  </span>
                </td>
                <td class="py-3 px-4 font-mono text-text-muted">{{ fb.source }}</td>
                <td class="py-3 px-4 text-right">
                  <button 
                    (click)="openDetail(fb); $event.stopPropagation()"
                    class="px-2 py-1 rounded bg-bg-dark border border-border-subtle text-[11px] hover:border-accent-mint text-text-secondary hover:text-text-primary">
                    Inspect
                  </button>
                </td>
              </tr>

              <tr *ngIf="!loading && items.length === 0">
                <td colspan="7" class="py-12 text-center text-text-secondary text-xs">
                  No customer feedback matched your search criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="p-4 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-text-secondary">
          <div>
            Showing Page {{ currentPage }} of {{ totalPages }} ({{ totalCount | number }} records)
          </div>
          <div class="flex items-center gap-2">
            <button 
              (click)="changePage(currentPage - 1)" 
              [disabled]="currentPage <= 1"
              class="px-3 py-1 rounded bg-bg-dark border border-border-subtle hover:border-text-secondary disabled:opacity-40">
              ← Previous
            </button>
            <button 
              (click)="changePage(currentPage + 1)" 
              [disabled]="currentPage >= totalPages"
              class="px-3 py-1 rounded bg-bg-dark border border-border-subtle hover:border-text-secondary disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- Detail Slide-Over Modal -->
      <div *ngIf="selectedDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="editorial-card w-full max-w-2xl bg-bg-surface p-6 shadow-2xl border-border-subtle space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-accent-mint">FEEDBACK AUDIT RECORD #{{ selectedDetail.id }}</span>
            </div>
            <button (click)="selectedDetail = null" class="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
          </div>

          <div class="p-4 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary leading-relaxed font-sans">
            "{{ selectedDetail.text }}"
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div class="p-2.5 rounded bg-bg-elevated border border-border-subtle">
              <div class="text-[10px] text-text-muted">CATEGORY</div>
              <div class="text-text-primary font-semibold mt-0.5">{{ selectedDetail.category }}</div>
            </div>
            <div class="p-2.5 rounded bg-bg-elevated border border-border-subtle">
              <div class="text-[10px] text-text-muted">SENTIMENT</div>
              <div class="text-accent-coral font-semibold mt-0.5">{{ selectedDetail.sentiment }} ({{ selectedDetail.sentiment_score }})</div>
            </div>
            <div class="p-2.5 rounded bg-bg-elevated border border-border-subtle">
              <div class="text-[10px] text-text-muted">SEVERITY</div>
              <div class="text-accent-amber font-semibold mt-0.5">{{ selectedDetail.severity }}</div>
            </div>
            <div class="p-2.5 rounded bg-bg-elevated border border-border-subtle">
              <div class="text-[10px] text-text-muted">SOURCE</div>
              <div class="text-text-primary font-semibold mt-0.5">{{ selectedDetail.source }}</div>
            </div>
          </div>

          <div *ngIf="selectedDetail.hidden_cluster" class="p-3 rounded bg-accent-amber/5 border border-accent-amber/20 text-xs">
            <span class="font-mono text-accent-amber text-[10px] block">HIDDEN COMPLAINT DETECTOR PATTERN:</span>
            <span class="text-text-primary mt-1 block">{{ selectedDetail.hidden_cluster }}</span>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-border-subtle">
            <button 
              (click)="deleteFeedback(selectedDetail.id)"
              class="px-3 py-1.5 rounded bg-accent-coral/10 border border-accent-coral/30 text-accent-coral text-xs font-mono hover:bg-accent-coral/20">
              Delete Record
            </button>
            <button 
              (click)="selectedDetail = null" 
              class="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs">
              Done
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Manual Feedback Modal -->
      <div *ngIf="showSubmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="editorial-card w-full max-w-lg bg-bg-surface p-6 shadow-2xl border-border-subtle space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span class="text-xs font-mono text-accent-mint uppercase">Add Single Customer Entry</span>
            <button (click)="showSubmitModal = false" class="text-xs font-mono text-text-secondary hover:text-text-primary">✕ Close</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-mono text-text-secondary mb-1">FEEDBACK TEXT</label>
              <textarea 
                [(ngModel)]="newFeedbackText"
                rows="4"
                placeholder="Enter customer review or support statement..."
                class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-sans"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-mono text-text-secondary mb-1">CATEGORY</label>
                <select 
                  [(ngModel)]="newFeedbackCategory"
                  class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                  <option value="Operational Issues">Operational Issues</option>
                  <option value="Fraud and Scam">Fraud and Scam</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Product Feedback">Product Feedback</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-mono text-text-secondary mb-1">SOURCE CHANNEL</label>
                <select 
                  [(ngModel)]="newFeedbackSource"
                  class="w-full px-3 py-2 rounded bg-bg-dark border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint">
                  <option value="Trustpilot">Trustpilot</option>
                  <option value="App Store">App Store</option>
                  <option value="Customer Support Ticket">Customer Support Ticket</option>
                  <option value="In-App Feedback">In-App Feedback</option>
                  <option value="Post-Purchase Survey">Post-Purchase Survey</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <button 
              (click)="showSubmitModal = false"
              class="px-3 py-1.5 rounded bg-bg-dark border border-border-subtle text-xs text-text-secondary">
              Cancel
            </button>
            <button 
              (click)="submitManualFeedback()"
              [disabled]="!newFeedbackText.trim()"
              class="px-4 py-1.5 rounded bg-accent-mint text-bg-dark font-bold text-xs disabled:opacity-50">
              Analyze & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeedbackExplorerComponent implements OnInit {
  items: any[] = [];
  totalCount = 0;
  currentPage = 1;
  totalPages = 1;
  pageSize = 20;
  loading = false;

  searchTerm = '';
  selectedCategory = '';
  selectedSentiment = '';
  selectedSeverity = '';

  selectedDetail: any = null;
  showSubmitModal = false;

  newFeedbackText = '';
  newFeedbackCategory = 'Operational Issues';
  newFeedbackSource = 'Trustpilot';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadFeedback();
  }

  loadFeedback() {
    this.loading = true;
    this.api.listFeedback({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      category: this.selectedCategory,
      sentiment: this.selectedSentiment,
      severity: this.selectedSeverity
    }).subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.totalCount = res.total || 0;
        this.totalPages = res.total_pages || 1;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadFeedback();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedSentiment = '';
    this.selectedSeverity = '';
    this.onFilterChange();
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadFeedback();
  }

  openDetail(fb: any) {
    this.selectedDetail = fb;
  }

  deleteFeedback(id: number) {
    if (!confirm('Are you sure you want to delete this customer feedback record?')) return;
    this.api.deleteFeedback(id).subscribe({
      next: () => {
        this.selectedDetail = null;
        this.loadFeedback();
      }
    });
  }

  openSubmitModal() {
    this.newFeedbackText = '';
    this.showSubmitModal = true;
  }

  submitManualFeedback() {
    if (!this.newFeedbackText.trim()) return;
    this.api.createFeedback({
      text: this.newFeedbackText,
      category: this.newFeedbackCategory,
      source: this.newFeedbackSource
    }).subscribe({
      next: () => {
        this.showSubmitModal = false;
        this.loadFeedback();
      }
    });
  }
}
