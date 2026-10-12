import React, { useState } from 'react';
import { api } from '../api';

export const ImportWorkbenchPage: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const p = await api.previewCsv(selectedFile);
      setPreview(p);
    } catch (e) {
      alert('Failed to parse CSV preview');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStep('Uploading & Validating CSV rows...');
    setProgress(30);

    setTimeout(() => {
      setStep('Connecting to Adaption Labs Adaptive Data pipeline...');
      setProgress(65);
    }, 500);

    try {
      const res = await api.uploadAndAnalyze(file);
      setProgress(100);
      setStep('Completed!');
      setResult(res);
    } catch (e: any) {
      alert('Upload failed: ' + (e.message || 'Server error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsProcessing(true);
    setStep('Loading official Build Battle 2026 dataset (7,000 feedback entries)...');
    setProgress(50);

    try {
      const res = await api.seedDemo();
      setProgress(100);
      setStep('Completed!');
      setResult(res);
    } catch (e: any) {
      alert('Demo seed failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="text-xs font-mono text-accent-blue uppercase">DATA INGESTION & PIPELINE WORKBENCH</div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Dataset Ingestion & Analysis</h1>
          <p className="text-xs text-text-secondary mt-1">Upload raw CSV customer feedback datasets, run structural schema verification, and trigger the Adaption processing pipeline.</p>
        </div>

        <button 
          onClick={handleSeedDemo} 
          disabled={isProcessing}
          className="px-4 py-2 rounded bg-bg-elevated border border-accent-mint/40 text-accent-mint font-mono text-xs hover:bg-accent-mint/10 transition-colors flex items-center gap-2">
          <span>⚡ Re-Analyze Official 7,000 Dataset</span>
        </button>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="editorial-card p-6 border-accent-mint/40 bg-accent-mint/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-accent-mint animate-ping"></span>
              <span className="text-xs font-mono text-text-primary font-bold">ANALYSIS PIPELINE RUNNING: {step}</span>
            </div>
            <span className="text-xs font-mono text-accent-mint">Please wait...</span>
          </div>
          <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-accent-mint to-accent-blue h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {result && (
        <div className="editorial-card p-6 border-accent-mint/40 bg-bg-surface space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="text-accent-mint font-bold text-sm">✓ Ingestion & Analysis Succeeded</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-elevated text-accent-blue border border-border-subtle">Run #{result.run_id}</span>
            </div>
            <button onClick={() => setTab('dashboard')} className="px-3 py-1 rounded bg-accent-mint text-bg-dark font-bold text-xs">
              Open Dashboard →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 rounded bg-bg-dark border border-border-subtle">
              <div className="text-[10px] font-mono text-text-muted">RECORDS INGESTED</div>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">{result.total_analyzed?.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded bg-bg-dark border border-border-subtle">
              <div className="text-[10px] font-mono text-accent-mint">POSITIVE</div>
              <div className="text-xl font-bold font-mono text-accent-mint mt-1">{result.positive_count?.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded bg-bg-dark border border-border-subtle">
              <div className="text-[10px] font-mono text-accent-blue">NEUTRAL</div>
              <div className="text-xl font-bold font-mono text-accent-blue mt-1">{result.neutral_count?.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded bg-bg-dark border border-border-subtle">
              <div className="text-[10px] font-mono text-accent-coral">NEGATIVE</div>
              <div className="text-xl font-bold font-mono text-accent-coral mt-1">{result.negative_count?.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded bg-bg-dark border border-border-subtle">
              <div className="text-[10px] font-mono text-accent-amber">EXECUTION TIME</div>
              <div className="text-xl font-bold font-mono text-accent-amber mt-1">{result.execution_time_sec?.toFixed(1)}s</div>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage 1 */}
        <div className="lg:col-span-6 editorial-card p-6 space-y-4">
          <div className="text-xs font-mono uppercase text-accent-mint">STAGE 01: SELECT DATASET FILE</div>
          
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) handleFileChange(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-border-subtle rounded-lg p-8 text-center hover:border-accent-mint/50 transition-colors bg-bg-dark/50 cursor-pointer"
            onClick={() => document.getElementById('csv-input')?.click()}>
            <input 
              id="csv-input"
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => e.target.files?.length && handleFileChange(e.target.files[0])}
            />
            
            <div className="text-3xl mb-2">📁</div>
            <div className="text-xs font-semibold text-text-primary">Click to select CSV or drag & drop</div>
            <div className="text-[11px] text-text-secondary mt-1">Supports UTF-8 CSV datasets up to 32MB</div>
            
            {file && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-bg-surface border border-accent-mint/30 text-accent-mint text-xs font-mono">
                <span>Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stage 2 */}
        <div className="lg:col-span-6 editorial-card p-6 space-y-4">
          <div className="text-xs font-mono uppercase text-accent-blue">STAGE 02: STRUCTURAL DIAGNOSTICS</div>

          {!preview && (
            <div className="py-12 text-center text-text-secondary text-xs">
              Select or drop a CSV file to inspect headers, detect anomalies, and verify column mappings.
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded bg-bg-dark border border-border-subtle">
                  <div className="text-[10px] text-text-muted">TOTAL DETECTED</div>
                  <div className="text-lg font-bold text-text-primary mt-0.5">{preview.total_rows?.toLocaleString()} rows</div>
                </div>
                <div className="p-3 rounded bg-bg-dark border border-border-subtle">
                  <div className="text-[10px] text-accent-mint">VALID ENTRIES</div>
                  <div className="text-lg font-bold text-accent-mint mt-0.5">{preview.valid_rows?.toLocaleString()} rows</div>
                </div>
                <div className="p-3 rounded bg-bg-dark border border-border-subtle">
                  <div className="text-[10px] text-accent-amber">NULL / EMPTY</div>
                  <div className="text-lg font-bold text-accent-amber mt-0.5">{preview.null_rows} rows</div>
                </div>
              </div>

              <div className="p-3 rounded bg-bg-dark border border-border-subtle text-xs space-y-2 font-mono">
                <div className="text-[10px] text-text-secondary uppercase">Mapped Target Columns:</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Feedback Text:</span>
                  <span className="text-accent-mint font-bold">{preview.detected_text_column}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Domain Category:</span>
                  <span className="text-accent-blue font-bold">category (Auto-detected)</span>
                </div>
              </div>

              <button 
                onClick={handleUpload}
                disabled={isProcessing}
                className="w-full py-2.5 rounded bg-accent-mint text-bg-dark font-bold text-xs hover:bg-accent-mint/90 transition-colors disabled:opacity-50">
                Confirm & Start Full Analysis Pipeline →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sample Rows Preview */}
      {preview && preview.sample_rows && (
        <div className="editorial-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-xs font-mono uppercase text-text-secondary">Sample Rows Inspection</span>
            <span className="text-[10px] font-mono text-text-muted">First 6 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] font-mono text-text-secondary uppercase">
                  {preview.columns?.map((col: string, idx: number) => (
                    <th key={idx} className="pb-2 px-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {preview.sample_rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-bg-elevated/30">
                    {preview.columns?.map((col: string, cIdx: number) => (
                      <td key={cIdx} className="py-2.5 px-3 text-text-primary text-[11px]">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
