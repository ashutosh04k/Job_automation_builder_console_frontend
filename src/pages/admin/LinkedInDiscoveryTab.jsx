import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  Trash2, 
  Clock, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Building2, 
  MapPin, 
  Filter,
  RefreshCw,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { resumeFileName } from '../../utils/fileName';

export default function LinkedInDiscoveryTab() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ all: 0, easyApply: 0, external: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Pagination
  const [applyFilter, setApplyFilter] = useState('all'); // 'all' | 'easy_apply' | 'external'
  const [sortBy, setSortBy] = useState('score'); // 'score' (best match first) | 'recent'
  const [maxDays, setMaxDays] = useState(0); // 0 = any time, else posted in the last N days
  const [rescoring, setRescoring] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false
  });

  // Action states
  const [queuingId, setQueuingId] = useState(null);
  // Recruiter email entry for "Move to queue" (never guessed)
  const [emailDraft, setEmailDraft] = useState({ id: null, value: '', error: '' });
  const [deletingId, setDeletingId] = useState(null);

  // Tailored ATS PDF Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalUrl, setPdfModalUrl] = useState(null);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const [pdfModalJob, setPdfModalJob] = useState(null);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        applyType: applyFilter,
        sort: sortBy,
        maxDays: String(maxDays)
      });
      const res = await authFetch(apiUrl(`/api/discovered-jobs?${queryParams.toString()}`));
      const data = await res.json();
      if (data.success) {
        setJobs(data.data || []);
        setCounts(data.counts || { all: 0, easyApply: 0, external: 0 });
        setPaginationInfo({
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasPrevPage: data.hasPrevPage || false,
          hasNextPage: data.hasNextPage || false
        });
      } else {
        showNotification('error', data.error || 'Failed to fetch discovered jobs.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, limit, applyFilter, sortBy, maxDays]);

  // Re-score every saved job against the current master resume.
  const handleRescore = async () => {
    setRescoring(true);
    try {
      const res = await authFetch(apiUrl('/api/discovered-jobs/rescore'), { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Rescore failed');
      showNotification('success', data.message);
      fetchJobs();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setRescoring(false);
    }
  };

  const selectStyle = {
    padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--c-line)',
    background: 'var(--c-surface)', color: 'var(--c-ink)', fontSize: '13px'
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await authFetch(apiUrl(`/api/discovered-jobs/${id}`), {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Job entry deleted.');
        fetchJobs();
      } else {
        showNotification('error', data.error || 'Failed to delete job.');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleQueueTarget = async (job) => {
    const id = job._id || job.jobId;
    const email = emailDraft.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailDraft((d) => ({ ...d, error: 'Enter a valid recruiter email.' }));
      return;
    }
    setQueuingId(id);
    try {
      const res = await authFetch(apiUrl(`/api/discovered-jobs/${id}/queue-target`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setEmailDraft({ id: null, value: '', error: '' });
        showNotification('success', data.message || `Queued "${job.title}" for 9 AM outreach!`);
        fetchJobs();
      } else {
        showNotification('error', data.error || 'Failed to queue job.');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setQueuingId(null);
    }
  };

  // Open tailored PDF preview
  const handleOpenPdfPreview = async (job) => {
    setPdfModalJob(job);
    setPdfModalOpen(true);
    setPdfModalLoading(true);
    if (pdfModalUrl) {
      window.URL.revokeObjectURL(pdfModalUrl);
      setPdfModalUrl(null);
    }
    try {
      showNotification('success', '⏳ Compiling ATS tailored PDF resume preview...');
      const res = await authFetch(apiUrl(`/api/resume/tailored-pdf/discovered/${job._id || job.jobId}`));
      if (!res.ok) throw new Error('Failed to generate tailored PDF preview');
      const rawBlob = await res.blob();
      const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfModalUrl(url);
    } catch (err) {
      showNotification('error', err.message || 'Error generating PDF preview');
    } finally {
      setPdfModalLoading(false);
    }
  };

  const handleClosePdfModal = () => {
    setPdfModalOpen(false);
    if (pdfModalUrl) {
      window.URL.revokeObjectURL(pdfModalUrl);
      setPdfModalUrl(null);
    }
    setPdfModalJob(null);
  };

  const handleDownloadFromPdfModal = () => {
    if (!pdfModalUrl || !pdfModalJob) return;
    const a = document.createElement('a');
    a.href = pdfModalUrl;
    a.download = resumeFileName(user?.name, pdfModalJob.title, pdfModalJob.company);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showNotification('success', '📄 ATS Tailored Resume PDF downloaded!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`toast toast-${toast.type}`}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)'
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner / Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Scraped Card */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--c-brand)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--c-ink-soft)', fontWeight: 600 }}>Total Discovered</span>
            <Compass size={18} color="var(--c-brand)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-ink)', marginTop: '6px' }}>
            {counts.all}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--c-ink-soft)' }}>Ingested via Chrome Extension</span>
        </div>

        {/* Easy Apply Card */}
        <div 
          className="card" 
          onClick={() => { setApplyFilter('easy_apply'); setPage(1); }}
          style={{ 
            padding: '18px 20px', 
            borderLeft: '4px solid var(--c-go)', 
            cursor: 'pointer',
            backgroundColor: applyFilter === 'easy_apply' ? 'var(--c-go-soft)' : undefined
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--c-go)', fontWeight: 700 }}>⚡ Easy Apply Jobs</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--c-go-soft)', color: 'var(--c-go)', fontWeight: 700 }}>
              1-Click
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-go)', marginTop: '6px' }}>
            {counts.easyApply}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--c-ink-soft)' }}>
            Filter Easy Apply only {applyFilter === 'easy_apply' ? '✓ active' : '→ click to filter'}
          </span>
        </div>

        {/* External Apply Card */}
        <div 
          className="card" 
          onClick={() => { setApplyFilter('external'); setPage(1); }}
          style={{ 
            padding: '18px 20px', 
            borderLeft: '4px solid var(--c-accent)', 
            cursor: 'pointer',
            backgroundColor: applyFilter === 'external' ? 'var(--c-accent-soft)' : undefined
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--c-accent)', fontWeight: 700 }}>🌐 External Apply</span>
            <ExternalLink size={16} color="var(--c-accent)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-accent)', marginTop: '6px' }}>
            {counts.external}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--c-ink-soft)' }}>
            Company careers / work portals {applyFilter === 'external' ? '✓ active' : '→ click to filter'}
          </span>
        </div>

        {/* Scraper Extension Helper */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--c-line-strong)', background: 'var(--c-surface-alt)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--c-ink)', fontWeight: 700 }}>Chrome Scraper</span>
            <Layers size={18} color="var(--c-ink-soft)" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-ink-soft)', marginTop: '8px', lineHeight: 1.45 }}>
            In the extension's <strong>LinkedIn</strong> tab, open a search made from your resume (last 3 days), then press <strong>Scan &amp; send to portal</strong>. Each job is read in full and scored against your resume here.
          </div>
        </div>
      </div>

      {/* Main Control Toolbar & Filter Pills */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          {/* Dedicated Easy Apply vs External Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setApplyFilter('all'); setPage(1); }}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                padding: '6px 16px',
                fontWeight: 600,
                fontSize: '13px',
                background: applyFilter === 'all' ? 'var(--c-brand)' : 'var(--c-surface-alt)',
                color: applyFilter === 'all' ? '#ffffff' : 'var(--c-ink)',
                border: `1px solid ${applyFilter === 'all' ? 'var(--c-brand)' : 'var(--c-line)'}`
              }}
            >
              All Jobs ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => { setApplyFilter('easy_apply'); setPage(1); }}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                padding: '6px 16px',
                fontWeight: 700,
                fontSize: '13px',
                background: applyFilter === 'easy_apply' ? 'var(--c-go)' : 'var(--c-go-soft)',
                color: applyFilter === 'easy_apply' ? '#ffffff' : 'var(--c-go)',
                border: `1px solid ${applyFilter === 'easy_apply' ? 'var(--c-go)' : 'var(--c-go)'}`
              }}
            >
              ⚡ Easy Apply ({counts.easyApply})
            </button>

            <button
              type="button"
              onClick={() => { setApplyFilter('external'); setPage(1); }}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                padding: '6px 16px',
                fontWeight: 700,
                fontSize: '13px',
                background: applyFilter === 'external' ? 'var(--c-accent)' : 'var(--c-accent-soft)',
                color: applyFilter === 'external' ? '#ffffff' : 'var(--c-accent)',
                border: `1px solid ${applyFilter === 'external' ? 'var(--c-accent)' : 'var(--c-accent)'}`
              }}
            >
              🌐 External Apply ({counts.external})
            </button>
          </div>

          {/* Right Toolbar: Sort, Posted, Limit, Rescore, Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select aria-label="Sort jobs" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={selectStyle}>
              <option value="score">Best match first</option>
              <option value="recent">Newest first</option>
            </select>
            <select aria-label="Posted within" value={maxDays} onChange={(e) => { setMaxDays(Number(e.target.value)); setPage(1); }} style={selectStyle}>
              <option value="0">Posted any time</option>
              <option value="1">Last 24 hours</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRescore}
              disabled={rescoring}
              title="Score every job again against your current master resume"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>{rescoring ? 'Rescoring…' : 'Rescore'}</span>
            </button>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--c-line)',
                background: 'var(--c-surface)',
                color: 'var(--c-ink)',
                fontSize: '13px'
              }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchJobs}
              disabled={loading}
              title="Refresh list"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-ink-soft)' }} />
            <input
              type="text"
              placeholder="Search by role, company, location, or tech keywords (React, Node, TypeScript)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '8px',
                border: '1px solid var(--c-line)',
                background: 'var(--c-surface)',
                color: 'var(--c-ink)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 20px' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setSearch(''); setPage(1); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Discovered Jobs Table / Cards */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-ink-soft)' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--c-brand)' }} />
            <div style={{ fontWeight: 600, color: 'var(--c-ink)' }}>Loading discovered LinkedIn jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-ink-soft)' }}>
            <Compass size={48} style={{ margin: '0 auto 16px auto', color: 'var(--c-brand)', opacity: 0.5 }} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-ink)', marginBottom: '8px' }}>
              No Discovered Jobs Found
            </div>
            <p style={{ maxWidth: '480px', margin: '0 auto 20px auto', fontSize: '14px', lineHeight: 1.5 }}>
              Use the AutoResume Chrome Extension on any LinkedIn job search page to extract Easy Apply and external jobs in 1 click!
            </p>
            <div style={{ display: 'inline-flex', gap: '10px' }}>
              {search && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setSearch(''); fetchJobs(); }}
                >
                  Clear Search Filter
                </button>
              )}
              {applyFilter !== 'all' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => { setApplyFilter('all'); setPage(1); }}
                >
                  Show All Jobs
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--c-surface-alt)', borderBottom: '1px solid var(--c-line)', color: 'var(--c-ink-soft)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Job & Company</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Apply Method</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>ATS Match Score</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Discovered / Posted</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const isEasy = job.applyType === 'easy_apply' || job.isEasyApply;
                  // Real score from the backend; null when the job came without a description.
                  const atsScore = typeof job.atsScore === 'number' ? job.atsScore : null;
                  const scoreColor = atsScore === null ? 'var(--c-ink-soft)' : atsScore >= 80 ? 'var(--c-go)' : atsScore >= 65 ? 'var(--c-brand)' : atsScore >= 50 ? 'var(--c-accent)' : 'var(--c-error)';
                  const scoreBg = atsScore === null ? 'var(--c-surface-alt)' : atsScore >= 80 ? 'var(--c-go-soft)' : atsScore >= 65 ? 'var(--c-brand-tint)' : atsScore >= 50 ? 'var(--c-accent-soft)' : 'var(--c-error-soft)';
                  const jobKey = job._id || job.jobId;

                  return (
                    <tr 
                      key={job._id || job.jobId}
                      style={{ 
                        borderBottom: '1px solid var(--c-line)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-surface-alt)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Job Title & Company */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <a 
                              href={job.jobUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                fontWeight: 700, 
                                color: 'var(--c-ink)', 
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-brand)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-ink)'}
                            >
                              <span>{job.title}</span>
                              <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
                            </a>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: 'var(--c-ink-soft)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                              <Building2 size={13} /> {job.company}
                            </span>
                            {job.location && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} /> {job.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Apply Type Pill */}
                      <td style={{ padding: '16px 16px' }}>
                        {isEasy ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'var(--c-go-soft)',
                            color: 'var(--c-go)',
                            border: '1px solid var(--c-go)',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            ⚡ Easy Apply
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'var(--c-surface-alt)',
                            color: 'var(--c-accent)',
                            border: '1px solid var(--c-accent)',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            🌐 External Apply
                          </span>
                        )}
                      </td>

                      {/* ATS Score */}
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: scoreBg,
                          color: scoreColor,
                          border: `1px solid ${scoreColor}`,
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontWeight: 800,
                          fontSize: '13px'
                        }}>
                          <Sparkles size={13} />
                          {atsScore === null ? 'Not scored' : `${atsScore} ATS match`}
                        </span>
                        {atsScore === null && (
                          <div style={{ fontSize: '11px', color: 'var(--c-ink-soft)', marginTop: '4px' }}>
                            {(job.jobDescription || '').length >= 300
                              ? 'Scoring against your resume… refresh in a minute'
                              : 'No full description yet: scan it again with the extension'}
                          </div>
                        )}
                        {atsScore !== null && job.missingSkills?.length > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--c-ink-soft)', marginTop: '4px', maxWidth: 220 }}>
                            Missing: {job.missingSkills.slice(0, 4).join(', ')}{job.missingSkills.length > 4 ? '…' : ''}
                          </div>
                        )}
                      </td>

                      {/* Discovered / Posted Time */}
                      <td style={{ padding: '16px 16px', fontSize: '13px', color: 'var(--c-ink-soft)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 500, color: 'var(--c-ink)' }}>
                            {job.postedTime || 'Recently'}
                          </span>
                          <span style={{ fontSize: '11px' }}>
                            {job.postedAt ? `Posted ~${new Date(job.postedAt).toLocaleDateString()}` : ''}
                            {job.postedAt && job.createdAt ? ' · ' : ''}
                            {job.createdAt ? `Found ${new Date(job.createdAt).toLocaleDateString()}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: job.status === 'queued' ? 'var(--c-brand-tint)' : job.status === 'applied' ? 'var(--c-go-soft)' : 'var(--c-surface-alt)',
                          color: job.status === 'queued' ? 'var(--c-brand)' : job.status === 'applied' ? 'var(--c-go)' : 'var(--c-ink-soft)',
                          border: `1px solid ${job.status === 'queued' ? 'var(--c-brand)' : job.status === 'applied' ? 'var(--c-go)' : 'var(--c-line)'}`
                        }}>
                          {job.status || 'new'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {/* Preview Tailored PDF */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenPdfPreview(job)}
                            title="Preview Algorithm-Tailored ATS Resume PDF for this job"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              color: 'var(--c-brand)',
                              borderColor: 'var(--c-brand-tint)'
                            }}
                          >
                            <FileText size={14} />
                            <span>Preview PDF</span>
                          </button>

                          {/* Move to 9 AM Queue */}
                          <button
                            type="button"
                            className="btn btn-sm"
                            disabled={queuingId === jobKey || job.status === 'queued'}
                            onClick={() => setEmailDraft({ id: jobKey, value: '', error: '' })}
                            title="Queue this job for scheduled 9:00 AM outreach email dispatch"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: job.status === 'queued' ? 'var(--c-brand-tint)' : 'var(--c-accent)',
                              color: job.status === 'queued' ? 'var(--c-brand)' : '#ffffff',
                              border: 'none',
                              opacity: job.status === 'queued' ? 0.8 : 1
                            }}
                          >
                            {queuingId === jobKey ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            <span>{job.status === 'queued' ? 'In 9 AM Queue' : 'Move to 9 AM Queue'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(job._id || job.jobId, job.title)}
                            disabled={deletingId === jobKey}
                            title="Remove job"
                            style={{ color: 'var(--c-error)', padding: '6px 8px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {emailDraft.id === jobKey && (
                          <form
                            onSubmit={(e) => { e.preventDefault(); handleQueueTarget(job); }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', alignItems: 'flex-end' }}
                          >
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <input
                                type="email"
                                className="form-input"
                                autoFocus
                                placeholder="recruiter@company.com"
                                aria-label={`Recruiter email for ${job.title}`}
                                value={emailDraft.value}
                                onChange={(e) => setEmailDraft({ id: jobKey, value: e.target.value, error: '' })}
                                style={{ minWidth: '220px', padding: '6px 10px', fontSize: '12px' }}
                              />
                              <button type="submit" className="btn btn-primary btn-sm" disabled={queuingId === jobKey}>Queue</button>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEmailDraft({ id: null, value: '', error: '' })}>Cancel</button>
                            </div>
                            {emailDraft.error && <span role="alert" style={{ fontSize: '11px', color: 'var(--c-error)' }}>{emailDraft.error}</span>}
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {jobs.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: 'var(--c-surface-alt)',
            borderTop: '1px solid var(--c-line)',
            fontSize: '13px',
            color: 'var(--c-ink-soft)'
          }}>
            <div>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, paginationInfo.total)} of {paginationInfo.total} jobs
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!paginationInfo.hasPrevPage}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span style={{ fontWeight: 600, color: 'var(--c-ink)', padding: '0 8px' }}>
                Page {page} of {paginationInfo.totalPages}
              </span>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!paginationInfo.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Algorithm-Tailored ATS PDF Resume Preview Modal */}
      {pdfModalOpen && (
        <div className="modal-overlay" onClick={handleClosePdfModal}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '920px', 
              width: '92%', 
              height: '88vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '24px', 
              boxSizing: 'border-box',
              background: 'var(--c-surface)'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid var(--c-line)', 
              flexShrink: 0 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  margin: 0,
                  color: 'var(--c-ink)'
                }}>
                  <Sparkles color="var(--c-accent)" size={20} />
                  <span>Algorithm-Tailored ATS PDF Resume Preview</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--c-ink-soft)' }}>
                  Tailored specifically for: <strong>{pdfModalJob?.title}</strong> at <strong>{pdfModalJob?.company}</strong> {typeof pdfModalJob?.atsScore === 'number' ? `(ATS ${pdfModalJob.atsScore}/100)` : ''}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleDownloadFromPdfModal}
                  disabled={!pdfModalUrl || pdfModalLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm" 
                  onClick={handleClosePdfModal}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Body with Full Height Iframe */}
            <div style={{ 
              flex: 1, 
              width: '100%', 
              height: '100%', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              border: '1px solid var(--c-line)', 
              background: 'var(--c-surface-alt)', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {pdfModalLoading ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--c-ink-soft)' }}>
                  <Loader2 size={32} className="spin" color="var(--c-brand)" />
                  <div style={{ fontWeight: 600, color: 'var(--c-ink)' }}>Compiling algorithm-tailored ATS PDF resume...</div>
                  <div style={{ fontSize: '12px', color: 'var(--c-ink-soft)' }}>Ranking bullets by relevance and fitting to one page</div>
                </div>
              ) : pdfModalUrl ? (
                <iframe
                  title="Tailored Resume PDF Preview"
                  src={pdfModalUrl}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    flex: 1,
                    minHeight: '580px', 
                    display: 'block', 
                    border: 'none' 
                  }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-error)' }}>
                  Failed to load PDF preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
