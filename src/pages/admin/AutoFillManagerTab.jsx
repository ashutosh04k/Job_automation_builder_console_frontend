import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Tag, 
  HelpCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function AutoFillManagerTab() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    category: 'Custom Q&A',
    question: '',
    keywords: '',
    answer: '',
    type: 'text'
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await authFetch(apiUrl('/api/autofill'));
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRules(data.data);
      } else {
        showNotification('error', data.error || 'Failed to load Q&A rules.');
      }
    } catch (err) {
      showNotification('error', 'Error loading rules: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await authFetch(apiUrl('/api/autofill'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', '🎉 All Q&A autofill rules saved successfully!');
        if (data.data) setRules(data.data);
      } else {
        showNotification('error', data.error || 'Failed to save rules.');
      }
    } catch (err) {
      showNotification('error', 'Save error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all questions and answers back to default values? Any custom questions will be removed.')) {
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(apiUrl('/api/autofill/reset'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', '✓ Reset to default questions and answers.');
        if (data.data) setRules(data.data);
      } else {
        showNotification('error', data.error || 'Reset failed.');
      }
    } catch (err) {
      showNotification('error', 'Reset error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRule = (id, field, value) => {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (field === 'keywords') {
        const arr = typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : value;
        return { ...r, keywords: arr };
      }
      return { ...r, [field]: value };
    }));
  };

  const handleDeleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
    showNotification('success', 'Question removed (Click "Save Changes" to commit).');
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.question.trim() || !newRule.answer.trim()) {
      showNotification('error', 'Please provide both Question and Answer.');
      return;
    }

    const kwArr = newRule.keywords
      ? newRule.keywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [newRule.question.toLowerCase().trim()];

    const created = {
      id: 'custom_' + Date.now().toString(36),
      category: newRule.category || 'Custom Q&A',
      question: newRule.question.trim(),
      keywords: kwArr,
      answer: newRule.answer.trim(),
      type: newRule.type || 'text',
      isDefault: false
    };

    setRules(prev => [...prev, created]);
    setNewRule({
      category: 'Custom Q&A',
      question: '',
      keywords: '',
      answer: '',
      type: 'text'
    });
    setShowAddModal(false);
    showNotification('success', 'New Q&A added! Click "Save Changes" to commit.');
  };

  const handleCopyAuthToken = () => {
    const token = localStorage.getItem('autoresume_token') || localStorage.getItem('token');
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 3000);
      showNotification('success', '🔑 Auth Token copied! Paste into Chrome Extension to sync.');
    } else {
      showNotification('error', 'No active login token found.');
    }
  };

  // Categories
  const categories = ['All', 'Contact', 'Links', 'Experience', 'Education', 'Custom Q&A'];

  // Filtered Rules
  const filteredRules = rules.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const qStr = (r.question || '').toLowerCase();
    const aStr = (r.answer || '').toLowerCase();
    const kStr = Array.isArray(r.keywords) ? r.keywords.join(' ').toLowerCase() : '';
    const s = search.toLowerCase();
    const matchesSearch = !search || qStr.includes(s) || aStr.includes(s) || kStr.includes(s);
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div className={`toast-msg ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Actions Header */}
      <div className="glass-card" style={{ border: '1px solid var(--border-highlight)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 className="card-header-title">
              <Sparkles size={22} color="#38bdf8" /> Job Application AutoFill Q&A Rules
            </h2>
            <p className="card-subtitle" style={{ marginBottom: 0 }}>
              Customize and manage questions, keywords, and answers used by the AutoResume Chrome Extension to auto-fill job applications on Greenhouse, Lever, Workday, LinkedIn, Indeed, and more.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={handleCopyAuthToken}
              title="Copy auth token for Chrome Extension sync"
            >
              {copiedToken ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              {copiedToken ? 'Token Copied!' : 'Copy Extension Token'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={handleResetDefaults}
              disabled={saving}
              title="Reset questions to standard defaults"
            >
              <RotateCcw size={14} /> Reset
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowAddModal(true)}
              style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}
            >
              <Plus size={15} /> Add New Question
            </button>

            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={handleSaveAll}
              disabled={saving}
              style={{ fontWeight: 700 }}
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* Extension Sync Helper Banner */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '13px' }}>
                Instant Chrome Extension Synchronization
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Any question and answer you add or edit here is loaded in real time by your Chrome Extension. When you apply on any portal, the extension matches your question keywords and auto-fills the field.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-code)',
              background: 'rgba(0,0,0,0.3)',
              padding: '4px 10px',
              borderRadius: '6px',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ✓ {rules.length} Q&A Rules Active
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: activeCategory === cat ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {cat}
                {cat === 'All' ? ` (${rules.length})` : ` (${rules.filter(r => r.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search question, keyword, or answer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', height: '36px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Q&A Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading Q&A rules...</div>
      ) : filteredRules.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <HelpCircle size={36} color="#64748b" style={{ marginBottom: '12px' }} />
          <h4 style={{ color: '#f8fafc' }}>No Questions Found</h4>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            {search ? `No questions match "${search}".` : 'Click "Add New Question" above to create your first custom question & answer!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredRules.map((rule, idx) => (
            <div 
              key={rule.id || idx} 
              className="glass-card" 
              style={{ 
                padding: '16px 20px', 
                border: '1px solid var(--border-color)',
                transition: 'border-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Card Top Row: Category, Question Label, Delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 
                      rule.category === 'Contact' ? 'rgba(56, 189, 248, 0.15)' :
                      rule.category === 'Links' ? 'rgba(129, 140, 248, 0.15)' :
                      rule.category === 'Experience' ? 'rgba(52, 211, 153, 0.15)' :
                      rule.category === 'Education' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(244, 114, 182, 0.15)',
                    color:
                      rule.category === 'Contact' ? '#38bdf8' :
                      rule.category === 'Links' ? '#a5b4fc' :
                      rule.category === 'Experience' ? '#34d399' :
                      rule.category === 'Education' ? '#fbbf24' : '#f472b6',
                    whiteSpace: 'nowrap'
                  }}>
                    {rule.category}
                  </span>

                  <input
                    type="text"
                    value={rule.question}
                    onChange={(e) => handleUpdateRule(rule.id, 'question', e.target.value)}
                    placeholder="Question Title / Label"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: '4px 6px',
                      flex: 1,
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Type: <strong style={{ color: '#94a3b8' }}>{rule.type || 'text'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#fb7185', padding: '4px 8px' }}
                    title="Delete Question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Card Middle: Keywords Matching Pattern */}
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Matching Keywords on Application Portals (Comma-separated field names, IDs, placeholders)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={13} color="#64748b" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    className="form-input"
                    value={Array.isArray(rule.keywords) ? rule.keywords.join(', ') : (rule.keywords || '')}
                    onChange={(e) => handleUpdateRule(rule.id, 'keywords', e.target.value)}
                    placeholder="e.g. email, email id, e-mail"
                    style={{ fontSize: '12px', height: '32px', fontFamily: 'var(--font-code)', color: '#38bdf8' }}
                  />
                </div>
              </div>

              {/* Card Bottom: Answer / Fill Value */}
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  AutoFill Answer / Value
                </label>
                {rule.type === 'textarea' || (rule.answer && rule.answer.length > 80) ? (
                  <textarea
                    className="form-input"
                    rows={3}
                    value={rule.answer || ''}
                    onChange={(e) => handleUpdateRule(rule.id, 'answer', e.target.value)}
                    placeholder="Enter answer..."
                    style={{ fontSize: '13px', resize: 'vertical' }}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={rule.answer || ''}
                    onChange={(e) => handleUpdateRule(rule.id, 'answer', e.target.value)}
                    placeholder="Enter answer value to fill on application forms..."
                    style={{ fontSize: '13px', height: '38px', color: '#34d399', fontWeight: 600 }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Save Bar on bottom if rules exist */}
      {rules.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: '20px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-highlight)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
            <span>Configured <strong>{rules.length}</strong> AutoFill Question & Answer rules.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} /> Add Another Question
            </button>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={handleSaveAll}
              disabled={saving}
              style={{ fontWeight: 700 }}
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Add New Question & Answer Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', border: '1px solid var(--border-highlight)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#38bdf8" /> Add New AutoFill Question & Answer
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  >
                    <option value="Contact">Contact</option>
                    <option value="Links">Links</option>
                    <option value="Experience">Experience</option>
                    <option value="Education">Education</option>
                    <option value="Custom Q&A">Custom Q&A</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Input Field Type</label>
                  <select
                    className="form-select"
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  >
                    <option value="text">Single Line Text</option>
                    <option value="textarea">Multi-Line Textarea</option>
                    <option value="select">Select / Dropdown</option>
                    <option value="number">Number</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Question / Field Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. What is your expected salary? OR Are you willing to relocate?"
                  value={newRule.question}
                  onChange={(e) => setNewRule({ ...newRule, question: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Keywords / Portal Matchers (Comma-separated)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. expected salary, salary expectation, expected ctc"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  style={{ fontFamily: 'var(--font-code)', fontSize: '12px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  The extension matches these keywords in input labels, placeholders, or IDs on job application forms.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Answer / Value to AutoFill *</label>
                {newRule.type === 'textarea' ? (
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter answer text to fill..."
                    value={newRule.answer}
                    onChange={(e) => setNewRule({ ...newRule, answer: e.target.value })}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 18 LPA OR Yes, open to relocation"
                    value={newRule.answer}
                    onChange={(e) => setNewRule({ ...newRule, answer: e.target.value })}
                    required
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700 }}
                >
                  <Plus size={14} /> Add Question & Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
