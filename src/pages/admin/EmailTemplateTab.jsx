import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Save, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  FileCheck, 
  Tag, 
  Building, 
  Briefcase,
  Copy,
  ExternalLink
} from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function EmailTemplateTab() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);

  // Live preview test variables
  const [previewRole, setPreviewRole] = useState('Senior Full Stack Engineer');
  const [previewCompany, setPreviewCompany] = useState('Google / Tech Corp');
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [activeFocusField, setActiveFocusField] = useState('body');
  const subjectInputRef = useRef(null);
  const textareaRef = useRef(null);

  const availableTags = [
    { tag: '{{name}}', label: 'Full Name', desc: 'Your display name' },
    { tag: '{{role}}', label: 'Job Role', desc: 'Target job role title (matches job posting)' },
    { tag: '{{company}}', label: 'Company Name', desc: 'Target company name' },
    { tag: '{{skills}}', label: 'Skills List', desc: 'Curated skills string' },
    { tag: '{{phone}}', label: 'Phone Number', desc: 'Your contact phone' },
    { tag: '{{email}}', label: 'Email Address', desc: 'Your contact email' },
    { tag: '{{linkedin}}', label: 'LinkedIn URL', desc: 'Your LinkedIn link' },
    { tag: '{{github}}', label: 'GitHub URL', desc: 'Your GitHub link' },
    { tag: '{{portfolio}}', label: 'Portfolio URL', desc: 'Your portfolio link' },
    { tag: '{{resume}}', label: 'Resume Link', desc: 'Your Google Drive resume link' }
  ];

  useEffect(() => {
    fetchTemplate();
  }, [user?.id]);

  useEffect(() => {
    if (subject || body) {
      updateLivePreview();
    }
  }, [subject, body, previewRole, previewCompany]);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await authFetch(apiUrl('/api/template'));
      const data = await res.json();
      if (data.success && data.data) {
        let loadedSubject = data.data.subject || '';
        if (loadedSubject === 'Full Stack Developer (3+ Years) | Open to Frontend / Full Stack Roles') {
          loadedSubject = 'Application for {{role}} at {{company}} || (3+ Years) | Open to {{role}} Roles';
        }
        setSubject(loadedSubject);
        setBody(data.data.body || '');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load email template.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      showNotification('error', 'Both Subject and Message Body are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(apiUrl('/api/template'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', '🎉 Custom email pitch saved! All outgoing emails will now use this message.');
        const updatedSub = data.data?.subject || subject;
        const updatedBody = data.data?.body || body;
        setSubject(updatedSub);
        setBody(updatedBody);
        updateLivePreview(updatedSub, updatedBody);
      } else {
        showNotification('error', data.error || 'Failed to save template.');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset this email message back to the system default cold pitch?')) return;
    setResetting(true);
    try {
      const res = await authFetch(apiUrl('/api/template/reset'), { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setSubject(data.data.subject);
        setBody(data.data.body);
        updateLivePreview(data.data.subject, data.data.body);
        showNotification('success', 'Template reset to default pitch.');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setResetting(false);
    }
  };

  const updateLivePreview = async (overrideSubject = null, overrideBody = null) => {
    const curSubject = overrideSubject !== null ? overrideSubject : subject;
    const curBody = overrideBody !== null ? overrideBody : body;
    if (!curSubject && !curBody) return;

    setPreviewLoading(true);
    try {
      const res = await authFetch(apiUrl('/api/template/preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: curSubject,
          body: curBody,
          targetRole: previewRole,
          companyName: previewCompany
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPreviewData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const insertTag = (tag) => {
    if (activeFocusField === 'subject' && subjectInputRef.current) {
      const input = subjectInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const textBefore = subject.substring(0, start);
      const textAfter = subject.substring(end);
      const newSub = textBefore + tag + textAfter;
      setSubject(newSub);

      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
      return;
    }

    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const textBefore = body.substring(0, start);
    const textAfter = body.substring(end);
    const newBody = textBefore + tag + textAfter;
    setBody(newBody);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  return (
    <div>
      {/* Toast Alert */}
      {toast && (
        <div className={`toast-msg ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', marginBottom: '16px' }}>
          <div className="pulse-dot"></div>
          <span>Loading your personalized email pitch...</span>
        </div>
      )}

      {/* Editor & Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Template Editor */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 className="card-header-title">
                <Mail size={20} color="#38bdf8" /> Cold Email Pitch Editor
              </h2>
              <p className="card-subtitle" style={{ marginBottom: 0 }}>
                This is the exact message delivered to recruiters every morning at 9:00 AM.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReset}
              disabled={resetting}
              title="Reset to default pitch"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Dynamic Placeholders Toolbar */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={12} color="#38bdf8" /> Click any tag to insert dynamic variable (into {activeFocusField === 'subject' ? 'Subject' : 'Message Body'}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {availableTags.map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => insertTag(t.tag)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    fontFamily: 'monospace',
                    background: 'rgba(56, 189, 248, 0.1)',
                    borderColor: 'rgba(56, 189, 248, 0.25)',
                    color: '#38bdf8'
                  }}
                  title={t.desc}
                >
                  {t.tag}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSave} className="form-grid">
            {/* Subject Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  <Sparkles size={14} color="#fbbf24" /> Email Subject Line
                </label>
                <span style={{ fontSize: '11px', color: '#38bdf8' }}>Uses dynamic job role</span>
              </div>
              <input
                ref={subjectInputRef}
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setActiveFocusField('subject')}
                placeholder="e.g. Application for {{role}} at {{company}} || (3+ Years) | Open to {{role}} Roles"
                required
              />
              
              {/* Dynamic Subject Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Quick Presets:</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
                  onClick={() => {
                    const sub = 'Application for {{role}} at {{company}} || (3+ Years) | Open to {{role}} Roles';
                    setSubject(sub);
                    updateLivePreview(sub, body);
                  }}
                >
                  Application for Role at Company || Open to Roles
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(255,255,255,0.04)' }}
                  onClick={() => {
                    const sub = '{{role}} (3+ Years) | Open to {{role}} Roles';
                    setSubject(sub);
                    updateLivePreview(sub, body);
                  }}
                >
                  Role (3+ Yrs) | Open to Roles
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(255,255,255,0.04)' }}
                  onClick={() => {
                    const sub = 'Application for {{role}} at {{company}} - {{name}}';
                    setSubject(sub);
                    updateLivePreview(sub, body);
                  }}
                >
                  Application for Role at Company - Name
                </button>
              </div>
            </div>

            {/* Message Body Input */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={14} color="#38bdf8" /> Email Message Pitch
              </label>
              <textarea
                ref={textareaRef}
                className="form-textarea"
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onFocus={() => setActiveFocusField('body')}
                placeholder="Hi Sir/Maam..."
                style={{ fontFamily: 'inherit', fontSize: '14px', lineHeight: 1.65 }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {body.length} characters &bull; {body.split(/\n\n+/).filter(Boolean).length} paragraphs
              </span>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || loading}
                style={{ padding: '12px 28px' }}
              >
                <Save size={16} /> {saving ? 'Saving Template...' : 'Save Email Pitch'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Inbox Preview */}
        <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="card-header-title" style={{ fontSize: '16px' }}>
              <Eye size={18} color="#34d399" /> Recruiter Inbox Live Preview
            </h3>
            <span className="status-badge badge-active" style={{ fontSize: '11px', padding: '3px 8px' }}>
              Gmail Primary Render
            </span>
          </div>

          <p className="card-subtitle" style={{ fontSize: '12px', marginBottom: '16px' }}>
            Live mockup showing how your email renders in the recruiter's inbox:
          </p>

          {/* Test Parameters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Sample Role:
              </label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                value={previewRole}
                onChange={(e) => setPreviewRole(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Sample Company:
              </label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                value={previewCompany}
                onChange={(e) => setPreviewCompany(e.target.value)}
              />
            </div>
          </div>

          {/* Email Container Mockup */}
          <div style={{
            background: '#ffffff',
            color: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Header info bar */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#475569'
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a' }}>From:</strong> 
                <span>{user?.name || 'Applicant'} &lt;{user?.email || 'user@gmail.com'}&gt;</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a' }}>To:</strong> 
                <span>recruiter@company.com</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <strong style={{ color: '#0f172a' }}>Subject:</strong> 
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {previewData?.subjectLine || subject}
                </span>
              </div>
            </div>

            {/* Email Body preview */}
            <div 
              style={{
                padding: '20px',
                fontSize: '13px',
                lineHeight: 1.65,
                color: '#1e293b',
                maxHeight: '380px',
                overflowY: 'auto'
              }}
              dangerouslySetInnerHTML={{
                __html: previewData?.htmlTemplate || `<p>${body.replace(/\n/g, '<br>')}</p>`
              }}
            />

            {/* Attachment preview bar */}
            <div style={{
              borderTop: '1px solid #e2e8f0',
              background: '#f1f5f9',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600 }}>
                <FileCheck size={16} color="#0284c7" />
                <span>{(user?.name || 'My').replace(/\s+/g, '_')}_Resume.pdf</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '11px' }}>Attached PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
