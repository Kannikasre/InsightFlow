# InsightFlow — Intelligent Customer Feedback & Decision Platform
### Official Submission | Build Battle 2026 AI Web Development Hackathon

---

## 🌟 Executive Overview

**InsightFlow** transforms high-volume customer noise (reviews, surveys, customer support messages) into **evidence-backed, accountable engineering decisions**. Rather than stopping at generic sentiment scores or high-level summaries, InsightFlow implements a closed-loop **Feedback-to-Fix** workflow backed by transparent mathematical formulation, semantic clustering, causal cascade mapping, and official **Adaption Labs** data optimization.

Pre-seeded and fully verified with the official **7,000 customer feedback records** across 4 categories:
- **Operational Issues** (1,800 entries)
- **Fraud and Scam** (1,755 entries)
- **Product Feedback** (1,738 entries)
- **Customer Service** (1,707 entries)

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       InsightFlow Web                       │
│      React 19 + TypeScript + Tailwind CSS v3 + ECharts      │
│          Dark-First Swiss Editorial Design (#0B0D12)        │
└──────────────────────────────▲──────────────────────────────┘
                               │ REST APIs (JSON / JWT / Blobs)
┌──────────────────────────────▼──────────────────────────────┐
│                    Python Flask REST API                    │
│   SQLAlchemy ORM • ReportLab PDF Engine • Pandas Analytics   │
│   Conversational Analytics Engine • Issue Tracking Engine    │
└──────────────▲───────────────────────────────▲──────────────┘
               │                               │
┌──────────────▼─────────────┐   ┌─────────────▼──────────────┐
│     SQLite / PostgreSQL     │   │      Adaption Labs SDK     │
│  7,000 Verified Records     │   │     adaption v0.14.0       │
│  5 Issue Groups & Evidence │   │ client.datasets.upload_file│
│  Recommendations & Audits  │   │ client.datasets.adapt      │
└────────────────────────────┘   └────────────────────────────┘
```

- **Frontend**: Vite 8, React 19, TypeScript, Tailwind CSS v3, Apache ECharts, Lucide Icons.
- **Backend**: Python 3.14, Flask, Flask-CORS, SQLAlchemy ORM, Pandas, ReportLab (for Executive PDF reports), PyJWT.
- **Data Store**: Persistent SQLite / PostgreSQL engine with relational integrity, cascading deletes, foreign keys, and audit history.
- **AI / Pipeline**: Lexicon sentiment engine, Hidden Complaint Detector, Customer Impact Score ($0-100$) calculator, and **Adaption Labs** Adaptive Data integration.

---

## 🚀 5 Unique Differentiators

### A. Evidence-First Intelligence
Every insight, score, and recommendation links directly to verified customer submissions. Evaluators can click **"Inspect Evidence Trail"** to review sample sizes, statistical confidence, and exact customer quotes.

### B. Hidden Complaint Detector
Groups differently-worded complaints referring to identical underlying problems (e.g. *"app keeps freezing"*, *"page never loads"*, *"infinite loading wheel"* clustered into *App Freezing & Unresponsive UI Loops* with match confidence).

### C. Customer Impact Score (CIS)
Transparent mathematical ranking ($0–100$) based on 4 verifiable factors:
$$\text{CIS} = \text{Volume Weight}(30\%) + \text{Negative Sentiment Rate}(30\%) + \text{Severity Multiplier}(25\%) + \text{Velocity Trend}(15\%)$$
Every metric is accompanied by a full mathematical breakdown.

### D. Ask Your Feedback (Conversational Analytics)
Natural language assistant accessible via the header or `⌘K`:
- *"What are customers most unhappy about?"*
- *"Which complaints increased recently?"*
- *"Show negative feedback about fraud"*
- *"Why is this issue ranked first?"*
- *"Which tracked issues remain unresolved?"*
Answers are grounded strictly in SQL database queries and real customer quotes.

### E. Feedback-to-Fix Closed Loop
Seamless transition from **Raw Feedback** $\rightarrow$ **Clustered Pain Point** $\rightarrow$ **Actionable Recommendation** $\rightarrow$ **Tracked Engineering Task** (with automated audit trails, assignee updates, and status transitions: *Open*, *In Progress*, *Resolved*).

---

## ⚡ Adaption Labs SDK Integration Details (Mandatory)

InsightFlow implements genuine integration with the official **Adaption Python SDK** (`adaption` v0.14.0):

1. **Pipeline Placement**: Step 3 in the ingestion pipeline (*Adaptive Data Optimization & Structural Ingestion*).
2. **Schema Ingestion**: Maps raw feedback into prompt-completion-context tuples:
   ```python
   column_mapping = {
       "prompt": "review",
       "completion": "category",
       "context": ["source", "severity"]
   }
   job_specification = {"max_rows": 5000}
   ```
3. **Documented SDK Endpoints**:
   - `client.datasets.upload_file(filepath)`: Uploads raw customer CSV to the Adaption vault.
   - `client.datasets.adapt(dataset_id, column_mapping, job_spec)`: Submits prompt/completion adaptation recipe.
   - `client.datasets.get_status(dataset_id)`: Polls asynchronous job execution.
   - `client.datasets.download(dataset_id, file_format="csv")`: Streams adapted data for downstream analysis.
4. **Transparent Diagnostic Sandbox**:
   - If an `ADAPTION_API_KEY` is present, genuine cloud API calls are dispatched.
   - If no key is configured, the system operates in **High-Fidelity Sandbox Simulation mode**, recording exact endpoints, parameters, and simulated runs in the database so evaluators can inspect provenance without key friction.
   - Includes real-time API key update in the **Settings & Adaption Lab** view (`/settings`).

---

## 📱 The 9 Implemented Application Pages

| # | Page | Path | Capabilities |
|---|------|------|--------------|
| 1 | **Landing Page** | `/landing` | High-conversion executive introduction, interactive product preview, workflow stages, and instant demo access. |
| 2 | **Register / Login** | `/login` | JWT authentication, password hashing, input validation, and 1-click Evaluator Demo Login. |
| 3 | **Main Dashboard** | `/dashboard` | ECharts temporal trends, category share pie, compact metric strip, Priority #1 Alert Banner, and live multi-attribute filters. |
| 4 | **Feedback Explorer** | `/feedback` | Paginated search, category/sentiment/severity filters, slide-over audit drawer, and manual feedback submission form. |
| 5 | **Import & Workbench** | `/import` | Drag & drop CSV workbench, schema column verification, missing row detection, Adaption pipeline stepper, and 1-click dataset re-seed. |
| 6 | **AI Insights & Radar** | `/insights` | 4 tabbed workspaces: Customer Pain Radar, Complaint Connection Map (causal cascade), What Changed Timeline, and Hidden Detector. |
| 7 | **Recommendations** | `/recommendations` | Strategic recommendations with action steps, rationale, projected impact, trade-off limitations, and 1-click "Convert to Tracked Issue". |
| 8 | **Issue Tracker** | `/issues` | Kanban-style status management (*Open*, *In Progress*, *Resolved*), assignment tracking, audit logs, and new issue creation. |
| 9 | **Reports & Settings** | `/reports`, `/settings` | ReportLab PDF report generation, full CSV export, operator workspace info, and 6-point Adaption Integration Inspector. |

---

## 🏃 Quick Start Instructions

### Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+ (tested with Node.js 24)

### 1. Start the Flask Backend (Port 5000)
```powershell
# From project root: d:\build_battle
python backend/seed_data.py   # Pre-seeds the official 7,000 dataset
python backend/app.py         # Runs Flask server on http://localhost:5000
```
Health check verification:
```powershell
curl http://localhost:5000/api/health
# Returns: {"status": "healthy", "service": "InsightFlow Backend API"}
```

### 2. Start the Frontend (Port 3000)
```powershell
cd web
npm install
npm run dev -- --port 3000 --host
```
Open **`http://localhost:3000`** in any browser.

---

## 🏆 Official Hackathon Deliverables Verified

- [x] Official dataset `BuildBattle_2026_Customer_Feedback_Dataset.csv` ingested and analyzed (7,000 rows).
- [x] Official `adaption` Python SDK installed, integrated, and verifiable in Settings.
- [x] Executive PDF Report export (`/api/reports/export-pdf`) tested and functional.
- [x] Full CSV Export (`/api/reports/export-csv`) tested and functional.
- [x] Conversational Q&A engine ("Ask Your Feedback") tested across all 5 reference queries.
- [x] Zero mock buttons — all interactive actions persist to the SQLite / PostgreSQL database.
