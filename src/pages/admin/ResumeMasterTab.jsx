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
  AlertCircle
} from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';

export default function ResumeMasterTab() {
  const [resume, setResume] = useState({
    fullName: 'Ashutosh Kumar',
    email: 'kumarasutosh2014@gmail.com',
    phone: '8521975695',
    location: 'Gurgaon, Haryana',
    title: 'Software Developer | Full Stack Developer',
    summary: 'Full Stack Software Developer with 3+ years of experience building scalable web applications, REST APIs, real-time systems, CRM platforms, and data-intensive workflows using React.js, Node.js, MongoDB, TypeScript, AWS, and Docker.',
    website: 'https://ashutosh-portfolio-8x6q.onrender.com/',
    linkedin: 'https://www.linkedin.com/in/ashutosh-kumar-sde',
    github: 'https://github.com/ashutosh04k',
    skills: [],
    experience: [],
    education: [],
    projects: []
  });

  // PDF Upload States
  const [pdfStatus, setPdfStatus] = useState({ hasCustomPdf: false });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchResume();
    fetchPdfStatus();
  }, []);

  const showNotification = (type, message) => {
    setMsg({ type, text: message });
    setTimeout(() => setMsg(null), 5000);
  };

  const fetchResume = async () => {
    try {
      const res = await authFetch(apiUrl('/api/resume'));
      const data = await res.json();
      if (data.success && data.data && data.data.fullName) {
        setResume(data.data);
      }
    } catch (err) {
      console.error(err);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(apiUrl('/api/resume'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Master profile updated & saved successfully!');
      }
    } catch (err) {
      showNotification('error', 'Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {msg && (
        <div class={`toast-msg ${msg.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Upload Custom PDF Resume Card */}
      <div class="glass-card" style={{ border: '1px solid var(--border-highlight)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.5) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 class="card-header-title">
              <UploadCloud size={22} color="#38bdf8" /> Upload Your Own PDF Resume
            </h2>
            <p class="card-subtitle" style={{ marginBottom: 0 }}>
              Upload your custom PDF resume file. This exact PDF will automatically be attached as <strong>Ashutosh_Kumar_Resume.pdf</strong> to every outgoing daily job email!
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
        </form>
      </div>

      {/* Master Profile Form */}
      <div className="glass-card">
        <h2 className="card-header-title">
          <FileText size={20} color="#38bdf8" /> Master Resume Profile — {resume.fullName || 'My Profile'}
        </h2>
        <p class="card-subtitle">
          Your authentic work experience and contact details used in cold outreach email bodies.
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
                onChange={(e) => setResume({ ...resume, website: e.target.value })}
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
    </div>
  );
}
