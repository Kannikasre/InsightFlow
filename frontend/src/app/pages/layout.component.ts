import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, User } from '../services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-bg-dark text-text-primary flex flex-col">
      <!-- Top Navigation Header -->
      <header class="h-14 border-b border-border-subtle bg-bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-4">
          <a routerLink="/dashboard" class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded bg-gradient-to-br from-accent-mint to-accent-blue flex items-center justify-center font-bold text-bg-dark text-xs">
              IF
            </div>
            <span class="font-bold tracking-tight text-sm text-text-primary">InsightFlow</span>
          </a>
          <span class="text-border-subtle">/</span>
          <div class="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <span class="w-1.5 h-1.5 rounded-full bg-accent-mint"></span>
            <span>Workspace: <strong>BuildBattle-2026-Production</strong></span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Ask Your Feedback Trigger Button -->
          <button 
            (click)="toggleAskModal()" 
            class="px-3 py-1.5 rounded bg-bg-elevated border border-accent-blue/40 text-accent-blue text-xs font-mono flex items-center gap-2 hover:bg-accent-blue/10 transition-colors">
            <span>✨</span>
            <span>Ask Your Feedback (AI Query)</span>
            <kbd class="px-1.5 py-0.5 rounded bg-bg-dark text-[10px] text-text-muted border border-border-subtle">⌘K</kbd>
          </button>

          <!-- Current User Profile / Logout -->
          <div class="flex items-center gap-3 pl-3 border-l border-border-subtle">
            <div class="text-right hidden sm:block">
              <div class="text-xs font-medium text-text-primary">{{ currentUser?.full_name || 'Alex Chen' }}</div>
              <div class="text-[10px] font-mono text-text-muted">{{ currentUser?.role || 'VP of Product' }}</div>
            </div>
            <button 
              (click)="onLogout()" 
              title="Sign Out" 
              class="p-1.5 rounded text-text-secondary hover:text-accent-coral hover:bg-bg-elevated transition-colors text-xs font-mono">
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Main Shell with Sidebar -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Navigation Rail -->
        <aside class="w-60 border-r border-border-subtle bg-bg-surface/50 p-4 flex flex-col justify-between shrink-0">
          <div class="space-y-6">
            <div>
              <div class="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2.5 mb-2">Core Analytics</div>
              <nav class="space-y-1 text-xs">
                <a routerLink="/dashboard" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>📊</span>
                  <span>Main Dashboard</span>
                </a>
                <a routerLink="/feedback" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>🔍</span>
                  <span>Feedback Explorer</span>
                </a>
                <a routerLink="/import" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>📥</span>
                  <span>Import & Workbench</span>
                </a>
              </nav>
            </div>

            <div>
              <div class="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2.5 mb-2">Intelligence & Action</div>
              <nav class="space-y-1 text-xs">
                <a routerLink="/insights" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>🧠</span>
                  <span>AI Insights & Radar</span>
                </a>
                <a routerLink="/recommendations" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>💡</span>
                  <span>Recommendations</span>
                </a>
                <a routerLink="/issues" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>🎯</span>
                  <span>Issue Tracker</span>
                </a>
              </nav>
            </div>

            <div>
              <div class="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2.5 mb-2">Reports & Audit</div>
              <nav class="space-y-1 text-xs">
                <a routerLink="/reports" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>📄</span>
                  <span>Executive Reports</span>
                </a>
                <a routerLink="/settings" routerLinkActive="bg-bg-elevated text-accent-mint font-semibold border-l-2 border-accent-mint" class="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <span>⚙️</span>
                  <span>Settings & Adaption</span>
                </a>
              </nav>
            </div>
          </div>

          <!-- Bottom Workspace Stats -->
          <div class="p-3 rounded bg-bg-surface border border-border-subtle text-[11px]">
            <div class="flex items-center justify-between text-text-secondary font-mono mb-1">
              <span>Adaption Status</span>
              <span class="w-2 h-2 rounded-full bg-accent-mint"></span>
            </div>
            <div class="text-accent-mint font-mono font-medium">SDK v0.14.0 Connected</div>
            <div class="text-[10px] text-text-muted mt-1">7,000 Ingested Records</div>
          </div>
        </aside>

        <!-- Dynamic Content Body -->
        <main class="flex-1 overflow-y-auto bg-bg-dark">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Ask Your Feedback Modal (Differentiator D) -->
      <div *ngIf="showAskModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="editorial-card w-full max-w-2xl bg-bg-surface p-6 shadow-2xl border-accent-blue/40 relative">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
            <div class="flex items-center gap-2">
              <span class="text-base">✨</span>
              <span class="font-bold text-sm text-text-primary">Ask Your Feedback — Conversational Analytics</span>
            </div>
            <button (click)="toggleAskModal()" class="text-text-secondary hover:text-text-primary text-xs font-mono">✕ Close</button>
          </div>

          <!-- Quick Suggestion Chips -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button 
              *ngFor="let s of suggestedQuestions" 
              (click)="askQuestion(s)"
              class="px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle text-[11px] text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors">
              {{ s }}
            </button>
          </div>

          <!-- Question Input -->
          <div class="flex gap-2 mb-4">
            <input 
              type="text" 
              [(ngModel)]="currentQuestion" 
              (keyup.enter)="askQuestion(currentQuestion)"
              placeholder="Ask anything (e.g. 'What are customers most unhappy about?')"
              class="flex-1 px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-blue">
            <button 
              (click)="askQuestion(currentQuestion)" 
              [disabled]="askLoading"
              class="px-4 py-2.5 rounded bg-accent-blue text-bg-dark font-bold text-xs hover:bg-accent-blue/90 disabled:opacity-50">
              <span *ngIf="!askLoading">Query</span>
              <span *ngIf="askLoading">Analyzing...</span>
            </button>
          </div>

          <!-- Answer Surface -->
          <div *ngIf="askAnswer" class="p-4 rounded bg-bg-dark border border-border-subtle max-h-80 overflow-y-auto space-y-3">
            <div class="text-xs text-text-primary leading-relaxed whitespace-pre-line" [innerHTML]="formatAnswer(askAnswer.answer)"></div>

            <!-- Evidence quotes if available -->
            <div *ngIf="askAnswer.evidence && askAnswer.evidence.length > 0" class="pt-3 border-t border-border-subtle">
              <div class="text-[10px] font-mono uppercase text-accent-mint mb-2">Supporting Customer Feedback Evidence:</div>
              <div class="space-y-1.5">
                <div *ngFor="let ev of askAnswer.evidence" class="p-2 rounded bg-bg-surface border border-border-subtle text-[11px] text-text-secondary italic">
                  "{{ ev.text }}"
                  <span class="not-italic text-[10px] font-mono text-accent-blue ml-2">— {{ ev.source }} ({{ ev.category }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  showAskModal = false;
  currentQuestion = '';
  askLoading = false;
  askAnswer: any = null;

  suggestedQuestions = [
    'What are customers most unhappy about?',
    'Which complaints increased recently?',
    'Show negative feedback about fraud',
    'Why is this issue ranked first?',
    'Which tracked issues remain unresolved?'
  ];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.currentUser$.subscribe(user => this.currentUser = user);
  }

  toggleAskModal() {
    this.showAskModal = !this.showAskModal;
    if (this.showAskModal && !this.askAnswer) {
      this.askQuestion('What are customers most unhappy about?');
    }
  }

  askQuestion(q: string) {
    if (!q) return;
    this.currentQuestion = q;
    this.askLoading = true;
    this.api.askQuestion(q).subscribe({
      next: (res) => {
        this.askAnswer = res;
        this.askLoading = false;
      },
      error: () => {
        this.askLoading = false;
      }
    });
  }

  formatAnswer(txt: string): string {
    if (!txt) return '';
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  onLogout() {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
