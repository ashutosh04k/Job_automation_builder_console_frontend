import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, AlertTriangle, Info, Clock, RefreshCw } from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';

export default function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch(apiUrl('/api/settings/logs'));
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div class="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 class="card-header-title">
              <History size={20} color="#34d399" /> Daily 9 AM Cron Dispatch History
            </h2>
            <p class="card-subtitle">
              Audit trail of every automated email dispatch triggered by the 9:00 AM Cron Engine or manual tests.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} /> Refresh Logs
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading execution logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
            <Clock size={36} color="#64748b" style={{ marginBottom: '12px' }} />
            <h4 style={{ color: '#f8fafc' }}>No Email Dispatch Logs Recorded Yet</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Logs will populate automatically when the 9:00 AM daily cron fires or when you press "Send Email Now".
            </p>
          </div>
        ) : (
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Recipient Email</th>
                  <th>Trigger Mode</th>
                  <th>Status</th>
                  <th>Details & Output</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '13px' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#38bdf8' }}>{log.recipientEmail}</div>
                    </td>

                    <td>
                      <span style={{ 
                        fontFamily: 'var(--font-code)', 
                        fontSize: '11px', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        background: log.triggeredBy === 'cron' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: log.triggeredBy === 'cron' ? '#38bdf8' : '#cbd5e1'
                      }}>
                        {log.triggeredBy === 'cron' ? '⏰ 9:00 AM Cron' : '⚡ Manual Test'}
                      </span>
                    </td>

                    <td>
                      <span class={`status-badge ${
                        log.status === 'success' ? 'badge-active' :
                        log.status === 'simulated' ? 'badge-simulated' : 'badge-paused'
                      }`}>
                        {log.status === 'success' ? '✓ Live Sent' :
                         log.status === 'simulated' ? 'ℹ Simulated' : '✕ Failed'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{log.details}</div>
                      {log.jobDescriptionSnippet && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          JD: {log.jobDescriptionSnippet}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
