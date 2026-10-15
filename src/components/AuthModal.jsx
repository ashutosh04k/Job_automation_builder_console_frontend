import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus, Lock, Mail, User, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMsg('Logged in successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setError(res.error);
        }
      } else {
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }
        const res = await register(name, email, password);
        if (res.success) {
          setSuccessMsg('Account created & logged in successfully!');
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const fillPrimaryAdmin = () => {
    setEmail('kumarasutosh2014@gmail.com');
    setPassword('Ashutosh@2026');
    setMode('login');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '440px', padding: '32px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--c-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mode === 'login' ? <LogIn size={20} color="var(--c-accent)" /> : <UserPlus size={20} color="var(--c-accent)" />}
              {mode === 'login' ? 'Sign In to AutoResume' : 'Create Your Account'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--c-ink-soft)', marginTop: '4px' }}>
              {mode === 'login' 
                ? 'Access your private resume profile & job queues' 
                : 'Start automating your personal job applications'}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'var(--c-surface-alt)', borderRadius: '8px', padding: '4px', marginBottom: '20px', border: '1px solid var(--c-line)' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="toast-msg toast-error" style={{ padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="toast-msg toast-success" style={{ padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-grid">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">
                <User size={14} color="#38bdf8" /> Full Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} color="#38bdf8" /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={14} color="#38bdf8" /> Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account')}
          </button>
        </form>

        {/* Quick Admin Shortcut Helper */}
        {mode === 'login' && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--c-line)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={fillPrimaryAdmin}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--c-accent)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <Sparkles size={12} /> Fill Owner Account (Ashutosh)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
