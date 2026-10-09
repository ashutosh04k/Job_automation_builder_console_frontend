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
  Filter
} from 'lucide-react';

export default function JobTargetTab() {
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

  // Preview modal state
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

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
      const res = await fetch(`/api/targets?${query.toString()}`);
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
      showNotification('error', 'Backend server unreachable. Ensure server is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Form: Save Email + Job Description to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !jobDescription) {
      showNotification('error', 'Please fill in both Email and Job Description fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/targets', {
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
        setPage(1); // Jump to first page to see newly added item
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
    showNotification('success', `⏳ Generating modified resume & dispatching email to ${recipientEmail}...`);
    try {
      const res = await fetch(`/api/targets/${targetId}/trigger`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `🎉 Email process complete: ${data.outcome.result.message}`);
        fetchTargets(page, limit, search);
      } else {
        showNotification('error', data.error || 'Failed to send test email.');
      }
    } catch (err) {
      showNotification('error', 'Error triggering email: ' + err.message);
    }
  };

  // Trigger all daily 9 AM cron jobs
  const handleTriggerAllCron = async () => {
    showNotification('success', '⏳ Executing Daily 9:00 AM Cron Batch Job for all active targets...');
    try {
      const res = await fetch('/api/targets/trigger-all-cron', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `🎉 Batch Cron executed! Processed ${data.summary.processedCount} email targets.`);
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
      const res = await fetch(`/api/targets/${target._id}`, {
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
      const res = await fetch(`/api/targets/${targetId}`, { method: 'DELETE' });
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
  const handlePreviewResume = async (jd, role) => {
    setPreviewLoading(true);
    setShowPreviewModal(true);
    try {
      const res = await fetch('/api/resume/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, targetRole: role })
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 class="card-header-title">
              <Sparkles size={20} color="#38bdf8" /> Daily 9 AM Resume Target Automation Form
            </h2>
            <p class="card-subtitle">
              Enter target email and job description. Backend cron job will customize your resume and email it daily at 9:00 AM.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onClick={handleTriggerAllCron}>
            <Clock size={14} color="#38bdf8" /> Run 9 AM Cron Now
          </button>
        </div>

        <form onSubmit={handleSubmit} class="form-grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Input Box 1: Email */}
            <div class="form-group">
              <label class="form-label">
                <Mail size={15} color="#38bdf8" /> Recipient Email Address *
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

            {/* Target Role / Company (Helper inputs) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div class="form-group">
                <label class="form-label">
                  <Briefcase size={15} color="#818cf8" /> Target Role Title
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
                  <Building size={15} color="#34d399" /> Company Name
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
            <label class="form-label">
              <FileText size={15} color="#38bdf8" /> Target Job Description *
            </label>
            <textarea
              class="form-textarea"
              placeholder="Paste full job description requirements here (skills, tech stack, responsibilities)... The engine will modify executive summary and bullet points to match!"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {jobDescription && (
              <button
                type="button"
                class="btn btn-secondary"
                onClick={() => handlePreviewResume(jobDescription, targetRole)}
              >
                <Eye size={16} /> Preview Modified Resume
              </button>
            )}
            <button type="submit" class="btn btn-primary" disabled={submitting}>
              <Send size={16} /> {submitting ? 'Saving to Backend...' : 'Save Target & Schedule Daily 9 AM Mail'}
            </button>
          </div>
        </form>
      </div>

      {/* Target Entries Data Table with Pagination & Search Controls */}
      <div class="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 class="card-header-title">
              <Mail size={18} color="#34d399" /> Saved Automation Entries ({paginationInfo.total})
            </h3>
            <p class="card-subtitle" style={{ marginBottom: 0 }}>
              Active targets scheduled for daily 9:00 AM modified resume dispatch.
            </p>
          </div>

          {/* Search Input & Limit Selector Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
        </div>

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
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((target) => (
                    <tr key={target._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{target.email}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Created: {new Date(target.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#38bdf8' }}>{target.targetRole}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{target.companyName}</div>
                      </td>

                      <td>
                        <div style={{ 
                          maxWidth: '240px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          fontSize: '13px', 
                          color: '#cbd5e1' 
                        }}>
                          {target.jobDescription}
                        </div>
                      </td>

                      <td>
                        <span style={{ 
                          fontFamily: 'var(--font-code)', 
                          fontSize: '12px', 
                          background: 'rgba(255,255,255,0.06)', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          color: '#38bdf8' 
                        }}>
                          0 9 * * * (9 AM)
                        </span>
                      </td>

                      <td>
                        <span class={`status-badge ${target.isActive ? 'badge-active' : 'badge-paused'}`}>
                          {target.isActive ? '✓ Active 9 AM' : 'Paused'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700 }}>{target.totalSentCount || 0} times</div>
                        {target.lastSentAt && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Last: {new Date(target.lastSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            class="btn btn-primary btn-sm"
                            onClick={() => handleTriggerNow(target._id, target.email)}
                            title="Trigger instant test email send now"
                          >
                            <Send size={12} /> Send Email Now
                          </button>

                          <button
                            class="btn btn-secondary btn-sm"
                            onClick={() => handlePreviewResume(target.jobDescription, target.targetRole)}
                            title="Preview tailored HTML resume"
                          >
                            <Eye size={12} />
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
                Showing <strong style={{ color: '#f8fafc' }}>{startEntryIndex}</strong> to <strong style={{ color: '#f8fafc' }}>{endEntryIndex}</strong> of <strong style={{ color: '#38bdf8' }}>{paginationInfo.total}</strong> entries
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

      {/* Resume Live HTML Preview Modal */}
      {showPreviewModal && (
        <div class="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles color="#38bdf8" size={18} /> Modified Resume Live HTML Preview
              </h3>
              <button class="btn btn-secondary btn-sm" onClick={() => setShowPreviewModal(false)}>✕ Close</button>
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
