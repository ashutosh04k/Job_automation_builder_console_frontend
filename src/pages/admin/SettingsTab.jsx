import React, { useState, useEffect } from 'react';
import { Settings, Server, Key, Mail, CheckCircle2, AlertCircle, Send, ShieldAlert, Clock } from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    senderName: 'Resume Automation System',
    senderEmail: '',
    cronTime: '0 9 * * *',
    enableCron: true
  });

  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchSettings = async () => {
    try {
      const res = await authFetch(apiUrl('/api/settings'));
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        if (data.data.smtpUser && !testEmailRecipient) {
          setTestEmailRecipient(data.data.smtpUser);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(apiUrl('/api/settings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'SMTP and Cron Settings saved successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save settings.');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient) {
      showNotification('error', 'Please enter a test recipient email address.');
      return;
    }
    setTesting(true);
    try {
      const res = await authFetch(apiUrl('/api/settings/test-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testEmailRecipient })
      });
      const data = await res.json();
      if (data.success && data.result.success) {
        showNotification('success', data.result.message);
      } else {
        showNotification('error', data.result?.message || data.error || 'Test email failed.');
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      {toast && (
        <div class={`toast-msg ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Gmail / SMTP Instructions Banner */}
      <div class="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)', background: 'rgba(15, 23, 42, 0.9)' }}>
        <h3 class="card-header-title" style={{ color: 'white' }}>
          <ShieldAlert size={18} color="#38bdf8" /> Email Permission & SMTP Configuration Guide
        </h3>
        <p style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.6 }}>
          To enable live 9:00 AM automated email dispatches from your Gmail account:
          <br />
          1. Enable 2-Step Verification on your Google Account.
          <br />
          2. Generate a 16-character <strong>App Password</strong> at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>myaccount.google.com/apppasswords</a>.
          <br />
          3. Enter your Gmail address and the 16-character App Password below.
        </p>
      </div>

      <div class="glass-card">
        <h2 class="card-header-title">
          <Settings size={20} color="#818cf8" /> SMTP Credentials & Dispatch Settings
        </h2>
        <p class="card-subtitle">
          Configure outgoing email authentication for automated 9 AM cron dispatches.
        </p>

        <form onSubmit={handleSave} class="form-grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div class="form-group">
              <label class="form-label"><Server size={14} color="#38bdf8" /> SMTP Host</label>
              <input
                type="text"
                class="form-input"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Server size={14} color="#818cf8" /> SMTP Port</label>
              <input
                type="number"
                class="form-input"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                placeholder="587"
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Mail size={14} color="#34d399" /> Sender / Gmail Username</label>
              <input
                type="email"
                class="form-input"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value, senderEmail: e.target.value })}
                placeholder="your_email@gmail.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Key size={14} color="#fbbf24" /> Gmail App Password</label>
              <input
                type="password"
                class="form-input"
                value={settings.smtpPass}
                onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                placeholder="xxxx xxxx xxxx xxxx"
              />
            </div>

            <div class="form-group">
              <label class="form-label"><Clock size={14} color="#38bdf8" /> Daily Cron Schedule</label>
              <input
                type="text"
                class="form-input"
                value={settings.cronTime}
                onChange={(e) => setSettings({ ...settings, cronTime: e.target.value })}
                placeholder="0 9 * * *"
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Standard Cron: `0 9 * * *` = Every morning at 9:00 AM</span>
            </div>

            <div class="form-group">
              <label class="form-label">Sender Display Name</label>
              <input
                type="text"
                class="form-input"
                value={settings.senderName}
                onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                placeholder="Resume Automation System"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" class="btn btn-primary" disabled={saving}>
              <Settings size={16} /> {saving ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Test Email Dispatch Card */}
      <div class="glass-card">
        <h3 class="card-header-title">
          <Send size={18} color="#34d399" /> Test Live SMTP Email Transmission
        </h3>
        <p class="card-subtitle">
          Send a test system verification email to verify your email credentials before 9 AM.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="email"
            class="form-input"
            placeholder="Enter email to receive test message..."
            value={testEmailRecipient}
            onChange={(e) => setTestEmailRecipient(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <button class="btn btn-secondary" onClick={handleSendTestEmail} disabled={testing}>
            <Send size={15} color="#38bdf8" /> {testing ? 'Transmitting Email...' : 'Send Live Test Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
