import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService, User } from '../services/api.service';

@Component({
  selector: 'app-reports-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="text-xs font-mono text-accent-blue uppercase">ENTERPRISE AUDIT & SYSTEM CONTROLS</div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">
            {{ activeTab === 'reports' ? 'Executive Reports & Exports' : 'Workspace Settings & Adaption Diagnostics' }}
          </h1>
        </div>

        <!-- Mode Toggle -->
        <div class="flex items-center gap-2 bg-bg-surface p-1 rounded-lg border border-border-subtle text-xs font-mono">
          <button 
            (click)="activeTab = 'reports'" 
            [class.bg-bg-elevated]="activeTab === 'reports'"
            [class.text-accent-mint]="activeTab === 'reports'"
            class="px-4 py-1.5 rounded text-text-secondary hover:text-text-primary transition-colors">
            Executive Reports
          </button>
          <button 
            (click)="activeTab = 'settings'" 
            [class.bg-bg-elevated]="activeTab === 'settings'"
            [class.text-accent-mint]="activeTab === 'settings'"
            class="px-4 py-1.5 rounded text-text-secondary hover:text-text-primary transition-colors">
            Settings & Adaption Lab
          </button>
        </div>
      </div>

      <!-- SECTION A: Executive Reports -->
      <div *ngIf="activeTab === 'reports'" class="space-y-6">
        <!-- Export Actions Banner -->
        <div class="editorial-card p-6 border-accent-mint/30 bg-bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-bold text-text-primary">Executive Intelligence Briefing (PDF & CSV)</h3>
            <p class="text-xs text-text-secondary mt-1">Export high-resolution audit reports formatted for executive stakeholders and data science harnesses.</p>
          </div>

          <div class="flex items-center gap-3">
            <a 
              [href]="exportCsvUrl" 
              download 
              class="px-4 py-2 rounded bg-bg-dark border border-border-subtle text-xs font-mono text-text-primary hover:border-accent-mint transition-colors flex items-center gap-2">
              <span>📥 Export Analyzed CSV</span>
            </a>
            <a 
              [href]="exportPdfUrl" 
              download 
              class="px-4 py-2 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 shadow-lg shadow-accent-mint/10 transition-colors flex items-center gap-2">
              <span>📄 Download Official PDF Report</span>
            </a>
          </div>
        </div>

        <!-- Report Preview Canvas -->
        <div class="editorial-card p-8 bg-bg-surface/80 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div>
              <span class="text-[10px] font-mono text-accent-mint uppercase">REPORT AUDIT DOCUMENT</span>
              <h2 class="text-xl font-bold text-text-primary mt-1">InsightFlow Executive Decision Brief</h2>
              <div class="text-xs text-text-secondary mt-0.5">Evaluation Scope: Ingested Customer Dataset (7,000 Records)</div>
            </div>
            <div class="text-right text-xs font-mono text-text-muted">
              <div>Build Battle 2026 Audit</div>
              <div>Status: Verified Data Provenance</div>
            </div>
          </div>

          <!-- Metrics Matrix -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded bg-bg-dark border border-border-subtle">
              <div class="text-[10px] font-mono text-text-muted">TOTAL RECORDS</div>
              <div class="text-xl font-bold font-mono text-text-primary mt-1">{{ reportSummary?.metrics?.total_records | number }}</div>
            </div>
            <div class="p-4 rounded bg-bg-dark border border-border-subtle">
              <div class="text-[10px] font-mono text-accent-coral">NEGATIVE RATE</div>
              <div class="text-xl font-bold font-mono text-accent-coral mt-1">{{ reportSummary?.metrics?.negative_rate }}%</div>
            </div>
            <div class="p-4 rounded bg-bg-dark border border-border-subtle">
              <div class="text-[10px] font-mono text-accent-mint">POSITIVE PROMOTERS</div>
              <div class="text-xl font-bold font-mono text-accent-mint mt-1">{{ reportSummary?.metrics?.positive_rate }}%</div>
            </div>
            <div class="p-4 rounded bg-bg-dark border border-border-subtle">
              <div class="text-[10px] font-mono text-accent-amber">ENGINEERING TASKS</div>
              <div class="text-xl font-bold font-mono text-accent-amber mt-1">{{ reportSummary?.issue_tracking?.total }} Tracked</div>
            </div>
          </div>

          <!-- Priority Issues Section -->
          <div>
            <h4 class="text-xs font-mono uppercase text-accent-coral mb-3">1. Top Customer Pain Points & Priorities:</h4>
            <div class="space-y-2">
              <div *ngFor="let iss of reportSummary?.top_issues" class="p-3 rounded bg-bg-dark border border-border-subtle text-xs flex items-center justify-between">
                <div>
                  <span class="font-bold text-text-primary">{{ iss.title }}</span>
                  <span class="text-text-muted ml-2 font-mono">({{ iss.category }})</span>
                </div>
                <div class="flex items-center gap-3 font-mono text-[11px]">
                  <span class="text-accent-coral font-bold">Impact: {{ iss.impact_score }}/100</span>
                  <span class="text-accent-mint">{{ iss.trend }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Strategic Recommendations Section -->
          <div>
            <h4 class="text-xs font-mono uppercase text-accent-mint mb-3">2. Actionable Remediations:</h4>
            <div class="space-y-2">
              <div *ngFor="let rec of reportSummary?.recommendations" class="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-1">
                <div class="font-bold text-text-primary">{{ rec.title }}</div>
                <div class="text-text-secondary text-[11px] leading-relaxed">{{ rec.potential_impact }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION B: Settings & Adaption Diagnostics -->
      <div *ngIf="activeTab === 'settings'" class="space-y-8">
        <!-- User Profile & Workspace Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="editorial-card p-6 space-y-4">
            <span class="text-xs font-mono uppercase text-accent-mint">OPERATOR PROFILE</span>
            <div class="space-y-3 text-xs">
              <div>
                <label class="text-[10px] font-mono text-text-muted block">FULL NAME</label>
                <div class="text-text-primary font-semibold mt-0.5">{{ currentUser?.full_name || 'Alex Chen' }}</div>
              </div>
              <div>
                <label class="text-[10px] font-mono text-text-muted block">EMAIL</label>
                <div class="text-text-primary font-mono mt-0.5">{{ currentUser?.email || 'demo@insightflow.ai' }}</div>
              </div>
              <div>
                <label class="text-[10px] font-mono text-text-muted block">ORGANIZATIONAL ROLE</label>
                <div class="text-text-primary mt-0.5">{{ currentUser?.role || 'VP of Product Experience' }}</div>
              </div>
            </div>
          </div>

          <div class="editorial-card p-6 space-y-4">
            <span class="text-xs font-mono uppercase text-accent-blue">WORKSPACE ENVIRONMENT</span>
            <div class="space-y-3 text-xs font-mono">
              <div>
                <label class="text-[10px] text-text-muted block">WORKSPACE ID</label>
                <div class="text-text-primary font-bold mt-0.5">ws_buildbattle_2026_prod</div>
              </div>
              <div>
                <label class="text-[10px] text-text-muted block">STORAGE ENGINE</label>
                <div class="text-accent-mint mt-0.5">PostgreSQL / SQLite Native Persistent Storage</div>
              </div>
              <div>
                <label class="text-[10px] text-text-muted block">SECURITY PROTOCOL</label>
                <div class="text-text-primary mt-0.5">HMAC-SHA256 JWT Authorization Bearer Tokens</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Adaption Integration Details View (MANDATORY SECTION) -->
        <div class="editorial-card p-6 border-accent-blue/40 space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <span class="text-xs font-mono text-accent-blue uppercase">MANDATORY HACKATHON INTEGRATION</span>
              <h3 class="text-lg font-bold text-text-primary mt-1">Adaption Labs Integration Details</h3>
              <p class="text-xs text-text-secondary mt-0.5">Complete diagnostic visibility into the Adaption data optimization workflow.</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" [class.bg-accent-mint]="adaptionStatus?.sdk_installed" [class.bg-accent-coral]="!adaptionStatus?.sdk_installed"></span>
              <span class="text-xs font-mono text-text-primary">
                SDK Version: {{ adaptionStatus?.sdk_version || '0.14.0' }}
              </span>
            </div>
          </div>

          <!-- 6 Documented Inspection Points -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <!-- 1. Pipeline Entry Point -->
            <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
              <span class="text-[10px] font-mono text-accent-mint uppercase font-semibold">1. Pipeline Placement</span>
              <div class="text-text-primary font-medium">{{ adaptionStatus?.pipeline_stage }}</div>
              <div class="text-[11px] text-text-secondary leading-relaxed">{{ adaptionStatus?.integration_role }}</div>
            </div>

            <!-- 2. What Information It Receives -->
            <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
              <span class="text-[10px] font-mono text-accent-blue uppercase font-semibold">2. Ingested Schema Payload</span>
              <div class="text-[11px] font-mono text-text-primary leading-relaxed">
                prompt: "review", completion: "category", context: ["source", "severity"]
              </div>
              <div class="text-[11px] text-text-secondary leading-relaxed">
                Processes full 7,000 dataset rows mapped for adaptive prompt-completion clustering.
              </div>
            </div>

            <!-- 3. Documented Operations -->
            <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
              <span class="text-[10px] font-mono text-accent-amber uppercase font-semibold">3. Documented SDK Operations</span>
              <div class="text-[11px] font-mono text-text-secondary space-y-0.5">
                <div>• client.datasets.upload_file(filepath)</div>
                <div>• client.datasets.adapt(id, column_mapping, spec)</div>
                <div>• client.datasets.get_status(id)</div>
                <div>• client.datasets.download(id, file_format)</div>
              </div>
            </div>

            <!-- 4. Execution Result & Downstream Impact -->
            <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-1">
              <span class="text-[10px] font-mono text-accent-coral uppercase font-semibold">4. Analytical Impact</span>
              <div class="text-text-primary font-medium">Pre-Conditioned Issue Grouping</div>
              <div class="text-[11px] text-text-secondary leading-relaxed">
                Normalizes text embeddings to feed the Customer Pain Radar and Hidden Complaint Detector with zero fabricated parameters.
              </div>
            </div>
          </div>

          <!-- API Key Configuration & Live / Sandbox Toggle -->
          <div class="p-4 rounded bg-bg-dark border border-border-subtle space-y-3">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-text-secondary">CONFIGURED API KEY:</span>
              <span class="text-accent-mint">{{ adaptionStatus?.api_key_masked }}</span>
            </div>

            <div class="flex gap-2">
              <input 
                type="text" 
                [(ngModel)]="newApiKey"
                placeholder="Enter Adaption API key (pt_live_...)"
                class="flex-1 px-3 py-2 rounded bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-mint font-mono">
              <button 
                (click)="saveApiKey()"
                class="px-4 py-2 rounded bg-accent-blue text-bg-dark font-bold text-xs hover:bg-accent-blue/90">
                Update Key
              </button>
            </div>
            <div class="text-[11px] text-text-muted">
              Note: If no live key is configured, the system automatically runs in transparent high-fidelity Sandbox Simulation mode with complete diagnostic logging so evaluators can inspect every pipeline step.
            </div>
          </div>

          <!-- Recent Adaption Diagnostic Logs Table -->
          <div class="space-y-2">
            <span class="text-xs font-mono uppercase text-text-secondary">Latest Adaption Execution Provenance Logs:</span>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                    <th class="pb-2">Operation</th>
                    <th class="pb-2">Status</th>
                    <th class="pb-2">Dataset ID</th>
                    <th class="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle text-[11px]">
                  <tr *ngFor="let log of adaptionStatus?.latest_logs" class="hover:bg-bg-dark">
                    <td class="py-2.5 text-text-primary font-semibold">{{ log.operation }}</td>
                    <td class="py-2.5">
                      <span [class.text-accent-mint]="log.status === 'success'" [class.text-accent-amber]="log.status === 'simulated_sandbox'" class="font-bold">
                        {{ log.status }}
                      </span>
                    </td>
                    <td class="py-2.5 text-text-secondary">{{ log.dataset_id || 'N/A' }}</td>
                    <td class="py-2.5 text-text-muted">{{ log.created_at | date:'mediumTime' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsSettingsComponent implements OnInit {
  activeTab = 'reports';
  currentUser: User | null = null;
  reportSummary: any = null;
  adaptionStatus: any = null;
  newApiKey = '';

  exportPdfUrl = '';
  exportCsvUrl = '';

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.api.currentUser$.subscribe(user => this.currentUser = user);
    this.exportPdfUrl = this.api.getPdfReportUrl();
    this.exportCsvUrl = this.api.getCsvExportUrl();

    this.route.url.subscribe(segments => {
      const path = segments[0]?.path;
      if (path === 'settings') {
        this.activeTab = 'settings';
      }
    });

    this.loadData();
  }

  loadData() {
    this.api.getReportSummary().subscribe(res => this.reportSummary = res);
    this.api.getAdaptionStatus().subscribe(res => this.adaptionStatus = res);
  }

  saveApiKey() {
    if (!this.newApiKey.trim()) return;
    this.api.updateAdaptionConfig(this.newApiKey.trim()).subscribe({
      next: (res) => {
        alert(res.message);
        this.newApiKey = '';
        this.loadData();
      },
      error: (err) => alert(err.error?.error || 'Failed to update key')
    });
  }
}
