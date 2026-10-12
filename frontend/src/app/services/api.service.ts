import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('insightflow_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private loadStoredUser() {
    const saved = localStorage.getItem('insightflow_user');
    if (saved) {
      try {
        this.currentUserSubject.next(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('insightflow_user');
      }
    }
  }

  // --- Auth ---
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data).pipe(
      tap((res: any) => this.handleAuthSuccess(res))
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data).pipe(
      tap((res: any) => this.handleAuthSuccess(res))
    );
  }

  demoLogin(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/demo-login`, {}).pipe(
      tap((res: any) => this.handleAuthSuccess(res))
    );
  }

  logout() {
    localStorage.removeItem('insightflow_token');
    localStorage.removeItem('insightflow_user');
    this.currentUserSubject.next(null);
  }

  private handleAuthSuccess(res: any) {
    if (res.token) {
      localStorage.setItem('insightflow_token', res.token);
      localStorage.setItem('insightflow_user', JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
    }
  }

  // --- Dashboard ---
  getDashboardMetrics(filters?: { category?: string; sentiment?: string; source?: string; days?: number }): Observable<any> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.sentiment) params = params.set('sentiment', filters.sentiment);
    if (filters?.source) params = params.set('source', filters.source);
    if (filters?.days) params = params.set('days', filters.days.toString());
    return this.http.get(`${this.baseUrl}/dashboard/metrics`, { headers: this.getHeaders(), params });
  }

  // --- Feedback ---
  listFeedback(paramsObj: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(k => {
      if (paramsObj[k] !== undefined && paramsObj[k] !== null && paramsObj[k] !== '') {
        params = params.set(k, paramsObj[k]);
      }
    });
    return this.http.get(`${this.baseUrl}/feedback`, { headers: this.getHeaders(), params });
  }

  getFeedbackDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/feedback/${id}`, { headers: this.getHeaders() });
  }

  createFeedback(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/feedback`, data, { headers: this.getHeaders() });
  }

  updateFeedback(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/feedback/${id}`, data, { headers: this.getHeaders() });
  }

  deleteFeedback(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/feedback/${id}`, { headers: this.getHeaders() });
  }

  // --- Import & Workbench ---
  previewCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/import/preview`, formData, { headers: this.getHeaders() });
  }

  uploadAndAnalyze(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/import/upload`, formData, { headers: this.getHeaders() });
  }

  seedDemoDataset(): Observable<any> {
    return this.http.post(`${this.baseUrl}/import/seed-demo`, {}, { headers: this.getHeaders() });
  }

  getAnalysisStatus(runId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/import/status/${runId}`, { headers: this.getHeaders() });
  }

  // --- Insights ---
  getPainRadar(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insights/pain-radar`, { headers: this.getHeaders() });
  }

  getEvidenceExplorer(issueId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/insights/evidence/${issueId}`, { headers: this.getHeaders() });
  }

  getConnectionMap(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insights/connection-map`, { headers: this.getHeaders() });
  }

  getTimeline(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insights/timeline`, { headers: this.getHeaders() });
  }

  getHiddenComplaints(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insights/hidden-complaints`, { headers: this.getHeaders() });
  }

  // --- Recommendations ---
  listRecommendations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recommendations`, { headers: this.getHeaders() });
  }

  convertRecommendationToIssue(recId: number, data: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/recommendations/${recId}/convert-to-issue`, data, { headers: this.getHeaders() });
  }

  // --- Issues ---
  listTrackedIssues(filters?: { status?: string; priority?: string; category?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.priority) params = params.set('priority', filters.priority);
    if (filters?.category) params = params.set('category', filters.category);
    return this.http.get(`${this.baseUrl}/issues`, { headers: this.getHeaders(), params });
  }

  getTrackedIssue(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/issues/${id}`, { headers: this.getHeaders() });
  }

  createTrackedIssue(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/issues`, data, { headers: this.getHeaders() });
  }

  updateTrackedIssue(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/issues/${id}`, data, { headers: this.getHeaders() });
  }

  deleteTrackedIssue(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/issues/${id}`, { headers: this.getHeaders() });
  }

  // --- Reports ---
  getReportSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/summary`, { headers: this.getHeaders() });
  }

  getPdfReportUrl(): string {
    return `${this.baseUrl}/reports/export-pdf`;
  }

  getCsvExportUrl(): string {
    return `${this.baseUrl}/reports/export-csv`;
  }

  // --- Adaption Integration Diagnostics ---
  getAdaptionStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/adaption/status`, { headers: this.getHeaders() });
  }

  updateAdaptionConfig(apiKey: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/adaption/config`, { api_key: apiKey }, { headers: this.getHeaders() });
  }

  // --- Ask Your Feedback ---
  askQuestion(question: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/ask`, { question }, { headers: this.getHeaders() });
  }
}
