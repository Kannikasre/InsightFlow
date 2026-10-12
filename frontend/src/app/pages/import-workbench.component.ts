import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-import-workbench',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div class="text-xs font-mono text-accent-blue uppercase">DATA INGESTION & PIPELINE WORKBENCH</div>
          <h1 class="text-2xl font-bold tracking-tight text-text-primary mt-1">Dataset Ingestion & Analysis</h1>
          <p class="text-xs text-text-secondary mt-1">Upload raw CSV customer feedback datasets, run structural schema verification, and trigger the Adaption processing pipeline.</p>
        </div>

        <!-- Quick 1-Click Demo Seed -->
        <button 
          (click)="onSeedDemo()" 
          [disabled]="isProcessing"
          class="px-4 py-2 rounded bg-bg-elevated border border-accent-mint/40 text-accent-mint font-mono text-xs hover:bg-accent-mint/10 transition-colors flex items-center gap-2">
          <span>⚡ Re-Analyze Official 7,000 Dataset</span>
        </button>
      </div>

      <!-- Processing Progress Banner -->
      <div *ngIf="isProcessing" class="editorial-card p-6 border-accent-mint/40 bg-accent-mint/5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-accent-mint animate-ping"></span>
            <span class="text-xs font-mono text-text-primary font-bold">ANALYSIS PIPELINE RUNNING: {{ processingStep }}</span>
          </div>
          <span class="text-xs font-mono text-accent-mint">Please wait...</span>
        </div>
        <div class="w-full bg-bg-dark h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-accent-mint to-accent-blue h-full transition-all duration-300" [style.width.%]="processingProgress"></div>
        </div>
      </div>

      <!-- Analysis Results Summary (When Complete) -->
      <div *ngIf="latestResult" class="editorial-card p-6 border-accent-mint/40 bg-bg-surface space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div class="flex items-center gap-2">
            <span class="text-accent-mint font-bold text-sm">✓ Ingestion & Analysis Succeeded</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-elevated text-accent-blue border border-border-subtle">Run #{{ latestResult.run_id }}</span>
          </div>
          <a routerLink="/dashboard" class="px-3 py-1 rounded bg-accent-mint text-bg-dark font-bold text-xs">
            Open Dashboard →
          </a>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="p-3 rounded bg-bg-dark border border-border-subtle">
            <div class="text-[10px] font-mono text-text-muted">RECORDS INGESTED</div>
            <div class="text-xl font-bold font-mono text-text-primary mt-1">{{ latestResult.total_analyzed | number }}</div>
          </div>
          <div class="p-3 rounded bg-bg-dark border border-border-subtle">
            <div class="text-[10px] font-mono text-accent-mint">POSITIVE</div>
            <div class="text-xl font-bold font-mono text-accent-mint mt-1">{{ latestResult.positive_count | number }}</div>
          </div>
          <div class="p-3 rounded bg-bg-dark border border-border-subtle">
            <div class="text-[10px] font-mono text-accent-blue">NEUTRAL</div>
            <div class="text-xl font-bold font-mono text-accent-blue mt-1">{{ latestResult.neutral_count | number }}</div>
          </div>
          <div class="p-3 rounded bg-bg-dark border border-border-subtle">
            <div class="text-[10px] font-mono text-accent-coral">NEGATIVE</div>
            <div class="text-xl font-bold font-mono text-accent-coral mt-1">{{ latestResult.negative_count | number }}</div>
          </div>
          <div class="p-3 rounded bg-bg-dark border border-border-subtle">
            <div class="text-[10px] font-mono text-accent-amber">EXECUTION DURATION</div>
            <div class="text-xl font-bold font-mono text-accent-amber mt-1">{{ latestResult.execution_time_sec | number:'1.1-2' }}s</div>
          </div>
        </div>

        <div class="p-3 rounded bg-bg-dark border border-border-subtle flex items-center justify-between text-xs font-mono">
          <div class="text-text-secondary">
            Adaption Stage Mode: <strong class="text-text-primary">{{ latestResult.adaption_mode }}</strong>
          </div>
          <a routerLink="/settings" class="text-accent-blue hover:underline">
            View Adaption Audit Trail →
          </a>
        </div>
      </div>

      <!-- Step 1 & 2: Dropzone & File Selection -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-6 editorial-card p-6 space-y-4">
          <div class="text-xs font-mono uppercase text-accent-mint">STAGE 01: SELECT DATASET FILE</div>
          
          <div 
            (dragover)="onDragOver($event)" 
            (drop)="onDrop($event)"
            class="border-2 border-dashed border-border-subtle rounded-lg p-8 text-center hover:border-accent-mint/50 transition-colors bg-bg-dark/50 cursor-pointer"
            (click)="fileInput.click()">
            <input #fileInput type="file" accept=".csv" class="hidden" (change)="onFileSelected($event)">
            
            <div class="text-3xl mb-2">📁</div>
            <div class="text-xs font-semibold text-text-primary">Click to select CSV or drag & drop</div>
            <div class="text-[11px] text-text-secondary mt-1">Supports UTF-8 CSV datasets up to 32MB</div>
            
            <div *ngIf="selectedFile" class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-bg-surface border border-accent-mint/30 text-accent-mint text-xs font-mono">
              <span>Selected: {{ selectedFile.name }} ({{ (selectedFile.size / 1024) | number:'1.0-0' }} KB)</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-text-secondary font-mono">
            <span>Pre-configured for BuildBattle 2026</span>
            <button 
              (click)="onSeedDemo()" 
              class="text-accent-mint hover:underline">
              Load Built-in Dataset
            </button>
          </div>
        </div>

        <!-- Stage 02: Schema Verification & Health Checks -->
        <div class="lg:col-span-6 editorial-card p-6 space-y-4">
          <div class="text-xs font-mono uppercase text-accent-blue">STAGE 02: STRUCTURAL DIAGNOSTICS</div>

          <div *ngIf="!previewData" class="py-12 text-center text-text-secondary text-xs">
            Select or drop a CSV file to inspect headers, detect anomalies, and verify column mappings.
          </div>

          <div *ngIf="previewData" class="space-y-4">
            <div class="grid grid-cols-3 gap-3 font-mono text-xs">
              <div class="p-3 rounded bg-bg-dark border border-border-subtle">
                <div class="text-[10px] text-text-muted">TOTAL DETECTED</div>
                <div class="text-lg font-bold text-text-primary mt-0.5">{{ previewData.total_rows | number }} rows</div>
              </div>
              <div class="p-3 rounded bg-bg-dark border border-border-subtle">
                <div class="text-[10px] text-accent-mint">VALID ENTRIES</div>
                <div class="text-lg font-bold text-accent-mint mt-0.5">{{ previewData.valid_rows | number }} rows</div>
              </div>
              <div class="p-3 rounded bg-bg-dark border border-border-subtle">
                <div class="text-[10px] text-accent-amber">NULL / EMPTY</div>
                <div class="text-lg font-bold text-accent-amber mt-0.5">{{ previewData.null_rows }} rows</div>
              </div>
            </div>

            <!-- Column Mapping Preview -->
            <div class="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-2 font-mono">
              <div class="text-[10px] text-text-secondary uppercase">Mapped Target Columns:</div>
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-text-muted">Feedback Text:</span>
                <span class="text-accent-mint font-bold">{{ previewData.detected_text_column }}</span>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-text-muted">Domain Category:</span>
                <span class="text-accent-blue font-bold">category (Auto-detected)</span>
              </div>
            </div>

            <button 
              (click)="startUploadAndAnalysis()"
              [disabled]="isProcessing"
              class="w-full py-2.5 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 transition-colors disabled:opacity-50">
              Confirm & Start Full Analysis Pipeline →
            </button>
          </div>
        </div>
      </div>

      <!-- Sample Rows Preview Table -->
      <div *ngIf="previewData && previewData.sample_rows?.length" class="editorial-card p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-border-subtle">
          <span class="text-xs font-mono uppercase text-text-secondary">Sample Rows Inspection</span>
          <span class="text-[10px] font-mono text-text-muted">First 6 records</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-border-subtle text-[10px] font-mono text-text-secondary uppercase">
                <th *ngFor="let col of previewData.columns" class="pb-2 px-3">{{ col }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr *ngFor="let row of previewData.sample_rows" class="hover:bg-bg-elevated/30">
                <td *ngFor="let col of previewData.columns" class="py-2.5 px-3 text-text-primary text-[11px]">
                  {{ row[col] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ImportWorkbenchComponent implements OnInit {
  selectedFile: File | null = null;
  previewData: any = null;
  isProcessing = false;
  processingStep = '';
  processingProgress = 0;
  latestResult: any = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {}

  onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      this.handleFile(e.target.files[0]);
    }
  }

  handleFile(file: File) {
    this.selectedFile = file;
    this.api.previewCsv(file).subscribe({
      next: (res) => this.previewData = res,
      error: (err) => alert(err.error?.error || 'Failed to preview CSV')
    });
  }

  startUploadAndAnalysis() {
    if (!this.selectedFile) return;
    this.isProcessing = true;
    this.processingStep = 'Uploading & Validating CSV rows...';
    this.processingProgress = 25;

    setTimeout(() => {
      this.processingStep = 'Connecting to Adaption Labs Adaptive Data pipeline...';
      this.processingProgress = 55;
    }, 600);

    this.api.uploadAndAnalyze(this.selectedFile).subscribe({
      next: (res) => {
        this.processingStep = 'Completed!';
        this.processingProgress = 100;
        this.latestResult = res;
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.error || 'Upload failed');
      }
    });
  }

  onSeedDemo() {
    this.isProcessing = true;
    this.processingStep = 'Loading official Build Battle 2026 dataset (7,000 feedback entries)...';
    this.processingProgress = 40;

    this.api.seedDemoDataset().subscribe({
      next: (res) => {
        this.processingProgress = 100;
        this.latestResult = res;
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.error || 'Demo seed failed');
      }
    });
  }
}
