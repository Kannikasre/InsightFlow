const BASE_URL = 'http://localhost:5000/api';

function getHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem('insightflow_token');
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async demoLogin() {
    const res = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Dashboard
  async getDashboardMetrics(filters: { category?: string; sentiment?: string; days?: number | null } = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters.sentiment && filters.sentiment !== 'All') params.set('sentiment', filters.sentiment);
    if (filters.days) params.set('days', filters.days.toString());
    const res = await fetch(`${BASE_URL}/dashboard/metrics?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Feedback
  async listFeedback(paramsObj: any = {}) {
    const params = new URLSearchParams();
    Object.keys(paramsObj).forEach(k => {
      if (paramsObj[k] !== undefined && paramsObj[k] !== null && paramsObj[k] !== '') {
        params.set(k, paramsObj[k]);
      }
    });
    const res = await fetch(`${BASE_URL}/feedback?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getFeedback(id: number) {
    const res = await fetch(`${BASE_URL}/feedback/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async createFeedback(data: any) {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteFeedback(id: number) {
    const res = await fetch(`${BASE_URL}/feedback/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Import
  async previewCsv(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE_URL}/import/preview`, {
      method: 'POST',
      headers: getHeaders(true),
      body: fd
    });
    return res.json();
  },

  async uploadAndAnalyze(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE_URL}/import/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: fd
    });
    return res.json();
  },

  async seedDemo() {
    const res = await fetch(`${BASE_URL}/import/seed-demo`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Insights
  async getPainRadar() {
    const res = await fetch(`${BASE_URL}/insights/pain-radar`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getEvidence(issueId: number) {
    const res = await fetch(`${BASE_URL}/insights/evidence/${issueId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getConnectionMap() {
    const res = await fetch(`${BASE_URL}/insights/connection-map`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getTimeline() {
    const res = await fetch(`${BASE_URL}/insights/timeline`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getHiddenComplaints() {
    const res = await fetch(`${BASE_URL}/insights/hidden-complaints`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Recommendations
  async listRecommendations() {
    const res = await fetch(`${BASE_URL}/recommendations`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async convertToIssue(recId: number, data: any = {}) {
    const res = await fetch(`${BASE_URL}/recommendations/${recId}/convert-to-issue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Issues
  async listIssues(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.set('status', filters.status);
    if (filters.priority && filters.priority !== 'All') params.set('priority', filters.priority);
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    const res = await fetch(`${BASE_URL}/issues?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getIssue(id: number) {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async createIssue(data: any) {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateIssue(id: number, data: any) {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteIssue(id: number) {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Reports
  async getReportSummary() {
    const res = await fetch(`${BASE_URL}/reports/summary`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getPdfUrl() {
    return `${BASE_URL}/reports/export-pdf`;
  },

  getCsvUrl() {
    return `${BASE_URL}/reports/export-csv`;
  },

  // Adaption
  async getAdaptionStatus() {
    const res = await fetch(`${BASE_URL}/adaption/status`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async updateAdaptionKey(apiKey: string) {
    const res = await fetch(`${BASE_URL}/adaption/config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ api_key: apiKey })
    });
    return res.json();
  },

  // Ask
  async ask(question: string) {
    const res = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question })
    });
    return res.json();
  }
};
