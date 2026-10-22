import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Building2, 
  Briefcase, 
  RotateCcw, 
  Layers, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl, authFetch } from '../../config/api';
import { resumeFileName } from '../../utils/fileName';
import { useAtsScore } from '../../hooks/useAtsScore';
import AtsScorePanel from '../../components/AtsScorePanel';

export default function CustomResumeTab() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notification, setNotification] = useState(null);

  // Real ATS score from the backend: tailors the resume for this JD and scores the printed text.
  const ats = useAtsScore({ jobDescription, targetRole, companyName });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Quick Role Presets
  const handleApplyPreset = (roleTitle, defaultKeywords = '') => {
    setTargetRole(roleTitle);
    if (!jobDescription && defaultKeywords) {
      setJobDescription(defaultKeywords);
    }
  };

  // Generate & Download PDF
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      showNotification('success', '⏳ Generating ATS tailored PDF resume...');

      const res = await authFetch(apiUrl('/api/resume/tailored-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim()
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate tailored PDF from server');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeFileName(user?.name, targetRole, companyName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification('success', '📄 ATS Tailored PDF Resume downloaded successfully!');
    } catch (err) {
      showNotification('error', err.message || 'Error generating PDF');
    } finally {
      setLoading(false);
    }
  };

  // Generate & Preview Inline
  const handlePreviewPdf = async () => {
    try {
      setPreviewLoading(true);
      showNotification('success', '⏳ Compiling live preview...');

      const res = await authFetch(apiUrl('/api/resume/tailored-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim()
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate preview PDF');
      }

      const blob = await res.blob();
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      showNotification('success', '👁️ Live preview updated below!');
    } catch (err) {
      showNotification('error', err.message || 'Error generating preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleReset = () => {
    setCompanyName('');
    setTargetRole('Full Stack Developer');
    setJobDescription('');
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
          border: `1px solid ${notification.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
          color: notification.type === 'error' ? '#f87171' : '#4ade80',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {notification.type === 'error' ? '⚠️' : '✅'} {notification.message}
        </div>
      )}

      {/* Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--c-brand-deep) 0%, var(--c-brand) 100%)',
        border: '1px solid var(--c-on-dark-line)',
        padding: '24px',
        position: 'relative',
        borderRadius:'20px',
        overflow: 'hidden',
        color: 'var(--c-on-dark)'
      }}>
        {/* Ambient Decorative Shapes */}
        <div aria-hidden="true" style={{
          position: 'absolute', width: 420, height: 420, borderRadius: '50%', right: -140, top: -180,
          border: '60px solid rgba(255,122,89,0.14)', pointerEvents: 'none', zIndex: 0
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%', right: 160, bottom: -110,
          backgroundColor: 'rgba(255,255,255,0.04)', pointerEvents: 'none', zIndex: 0
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--c-on-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="var(--c-accent)" /> ATS Resume Tailor & Builder
            </h2>
            <p style={{ color: 'var(--c-on-dark-muted)', fontSize: '13px', marginTop: '6px', maxWidth: '680px', lineHeight: '1.5' }}>
              Paste a job description to get a tailored one-page PDF and a real match score.
              Your master resume is reordered and reworded to the JD's spelling; nothing you haven't done is added.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReset}
              disabled={loading || previewLoading}
              title="Reset fields to default"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePreviewPdf}
              disabled={loading || previewLoading}
            >
              <Eye size={14} /> {previewLoading ? 'Compiling...' : 'Live Preview'}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPdf}
              disabled={loading || previewLoading}
              style={{ fontWeight: 700, gap: '6px' }}
            >
              <Download size={15} /> {loading ? 'Compiling PDF...' : 'Download Tailored PDF'}
            </button>
          </div>
        </div>

        {/* Quick Role Presets */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-ink-soft)', fontWeight: 600 }}>Quick Role Presets:</span>
          {[
            { label: 'Full Stack Developer', role: 'Full Stack Developer', jd: 'React.js, Node.js, TypeScript, AWS, MongoDB, Docker, REST APIs' },
            { label: 'Frontend Developer', role: 'Frontend Developer', jd: 'React.js, Next.js, TypeScript, Redux, RTK Query, Tailwind CSS, Performance' },
            { label: 'Backend Developer', role: 'Backend Developer', jd: 'Node.js, Express, MongoDB, AWS EC2, Microservices, REST APIs, WebSockets' },
            { label: 'Software Engineer', role: 'Software Engineer', jd: 'Data Structures, Algorithms, TypeScript, React, Node.js, CI/CD, AWS' }
          ].map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleApplyPreset(p.role, p.jd)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                background: targetRole === p.role ? 'var(--c-accent)' : 'var(--c-surface-alt)',
                border: `1px solid ${targetRole === p.role ? 'var(--c-accent)' : 'var(--c-line)'}`,
                color: targetRole === p.role ? '#ffffff' : 'var(--c-ink)',
                cursor: 'pointer',
                fontWeight: targetRole === p.role ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form & Keyword Analyzer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Form Inputs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--c-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={17} color="var(--c-brand)" /> Opportunity Details
          </h3>

          {/* Company Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ margin: 0 }}>
              <Building2 size={14} color="var(--c-brand)" /> Target Company Name (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Google, Stripe, Uber, Microsoft..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* Target Role */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ margin: 0 }}>
              <Briefcase size={14} color="var(--c-brand)" /> Target Role / Job Title
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Full Stack Developer, Frontend Developer, Backend Engineer..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          {/* Job Description (JD) */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <FileText size={14} color="var(--c-brand)" /> Target Job Description (JD)
              </label>
              <span style={{ fontSize: '11px', color: 'var(--c-ink-soft)' }}>
                {jobDescription.length} characters
              </span>
            </div>
            <textarea
              className="form-textarea"
              rows={9}
              placeholder="Paste the full job requirements, responsibilities, or stack here... The ATS engine will automatically scan keywords and tailor your resume's experience and skills accordingly."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ resize: 'vertical', lineHeight: '1.45', fontFamily: 'inherit' }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px 16px', fontWeight: 700 }}
              onClick={handleDownloadPdf}
              disabled={loading || previewLoading}
            >
              <Download size={16} /> {loading ? 'Compiling PDF...' : 'Download Tailored ATS Resume PDF'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '10px 18px' }}
              onClick={handlePreviewPdf}
              disabled={loading || previewLoading}
            >
              <Eye size={16} /> Preview
            </button>
          </div>
        </div>

        {/* Right Column: ATS Match Analyzer & Features Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Real ATS score */}
          <AtsScorePanel status={ats.status} report={ats.report} error={ats.error} onRetry={ats.refresh} />

          {/* ATS Optimization Highlights */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--c-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="var(--c-accent)" /> How Your Resume Is Dynamically Tailored
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--c-ink-soft)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--c-ink)' }}>Bullets ranked by relevance:</strong> in each role, bullets that mention the JD's skills move to the top.
              </li>
              <li>
                <strong style={{ color: 'var(--c-ink)' }}>JD spelling mirrored:</strong> if the JD says "ReactJS" and you wrote "React.js", the PDF uses "ReactJS" (many ATS match words literally).
              </li>
              <li>
                <strong style={{ color: 'var(--c-ink)' }}>Skills prioritised:</strong> the most relevant skill groups come first and matched skills are bold.
              </li>
              <li>
                <strong style={{ color: 'var(--c-ink)' }}>One page, readable:</strong> the least relevant bullets are dropped before text shrinks; body text never goes below 10pt.
              </li>
              <li>
                <strong style={{ color: 'var(--c-ink)' }}>Nothing invented:</strong> missing skills are listed for you to add only if you really have them.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live PDF Preview Pane */}
      {previewUrl && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-ink)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Eye size={17} color="var(--c-brand)" /> Live Tailored PDF Resume Preview
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px' }}
              >
                <ExternalLink size={14} /> Open in New Tab
              </a>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownloadPdf}
                style={{ gap: '6px' }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>

          <div style={{
            width: '100%',
            height: '750px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(100, 116, 139, 0.25)',
            background: '#1e293b'
          }}>
            <iframe
              src={previewUrl}
              title="Tailored Resume Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
