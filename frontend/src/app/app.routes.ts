import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing.component';
import { AuthComponent } from './pages/auth.component';
import { LayoutComponent } from './pages/layout.component';
import { DashboardComponent } from './pages/dashboard.component';
import { FeedbackExplorerComponent } from './pages/feedback-explorer.component';
import { ImportWorkbenchComponent } from './pages/import-workbench.component';
import { InsightsComponent } from './pages/insights.component';
import { RecommendationsComponent } from './pages/recommendations.component';
import { IssueTrackerComponent } from './pages/issue-tracker.component';
import { ReportsSettingsComponent } from './pages/reports-settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'feedback', component: FeedbackExplorerComponent },
      { path: 'import', component: ImportWorkbenchComponent },
      { path: 'insights', component: InsightsComponent },
      { path: 'recommendations', component: RecommendationsComponent },
      { path: 'issues', component: IssueTrackerComponent },
      { path: 'reports', component: ReportsSettingsComponent },
      { path: 'settings', component: ReportsSettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
