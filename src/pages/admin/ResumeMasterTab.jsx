import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Code, 
  Building, 
  GraduationCap, 
  FolderGit2,
  UploadCloud,
  FileCheck,
  Download,
  Eye,
  AlertCircle,
  ExternalLink,
  ScanText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl, authFetch } from '../../config/api';
import ResumeSectionsEditor from '../../components/ResumeSectionsEditor';
import { applyDraft, countDraft } from '../../utils/resumeDraft';

export default function ResumeMasterTab() {
  const { user } = useAuth();
  const [resume, setResume] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    title: '',
    summary: '',
    website: '',
    resumeUrl: '',
    linkedin: '',
    github: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: []
  });

  // PDF -> structured draft (reviewed before it is applied and saved)
  const [importState, setImportState] = useState({ status: 'idle', result: null, error: '' });

  // PDF Upload States
  const [pdfStatus, setPdfStatus] = useState({ hasCustomPdf: false });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchResume();
    fetchPdfStatus();
  }, [user?.id]);

  const showNotification = (type, message) => {
    setMsg({ type, text: message });
    setTimeout(() => setMsg(null), 5000);
  };

  const fetchResume = async () => {
    setLoadingResume(true);
    try {
      const res = await authFetch(apiUrl('/api/resume'));
      const data = await res.json();
      if (data.success && data.data) {
        setResume({
          ...data.data,
          fullName: data.data.fullName || user?.name || '',
          email: data.data.email || user?.email || '',
          phone: data.data.phone || '',
          location: data.data.location || '',
          title: data.data.title || '',
          summary: data.data.summary || '',
          website: data.data.website || '',
          resumeUrl: data.data.resumeUrl || data.data.website || '',
          linkedin: data.data.linkedin || '',
          github: data.data.github || '',
          skills: data.data.skills || [],
          experience: data.data.experience || [],
          education: data.data.education || [],
          projects: data.data.projects || [],
          certifications: data.data.certifications || [],
          achievements: data.data.achievements || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResume(false);
    }
  };

  const fetchPdfStatus = async () => {
    try {
      const res = await authFetch(apiUrl('/api/resume/pdf-status'));
      const data = await res.json();
      setPdfStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload Custom PDF Resume handler
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('error', 'Please select a PDF file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resumePdf', selectedFile);

    setUploadingPdf(true);
    try {
      const res = await authFetch(apiUrl('/api/resume/upload-pdf'), {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setSelectedFile(null);
        fetchPdfStatus();
      } else {
        showNotification('error', data.error || 'PDF upload failed.');
      }
    } catch (err) {
      showNotification('error', 'Upload error: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  // Extract experience/skills/... from the chosen PDF, or from the PDF uploaded earlier.
  const handleExtract = async () => {
    setImportState({ status: 'loading', result: null, error: '' });
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('resumePdf', selectedFile);
      const res = await authFetch(apiUrl('/api/resume/parse-pdf'), { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `Extraction failed (${res.status})`);
      setImportState({ status: 'review', result: data.data, error: '' });
    } catch (err) {
      setImportState({ status: 'error', result: null, error: err.message });
    }
  };

  const handleApplyDraft = () => {
    setResume((r) => applyDraft(r, importState.result.draft));
    setImportState({ status: 'applied', result: importState.result, error: '' });
    showNotification('success', 'Extracted content loaded below. Review it, then click "Save master resume".');
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(apiUrl('/api/resume'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `Save failed (${res.status})`);
      setResume((r) => ({ ...r, ...data.data }));
      if (importState.status === 'applied') setImportState({ status: 'idle', result: null, error: '' });
      showNotification('success', 'Master resume saved. Tailored resumes and ATS scores now use this version.');
    } catch (err) {
      showNotification('error', 'Could not save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {msg && (
        <div className={`toast-msg ${msg.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {loadingResume && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', marginBottom: '16px' }}>
          <div className="pulse-dot"></div>
          <span>Loading your personal master resume...</span>
        </div>
      )}

      {/* Upload Custom PDF Resume Card */}
      <div className="glass-card" style={{ border: '1px solid var(--border-highlight)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.5) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-header-title">
              <UploadCloud size={22} color="#38bdf8" /> Upload Your Own PDF Resume
            </h2>
            <p className="card-subtitle" style={{ marginBottom: 0 }}>
              Upload your custom PDF resume file. This exact PDF will automatically be attached as <strong>{pdfStatus.filename || `${(resume.fullName || 'My').replace(/\s+/g, '_')}_Resume.pdf`}</strong> to every outgoing daily job email!
            </p>
          </div>

          {pdfStatus.hasCustomPdf && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span class="status-badge badge-active" style={{ fontSize: '13px', padding: '6px 14px' }}>
                <FileCheck size={14} /> Custom PDF Active ({pdfStatus.size})
              </span>
              <a 
                href={apiUrl(`/api/resume/download-pdf${localStorage.getItem('autoresume_token') ? `?token=${encodeURIComponent(localStorage.getItem('autoresume_token'))}` : ''}`)} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
                title="Preview/Download active custom PDF"
              >
                <Eye size={14} /> View Active PDF
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handlePdfUpload} style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="form-input"
            style={{ maxWidth: '420px', padding: '10px 14px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={uploadingPdf || !selectedFile}>
            <UploadCloud size={16} /> {uploadingPdf ? 'Uploading PDF...' : 'Upload & Set Active PDF'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExtract}
            disabled={importState.status === 'loading' || (!selectedFile && !pdfStatus.hasCustomPdf)}
            title="Read experience, skills, education and projects from the PDF into the editor below"
          >
            <ScanText size={16} /> {importState.status === 'loading' ? 'Extracting…' : `Extract content from ${selectedFile ? 'this' : 'uploaded'} PDF`}
          </button>
        </form>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(255, 255, 255, 0.82)' }}>
          Tailored resumes are built from the sections below, not from the PDF file. Extract once, review, then save.
        </p>

        {importState.status === 'error' && (
          <div role="alert" style={{ marginTop: 14, color: '#fecaca', display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {importState.error}
          </div>
        )}

        {importState.status === 'review' && importState.result && (() => {
          const { draft, warnings, unparsed, pages } = importState.result;
          const c = countDraft(draft);
          return (
            <div style={{ marginTop: 16, border: '1px solid var(--c-line)', borderRadius: 10, padding: 14, background: 'var(--c-surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong style={{ color: 'var(--c-ink)' }}>Found in your {pages}-page PDF</strong>
              <div style={{ fontSize: 13, color: 'var(--c-ink)' }}>
                {draft.fullName || 'No name'} · {c.roles} roles · {c.bullets} bullets · {c.skills} skills · {c.education} education · {c.projects} projects
                {(draft.certifications?.length || 0) + (draft.achievements?.length || 0) > 0 && ` · ${draft.certifications.length + draft.achievements.length} certifications/achievements`}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--c-ink-soft)' }}>
                {draft.experience.map((e, i) => <li key={i}>{e.role || '—'} at {e.company || '—'} ({e.period || 'no dates'}) · {e.highlights.length} bullets</li>)}
              </ul>
              {warnings.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--c-accent-deep)' }}>
                  <strong>Check these:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
                </div>
              )}
              {unparsed.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>Not imported (no matching section): {unparsed.join(' · ')}</div>
              )}
              <p style={{ fontSize: 12, color: 'var(--c-ink-soft)', margin: 0 }}>
                Applying replaces the Experience, Skills, Education, Projects and Certifications sections below. Nothing is saved until you click "Save master resume".
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyDraft}>Apply to editor</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setImportState({ status: 'idle', result: null, error: '' })}>Discard</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Master Profile Form */}
      <div className="glass-card">
        <h2 className="card-header-title">
          <FileText size={20} color="#38bdf8" /> Master Resume Profile — {resume.fullName || 'My Profile'}
        </h2>
        <p className="card-subtitle">
          Contact details and summary. Your experience, skills, education and projects are edited below.
        </p>

        <form onSubmit={handleSave} class="form-grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div class="form-group">
              <label class="form-label"><User size={14} color="#38bdf8" /> Full Name</label>
              <input
                type="text"
                class="form-input"
                value={resume.fullName || ''}
                onChange={(e) => setResume({ ...resume, fullName: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Briefcase size={14} color="#818cf8" /> Professional Title</label>
              <input
                type="text"
                class="form-input"
                value={resume.title || ''}
                onChange={(e) => setResume({ ...resume, title: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Mail size={14} color="#34d399" /> Contact Email</label>
              <input
                type="email"
                class="form-input"
                value={resume.email || ''}
                onChange={(e) => setResume({ ...resume, email: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Phone size={14} color="#fbbf24" /> Phone Number</label>
              <input
                type="text"
                class="form-input"
                value={resume.phone || ''}
                onChange={(e) => setResume({ ...resume, phone: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><MapPin size={14} color="#fb7185" /> Location</label>
              <input
                type="text"
                class="form-input"
                value={resume.location || ''}
                onChange={(e) => setResume({ ...resume, location: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Code size={14} color="#38bdf8" /> Portfolio Website</label>
              <input
                type="text"
                class="form-input"
                value={resume.website || ''}
                placeholder="https://..."
                onChange={(e) => setResume({ ...resume, website: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><ExternalLink size={14} color="#a855f7" /> Resume Link (Google Drive)</label>
              <input
                type="text"
                class="form-input"
                value={resume.resumeUrl || ''}
                placeholder="https://drive.google.com/file/d/..."
                onChange={(e) => setResume({ ...resume, resumeUrl: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Code size={14} color="#818cf8" /> LinkedIn Profile</label>
              <input
                type="text"
                class="form-input"
                value={resume.linkedin || ''}
                onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Code size={14} color="#34d399" /> GitHub Profile</label>
              <input
                type="text"
                class="form-input"
                value={resume.github || ''}
                onChange={(e) => setResume({ ...resume, github: e.target.value })}
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Professional Summary</label>
            <textarea
              class="form-textarea"
              value={resume.summary || ''}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              rows={4}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" class="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving Profile...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>

      {importState.status === 'applied' && (
        <div className="glass-card" role="status" style={{ borderColor: 'var(--c-accent)', fontSize: 13 }}>
          Extracted content is loaded below but <strong>not saved yet</strong>. Review it, then click "Save master resume".
        </div>
      )}

      <ResumeSectionsEditor value={resume} onChange={setResume} />

      <div style={{ position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'flex-end', padding: '12px 0', background: 'linear-gradient(transparent, var(--c-page) 40%)' }}>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save master resume'}
        </button>
      </div>
    </div>
  );
}
