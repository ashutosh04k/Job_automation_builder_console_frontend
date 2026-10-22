import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  FileText, 
  Clock, 
  Trash2, 
  Play, 
  Pause, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Briefcase,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Download,
  ExternalLink
} from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { resumeFileName } from '../../utils/fileName';
import { useAtsScore } from '../../hooks/useAtsScore';
import AtsScorePanel from '../../components/AtsScorePanel';

// Score comes from the backend (real ATS scorer). null = not scored yet.
const scoreLabel = (score) =>
  score >= 80 ? 'Strong' : score >= 65 ? 'Good' : score >= 50 ? 'Fair' : 'Low';
const scoreTone = (score) =>
  score >= 80 ? { bg: 'var(--c-go-soft)', fg: 'var(--c-go)' }
  : score >= 65 ? { bg: 'var(--c-brand-tint)', fg: 'var(--c-brand)' }
  : score >= 50 ? { bg: 'var(--c-accent-soft)', fg: 'var(--c-accent-deep)' }
  : { bg: 'var(--c-error-soft)', fg: 'var(--c-error)' };

export default function JobTargetTab() {
  const { user } = useAuth();
  // Accordion open/close states (top closed by default, bottom open by default)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);

  // 2 Core Input Boxes + metadata state
  const [email, setEmail] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [companyName, setCompanyName] = useState('Tech Corp');

  // App states
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [sendingStatus, setSendingStatus] = useState({});
  
  // Pagination & Search states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false
  });

  // HTML Preview modal state
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ATS Tailored PDF Preview Modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalUrl, setPdfModalUrl] = useState(null);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const [pdfModalTarget, setPdfModalTarget] = useState(null);

  // Fetch targets when page, limit, or search changes
  useEffect(() => {
    fetchTargets(page, limit, search);
  }, [page, limit, search]);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchTargets = async (currentPage = page, currentLimit = limit, currentSearch = search) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
        search: currentSearch
      });
      const res = await authFetch(apiUrl(`/api/targets?${query.toString()}`));
      const data = await res.json();
      if (data.success) {
        setTargets(data.data || []);
        setPaginationInfo({
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasPrevPage: data.hasPrevPage || false,
          hasNextPage: data.hasNextPage || false
        });
      } else {
        showNotification('error', data.error || 'Failed to fetch job targets.');
      }
    } catch (err) {
      showNotification('error', 'Backend server unreachable. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Form: Save Email + Job Description to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('error', 'Please provide a Recipient Email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch(apiUrl('/api/targets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          jobDescription,
          targetRole,
          companyName
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', '✅ Target saved! Daily 9:00 AM Cron Email active for ' + email);
        setEmail('');
        setJobDescription('');
        setPage(1);
        fetchTargets(1, limit, search);
      } else {
        showNotification('error', data.error || 'Failed to save target.');
      }
    } catch (err) {
      showNotification('error', 'Network error saving target: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger manual test email for a target now
  const handleTriggerNow = async (targetId, recipientEmail) => {
    setSendingStatus(prev => ({ ...prev, [targetId]: 'sending' }));
    showNotification('success', `⏳ Generating modified resume & dispatching email to ${recipientEmail}...`);
    try {
      const res = await authFetch(apiUrl(`/api/targets/${targetId}/trigger`), { method: 'POST' });
      const data = await res.json();
      if (data.success && data.outcome?.result?.success) {
        showNotification('success', `🎉 Email process complete: ${data.outcome?.result?.message || 'Email sent!'}`);
        setSendingStatus(prev => ({ ...prev, [targetId]: 'sent' }));
        fetchTargets(page, limit, search);
      } else {
        const errMsg = data.outcome?.result?.message || data.error || 'Failed to send test email.';
        showNotification('error', `❌ ${errMsg}`);
        setSendingStatus(prev => ({ ...prev, [targetId]: 'failed' }));
      }
    } catch (err) {
      showNotification('error', 'Error triggering email: ' + err.message);
      setSendingStatus(prev => ({ ...prev, [targetId]: 'failed' }));
    } finally {
      setTimeout(() => {
        setSendingStatus(prev => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });
      }, 3000);
    }
  };

  // Full ATS report for the target open in the PDF modal
  const modalAts = useAtsScore({ targetId: pdfModalTarget?._id || null, enabled: Boolean(pdfModalTarget?._id) });

  // Recompute stored ATS scores for all targets (e.g. after editing the master resume)
  const [rescoring, setRescoring] = useState(false);
  const handleRescoreAll = async () => {
    setRescoring(true);
    try {
      const res = await authFetch(apiUrl('/api/targets/rescore'), { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Rescore failed');
      showNotification('success', `ATS scores refreshed for ${data.total} target(s).`);
      fetchTargets(page, limit, search);
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setRescoring(false);
    }
  };

  // Trigger all daily 9 AM cron jobs
  const handleTriggerAllCron = async () => {
    showNotification('success', '⏳ Executing Daily 9:00 AM Cron Batch Job for all active targets...');
    try {
      const res = await authFetch(apiUrl('/api/targets/trigger-all-cron'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Daily run finished: ${data.summary?.processedCount || 0} new target(s) emailed. Already-sent targets are skipped.`);
        fetchTargets(page, limit, search);
      } else {
        showNotification('error', data.error || 'Cron batch failed.');
      }
    } catch (err) {
      showNotification('error', 'Cron trigger error: ' + err.message);
    }
  };

  // Toggle Target Active State
  const handleToggleActive = async (target) => {
    try {
      const res = await authFetch(apiUrl(`/api/targets/${target._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !target.isActive })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Cron job for ${target.email} is now ${!target.isActive ? 'Active' : 'Paused'}.`);
        fetchTargets(page, limit, search);
      }
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Delete Target
  const handleDelete = async (targetId) => {
    if (!window.confirm('Are you sure you want to delete this target entry?')) return;
    try {
      const res = await authFetch(apiUrl(`/api/targets/${targetId}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Job target deleted.');
        fetchTargets(page, limit, search);
      }
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Preview Tailored Resume Output
  const handlePreviewResume = async (jd, role, company = '') => {
    setPreviewLoading(true);
    setShowPreviewModal(true);
    try {
      const res = await authFetch(apiUrl('/api/resume/preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, targetRole: role, companyName: company })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.data);
      }
    } catch (err) {
      showNotification('error', 'Failed to generate preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Open Algorithm-Tailored ATS PDF Resume in Modal
  const handleOpenPdfPreview = async (target) => {
    setPdfModalTarget(target);
    setPdfModalOpen(true);
    setPdfModalLoading(true);
    if (pdfModalUrl) {
      window.URL.revokeObjectURL(pdfModalUrl);
      setPdfModalUrl(null);
    }
    try {
      showNotification('success', '⏳ Compiling ATS tailored PDF resume preview...');
      const res = await authFetch(apiUrl(`/api/resume/tailored-pdf/${target._id}`));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate tailored PDF preview');
      }
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

  // Close Tailored PDF Preview Modal
  const handleClosePdfModal = () => {
    setPdfModalOpen(false);
    if (pdfModalUrl) {
      window.URL.revokeObjectURL(pdfModalUrl);
      setPdfModalUrl(null);
    }
    setPdfModalTarget(null);
    fetchTargets(page, limit, search);
  };

  // Download PDF from inside Preview Modal
  const handleDownloadFromPdfModal = () => {
    if (!pdfModalUrl || !pdfModalTarget) return;
    const a = document.createElement('a');
    a.href = pdfModalUrl;
    a.download = resumeFileName(user?.name, pdfModalTarget.targetRole, pdfModalTarget.companyName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showNotification('success', '📄 ATS Tailored Resume PDF downloaded!');
  };

  // Download Tailored PDF for a stored target
  const handleDownloadTailoredPdf = async (targetId, role) => {
    try {
      showNotification('success', '⏳ Compiling ATS tailored PDF resume...');
      const res = await authFetch(apiUrl(`/api/resume/tailored-pdf/${targetId}`));
      if (!res.ok) throw new Error('Failed to generate tailored PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeFileName(user?.name, role);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('success', '📄 ATS Tailored Resume PDF downloaded!');
    } catch (err) {
      showNotification('error', 'Error downloading tailored PDF: ' + err.message);
    }
  };

  // Download Tailored PDF directly from preview inputs
  const handleDownloadDirectPdf = async (role, company, jd) => {
    try {
      showNotification('success', '⏳ Compiling ATS tailored PDF resume...');
      const res = await authFetch(apiUrl('/api/resume/tailored-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: role, companyName: company, jobDescription: jd })
      });
      if (!res.ok) throw new Error('Failed to generate tailored PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeFileName(user?.name, role);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('success', '📄 ATS Tailored Resume PDF downloaded!');
    } catch (err) {
      showNotification('error', 'Error downloading tailored PDF: ' + err.message);
    }
  };

  const startEntryIndex = (page - 1) * limit + 1;
  const endEntryIndex = Math.min(page * limit, paginationInfo.total);

  return (
    <div>
      {toast && (
        <div class={`toast-msg ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Primary Section: 2 Input Box Form for Admin Panel */}
      <div class="glass-card" style={{ border: '1px solid var(--border-highlight)' }}>
        <div 
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            userSelect: 'none',
            marginBottom: isFormOpen ? '16px' : 0 
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 class="card-header-title">
              <Sparkles size={20} color="var(--c-accent)" /> Daily 9 AM Resume Target Automation Form
            </h2>
            <p class="card-subtitle" style={{ marginBottom: 0 }}>
              Enter target email and job description. Backend cron job will customize your resume and email it daily at 9:00 AM.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerAllCron();
              }}
            >
              <Clock size={14} color="var(--c-brand)" /> Run 9 AM Cron Now
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={rescoring}
              onClick={(e) => {
                e.stopPropagation();
                handleRescoreAll();
              }}
              title="Recalculate ATS scores against your current master resume"
            >
              <Sparkles size={14} color="var(--c-brand)" /> {rescoring ? 'Rescoring…' : 'Rescore ATS'}
            </button>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.04)',
                transform: isFormOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease'
              }}
            >
              <ChevronDown size={18} color="var(--c-ink-soft)" />
            </div>
          </div>
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} class="form-grid" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--c-line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Input Box 1: Email */}
              <div class="form-group">
                <label class="form-label">
                  <Mail size={15} color="var(--c-brand)" /> Recipient Email Address *
                </label>
                <input
                  type="email"
                  class="form-input"
                  placeholder="e.g. recruiter@company.com or your_email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Target Role / Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div class="form-group">
                  <label class="form-label">
                    <Briefcase size={15} color="var(--c-brand)" /> Target Role Title
                  </label>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="e.g. Senior Frontend Lead"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <Building size={15} color="var(--c-brand)" /> Company Name
                  </label>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Input Box 2: Job Description */}
            <div class="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label class="form-label" style={{ marginBottom: 0 }}>
                  <FileText size={15} color="var(--c-brand)" /> Target Job Description
                </label>
                <span style={{ fontSize: '11px', color: 'var(--c-ink-soft)' }}>Optional</span>
              </div>
              <textarea
                class="form-textarea"
                placeholder="Paste full job description requirements here (optional: skills, tech stack, responsibilities)... If left blank, your default master resume pitch will be used."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                class="btn btn-secondary"
                onClick={() => handlePreviewResume(jobDescription, targetRole, companyName)}
              >
                <Eye size={16} /> Preview Modified Resume
              </button>
              <button type="submit" class="btn btn-primary" disabled={submitting}>
                <Send size={16} /> {submitting ? 'Saving to Backend...' : 'Save Target & Schedule Daily 9 AM Mail'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Target Entries Data Table with Pagination & Search Controls */}
      <div class="glass-card">
        <div 
          onClick={() => setIsTableOpen(!isTableOpen)}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            userSelect: 'none',
            marginBottom: isTableOpen ? '20px' : 0, 
            flexWrap: 'wrap', 
            gap: '16px' 
          }}
        >
          <div>
            <h3 class="card-header-title">
              <Mail size={18} color="#34d399" /> Saved Automation Entries ({paginationInfo.total})
            </h3>
            <p class="card-subtitle" style={{ marginBottom: 0 }}>
              Active targets scheduled for daily 9:00 AM modified resume dispatch.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input & Limit Selector Bar */}
            <div 
              style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  class="form-input"
                  placeholder="Search targets..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  style={{ paddingLeft: '34px', paddingRight: '12px', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Per page:</span>
                <select
                  class="form-select"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{ width: '70px', height: '38px', padding: '4px 8px', fontSize: '13px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button class="btn btn-secondary btn-sm" onClick={() => fetchTargets(page, limit, search)} disabled={loading} style={{ height: '38px' }}>
                Refresh
              </button>
            </div>

            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.04)',
                transform: isTableOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease'
              }}
            >
              <ChevronDown size={18} color="var(--c-ink-soft)" />
            </div>
          </div>
        </div>

        {isTableOpen && (
          <div style={{ marginTop: '4px', paddingTop: '16px', borderTop: '1px solid var(--c-line)' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading targets...</div>
        ) : targets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px border-color' }}>
            <Mail size={36} color="#64748b" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', color: '#f8fafc' }}>No Job Targets Found</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              {search ? `No entries match search query "${search}".` : 'Fill out the 2 input boxes above to store your first automation entry!'}
            </p>
          </div>
        ) : (
          <div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Recipient Email</th>
                    <th>Role & Company</th>
                    <th>Job Description Snippet</th>
                    <th>Cron Schedule</th>
                    <th>Status</th>
                    <th>Total Sent</th>
                    <th>ATS Score</th>
                    <th>Email Opens</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((target) => (
                    <tr key={target._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#757575ff' }}>{target.email}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Created: {new Date(target.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#38bdf8',whiteSpace:'nowrap' }}>{target.targetRole}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8',whiteSpace:'nowrap' }}>{target.companyName}</div>
                      </td>

                      <td>
                        <div style={{ 
                          maxWidth: '240px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          fontSize: '13px', 
                          color: '#464747ff' 
                        }}>
                          {target.jobDescription ? (
                            target.jobDescription
                          ) : (
                            <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>Standard Outreach (No JD)</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span style={{ 
                          fontFamily: 'var(--font-code)', 
                          fontSize: '12px', 
                          background: 'rgba(255,255,255,0.06)', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          color: '#38bdf8',
                          whiteSpace:'nowrap'
                        }}>
                          0 9 * * * (9 AM)
                        </span>
                      </td>

                      <td>
                        {(() => {
                          const st = !target.isActive ? 'paused' : (target.status || 'active');
                          const text = { completed: '✓ Sent', error: 'Send failed', paused: 'Paused', active: 'Queued' }[st] || 'Queued';
                          return (
                            <span className={`status-badge ${st === 'paused' || st === 'error' ? 'badge-paused' : 'badge-active'}`} style={{ whiteSpace: 'nowrap' }}>
                              {text}
                            </span>
                          );
                        })()}
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--c-ink)' }}>{target.totalSentCount || 0} times</div>
                        {target.lastSentAt && (
                          <div style={{ fontSize: '11px', color: 'var(--c-ink-soft)', whiteSpace: 'nowrap' }}>
                            Last: {new Date(target.lastSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      {/* ATS Score Column next to Total Sent */}
                      <td>
                        {typeof target.atsScore === 'number' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPdfPreview(target)}
                            title="Open the tailored PDF and full ATS breakdown"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                          >
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px',
                              background: scoreTone(target.atsScore).bg, color: scoreTone(target.atsScore).fg,
                              border: '1px solid var(--c-line)', fontWeight: 800, fontSize: '12px', whiteSpace: 'nowrap'
                            }}>
                              <Sparkles size={12} /> {target.atsScore}
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--c-ink-soft)', marginTop: '3px', whiteSpace: 'nowrap' }}>
                              {scoreLabel(target.atsScore)} match
                            </span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--c-ink-soft)' }} title="Not scored yet. Use “Rescore ATS”.">—</span>
                        )}
                      </td>

                      <td>
                        {target.isOpened ? (
                          <div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#4ade80',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}>
                              <Eye size={12} /> Opened ({target.openCount || 1}x)
                            </span>
                            {target.lastOpenedAt && (
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', whiteSpace: 'nowrap' }}>
                                {new Date(target.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(target.lastOpenedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                            {target.clickCount > 0 && (
                              <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '2px', whiteSpace: 'nowrap' }}>
                                🔗 {target.clickCount} link click{target.clickCount > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(148, 163, 184, 0.1)',
                              color: '#94a3b8',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              whiteSpace: 'nowrap'
                            }}>
                              Not opened yet
                            </span>
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end',whiteSpace:'nowrap' }}>
                          {(() => {
                            const status = sendingStatus[target._id];
                            const isSending = status === 'sending';
                            const isSent = status === 'sent';
                            const isFailed = status === 'failed';
                            const isBusy = Boolean(status);

                            return (
                              <button
                                className={`btn btn-sm ${!status ? 'btn-primary' : ''}`}
                                style={{
                                  background: isSent ? '#16a34a' : isFailed ? '#dc2626' : isSending ? 'rgba(56, 189, 248, 0.2)' : undefined,
                                  borderColor: isSent ? '#22c55e' : isFailed ? '#ef4444' : isSending ? '#38bdf8' : undefined,
                                  color: isSent || isFailed ? '#ffffff' : isSending ? '#38bdf8' : undefined,
                                  minWidth: '135px',
                                  justifyContent: 'center',
                                  cursor: isBusy ? 'not-allowed' : 'pointer',
                                  opacity: isSending ? 0.9 : 1,
                                  transition: 'all 0.25s ease'
                                }}
                                disabled={isBusy}
                                onClick={() => handleTriggerNow(target._id, target.email)}
                                title={isBusy ? 'Email operation in progress...' : 'Trigger instant test email send now'}
                              >
                                {isSending ? (
                                  <>
                                    <Loader2 size={13} className="spin-animation" />
                                    <span>Sending...</span>
                                  </>
                                ) : isSent ? (
                                  <>
                                    <CheckCircle2 size={13} />
                                    <span>Sent!</span>
                                  </>
                                ) : isFailed ? (
                                  <>
                                    <AlertCircle size={13} />
                                    <span>Failed</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={12} />
                                    <span>Send Email Now</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--c-accent)', borderColor: 'rgba(255,122,89,0.35)', padding: '4px 10px', gap: '5px', display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}
                            onClick={() => handleOpenPdfPreview(target)}
                            title="Preview algorithm-tailored ATS PDF resume in modal"
                          >
                            <Eye size={13} color="var(--c-accent)" /> Preview PDF
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handlePreviewResume(target.jobDescription, target.targetRole, target.companyName)}
                            title="Preview tailored email message & pitch"
                          >
                            <Mail size={12} /> Email Pitch
                          </button>

                          <button
                            class="btn btn-secondary btn-sm"
                            onClick={() => handleToggleActive(target)}
                            title={target.isActive ? 'Pause Cron' : 'Activate Cron'}
                          >
                            {target.isActive ? <Pause size={12} color="#fbbf24" /> : <Play size={12} color="#34d399" />}
                          </button>

                          <button
                            class="btn btn-danger btn-sm"
                            onClick={() => handleDelete(target._id)}
                            title="Delete Target"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div style={{ 
              display: 'flex', 
              justify: 'space-between', 
              alignItems: 'center', 
              marginTop: '20px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Showing <strong style={{ color: '#606264ff' }}>{startEntryIndex}</strong> to <strong style={{ color: '#606264ff' }}>{endEntryIndex}</strong> of <strong style={{ color: '#38bdf8' }}>{paginationInfo.total}</strong> entries
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  class="btn btn-secondary btn-sm"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={!paginationInfo.hasPrevPage || loading}
                  style={{ opacity: !paginationInfo.hasPrevPage ? 0.5 : 1, padding: '6px 12px' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: pNum === page ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: pNum === page ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: pNum === page ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  class="btn btn-secondary btn-sm"
                  onClick={() => setPage(prev => Math.min(prev + 1, paginationInfo.totalPages))}
                  disabled={!paginationInfo.hasNextPage || loading}
                  style={{ opacity: !paginationInfo.hasNextPage ? 0.5 : 1, padding: '6px 12px' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      {/* ATS Tailored PDF Preview Modal */}
      {pdfModalOpen && (
        <div className="modal-overlay" onClick={handleClosePdfModal}>
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '960px', 
              width: '94vw', 
              maxHeight: '94vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-ink)', margin: 0 }}>
                  <FileText size={20} color="var(--c-accent)" /> Algorithm-Tailored ATS Resume Preview
                </h3>
                {pdfModalTarget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', color: 'var(--c-ink-soft)', margin: 0 }}>
                      Target: <strong style={{ color: 'var(--c-ink)' }}>{pdfModalTarget.targetRole || 'Software Developer'}</strong>
                      {pdfModalTarget.companyName && <span> at <strong style={{ color: 'var(--c-ink)' }}>{pdfModalTarget.companyName}</strong></span>}
                      {' '}&bull; <span style={{ color: 'var(--c-accent)' }}>{pdfModalTarget.email}</span>
                    </p>
                    {modalAts.report?.score != null && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '5px',
                        background: scoreTone(modalAts.report.score).bg, color: scoreTone(modalAts.report.score).fg,
                        border: '1px solid var(--c-line)', fontWeight: 800, fontSize: '11px'
                      }}>
                        <Sparkles size={11} /> ATS {modalAts.report.score}/100
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {pdfModalUrl && (
                  <>
                    <a
                      href={pdfModalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <ExternalLink size={14} /> Open in Tab
                    </a>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleDownloadFromPdfModal}
                      style={{ gap: '6px' }}
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleClosePdfModal}
                  style={{ padding: '6px 12px' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Body: PDF viewer + ATS report */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ 
              flex: '1 1 520px',
              minWidth: 0,
              height: 'calc(94vh - 120px)', 
              minHeight: '620px', 
              borderRadius: '10px', 
              overflow: 'hidden', 
              border: '1px solid rgba(100, 116, 139, 0.25)', 
              background: '#1e293b', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {pdfModalLoading ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#94a3b8' }}>
                  <div className="pulse-dot" style={{ width: '12px', height: '12px' }}></div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>Compiling algorithm-tailored ATS PDF resume...</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Ranking bullets by relevance, mirroring the JD's skill names, fitting to one page</div>
                </div>
              ) : pdfModalUrl ? (
                <iframe
                  title="Tailored Resume PDF Preview"
                  src={pdfModalUrl}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    flex: 1,
                    minHeight: '620px', 
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
            <div style={{ flex: '1 1 300px', maxWidth: '100%', maxHeight: 'calc(94vh - 120px)', overflowY: 'auto' }}>
              <AtsScorePanel status={modalAts.status} report={modalAts.report} error={modalAts.error} onRetry={modalAts.refresh} compact />
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Live HTML Preview Modal */}
      {showPreviewModal && (
        <div class="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles color="#38bdf8" size={18} /> Modified Resume Live HTML Preview
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', gap: '6px' }}
                  onClick={() => handleDownloadDirectPdf(targetRole, companyName, jobDescription)}
                >
                  <FileText size={14} /> Download Tailored ATS PDF
                </button>
                <button class="btn btn-secondary btn-sm" onClick={() => setShowPreviewModal(false)}>✕ Close</button>
              </div>
            </div>

            {previewLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Generating tailored preview...</div>
            ) : previewData ? (
              <div>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <strong style={{ color: '#38bdf8' }}>Subject Line:</strong> {previewData.subjectLine}
                </div>

                <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>
                  <iframe
                    title="Resume HTML Preview"
                    srcDoc={previewData.htmlTemplate}
                    style={{ width: '100%', height: '520px', border: 'none' }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
