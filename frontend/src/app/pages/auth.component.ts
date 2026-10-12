import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Background subtle grid styling -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#191F2B_1px,transparent_1px),linear-gradient(to_bottom,#191F2B_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div class="editorial-card w-full max-w-md p-8 relative z-10 bg-bg-surface shadow-2xl border-border-subtle">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 rounded bg-gradient-to-br from-accent-mint to-accent-blue flex items-center justify-center font-bold text-bg-dark text-sm">
            IF
          </div>
          <div>
            <span class="font-bold tracking-tight text-lg text-text-primary">InsightFlow</span>
            <span class="block text-[11px] font-mono text-text-muted">Decision Intelligence Platform</span>
          </div>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="flex border-b border-border-subtle mb-6">
          <button 
            (click)="isLogin = true"
            [class.border-accent-mint]="isLogin"
            [class.text-accent-mint]="isLogin"
            [class.text-text-secondary]="!isLogin"
            class="flex-1 pb-2.5 text-xs font-mono font-medium border-b-2 border-transparent transition-colors text-center">
            SIGN IN
          </button>
          <button 
            (click)="isLogin = false"
            [class.border-accent-mint]="!isLogin"
            [class.text-accent-mint]="!isLogin"
            [class.text-text-secondary]="isLogin"
            class="flex-1 pb-2.5 text-xs font-mono font-medium border-b-2 border-transparent transition-colors text-center">
            REGISTER
          </button>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="mb-4 p-3 rounded bg-accent-coral/10 border border-accent-coral/30 text-accent-coral text-xs">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div *ngIf="!isLogin">
            <label class="block text-xs font-mono text-text-secondary mb-1">FULL NAME</label>
            <input 
              type="text" 
              [(ngModel)]="fullName" 
              name="fullName"
              placeholder="e.g. Alex Chen"
              class="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
              required>
          </div>

          <div *ngIf="!isLogin">
            <label class="block text-xs font-mono text-text-secondary mb-1">ROLE / TITLE</label>
            <input 
              type="text" 
              [(ngModel)]="role" 
              name="role"
              placeholder="e.g. Head of Product / Support Lead"
              class="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans">
          </div>

          <div>
            <label class="block text-xs font-mono text-text-secondary mb-1">EMAIL ADDRESS</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              placeholder="name@company.com"
              class="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
              required>
          </div>

          <div>
            <label class="block text-xs font-mono text-text-secondary mb-1">PASSWORD</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              placeholder="••••••••••••"
              class="w-full px-3.5 py-2.5 rounded bg-bg-dark border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent-mint font-sans"
              required>
          </div>

          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full py-2.5 rounded bg-accent-mint text-bg-dark font-semibold text-xs hover:bg-accent-mint/90 transition-colors disabled:opacity-50">
            <span *ngIf="!loading">{{ isLogin ? 'Sign In to Workspace' : 'Create Account' }}</span>
            <span *ngIf="loading">Authenticating...</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6 text-center">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border-subtle"></div></div>
          <span class="relative px-3 bg-bg-surface text-[10px] font-mono text-text-muted">OR FOR EVALUATORS</span>
        </div>

        <!-- Quick Demo Button -->
        <button 
          (click)="onDemoLogin()" 
          type="button"
          class="w-full py-2.5 rounded bg-bg-elevated border border-border-subtle text-accent-blue font-mono text-xs hover:bg-bg-elevated/80 hover:border-accent-blue/40 transition-colors flex items-center justify-center gap-2">
          <span>⚡ Instant Demo Access (Pre-Seeded 7,000 Records)</span>
        </button>

        <div class="mt-6 text-center">
          <a routerLink="/landing" class="text-xs text-text-secondary hover:text-text-primary">
            ← Back to Product Overview
          </a>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent implements OnInit {
  isLogin = true;
  email = '';
  password = '';
  fullName = '';
  role = 'Product Lead';
  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.url.subscribe(segments => {
      const path = segments[0]?.path;
      if (path === 'register') {
        this.isLogin = false;
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    if (this.isLogin) {
      this.api.login({ email: this.email, password: this.password }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Authentication failed. Please verify credentials.';
        }
      });
    } else {
      this.api.register({ 
        email: this.email, 
        password: this.password, 
        full_name: this.fullName, 
        role: this.role 
      }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Registration failed.';
        }
      });
    }
  }

  onDemoLogin() {
    this.loading = true;
    this.api.demoLogin().subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Demo login failed.';
      }
    });
  }
}
