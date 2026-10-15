import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter 
} from 'lucide-react';
import { apiUrl, authFetch } from '../../config/api';

export default function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false
  });

  const fetchLogs = async (p = page, lim = limit, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(lim),
        search: s.trim(),
        status: st !== 'all' ? st : ''
      });
      const res = await authFetch(apiUrl(`/api/settings/logs?${params.toString()}`));
      const data = await res.json();
      if (data.success) {
        setLogs(Array.isArray(data.data) ? data.data : []);
        setPaginationInfo({
          total: data.total ?? (Array.isArray(data.data) ? data.data.length : 0),
          totalPages: data.totalPages ?? 1,
          hasPrevPage: Boolean(data.hasPrevPage),
          hasNextPage: Boolean(data.hasNextPage)
        });
      }
    } catch (err) {
      console.error('Failed to fetch cron logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, limit, search, statusFilter);
  }, [page, limit, search, statusFilter]);

  const startEntryIndex = paginationInfo.total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntryIndex = Math.min(page * limit, paginationInfo.total);

  // Generate pagination numbers with ellipsis if many pages
  const getPageNumbers = () => {
    const total = paginationInfo.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (page >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', page - 1, page, page + 1, '...', total];
  };

  return (
    <div>
      <div className="glass-card">
        {/* Header with Title and Global Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-ink)' }}>
              <History size={20} color="var(--c-go)" /> Daily 9 AM Cron Dispatch History ({paginationInfo.total})
            </h2>
            <p className="card-subtitle" style={{ color: 'var(--c-ink-soft)', marginBottom: 0 }}>
              Audit trail of every automated email dispatch triggered by the 9:00 AM Cron Engine or manual tests.
            </p>
          </div>
          
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={() => fetchLogs(page, limit, search, statusFilter)} 
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Refresh Logs
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          marginBottom: '20px', 
          padding: '14px 16px',
          background: 'var(--c-surface-alt)',
          borderRadius: '10px',
          border: '1px solid var(--c-line)'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-ink-soft)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search recipient, details, JD, trigger..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '34px', paddingRight: '12px', height: '38px', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--c-ink-soft)" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{ height: '38px', padding: '4px 10px', fontSize: '13px', minWidth: '130px' }}
            >
              <option value="all">All Statuses</option>
              <option value="success">✓ Live Sent</option>
              <option value="simulated">ℹ Simulated</option>
              <option value="opened">👁 Recruiter Opened</option>
              <option value="clicked">🔗 Recruiter Clicked</option>
              <option value="failed">✕ Failed</option>
            </select>
          </div>

          {/* Rows Per Page Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-ink-soft)', whiteSpace: 'nowrap' }}>Per page:</span>
            <select
              className="form-select"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{ width: '80px', height: '38px', padding: '4px 8px', fontSize: '13px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--c-ink-soft)' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 12px auto' }}></div>
            <div>Loading execution logs...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--c-surface-alt)', borderRadius: '12px', border: '1px dashed var(--c-line)' }}>
            <Clock size={40} color="var(--c-ink-soft)" style={{ marginBottom: '12px', opacity: 0.7 }} />
            <h4 style={{ color: 'var(--c-ink)', fontSize: '16px', fontWeight: 700 }}>
              {search || statusFilter !== 'all' ? 'No Matching Logs Found' : 'No Email Dispatch Logs Recorded Yet'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--c-ink-soft)', marginTop: '6px', maxWidth: '440px', margin: '6px auto 0 auto' }}>
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your search query or status filter to see other dispatch records.'
                : 'Logs will populate automatically when the 9:00 AM daily cron fires or when you test manual dispatches.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
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
                    <tr key={log._id || log.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--c-ink)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt || log.sentAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--c-ink-soft)' }}>
                          {new Date(log.createdAt || log.sentAt).toLocaleTimeString()}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--c-accent)' }}>
                          {log.recipientEmail}
                        </div>
                      </td>

                      <td>
                        <span style={{ 
                          fontFamily: 'var(--font-code)', 
                          fontSize: '11px', 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          background: log.triggeredBy === 'cron' ? 'rgba(56, 189, 248, 0.15)' : 
                                      log.triggeredBy === 'recruiter' ? 'var(--c-go-soft)' : 'var(--c-brand-tint)',
                          color: log.triggeredBy === 'cron' ? '#0284c7' : 
                                 log.triggeredBy === 'recruiter' ? 'var(--c-go)' : 'var(--c-brand)',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}>
                          {log.triggeredBy === 'cron' ? '⏰ 9:00 AM Cron' : 
                           log.triggeredBy === 'recruiter' ? <><Eye size={12} /> Recruiter Activity</> : '⚡ Manual Test'}
                        </span>
                      </td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`status-badge ${
                          log.status === 'success' ? 'badge-active' :
                          log.status === 'simulated' ? 'badge-simulated' :
                          log.status === 'opened' ? 'badge-active' :
                          log.status === 'clicked' ? 'badge-active' : 'badge-paused'
                        }`} style={
                          log.status === 'opened' ? { background: 'var(--c-go-soft)', color: 'var(--c-go)', borderColor: 'rgba(31, 157, 97, 0.3)' } :
                          log.status === 'clicked' ? { background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', borderColor: 'rgba(56, 189, 248, 0.3)' } : {}
                        }>
                          {log.status === 'success' ? '✓ Live Sent' :
                           log.status === 'simulated' ? 'ℹ Simulated' :
                           log.status === 'opened' ? '👁 Recruiter Opened' :
                           log.status === 'clicked' ? '🔗 Recruiter Clicked' : '✕ Failed'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--c-ink)' }}>{log.details}</div>
                        {log.jobDescriptionSnippet && (
                          <div style={{ fontSize: '11px', color: 'var(--c-ink-soft)', marginTop: '2px' }}>
                            JD: {log.jobDescriptionSnippet}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '20px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--c-line)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--c-ink-soft)' }}>
                Showing <strong style={{ color: 'var(--c-ink)' }}>{startEntryIndex}</strong> to <strong style={{ color: 'var(--c-ink)' }}>{endEntryIndex}</strong> of <strong style={{ color: 'var(--c-accent)' }}>{paginationInfo.total}</strong> entries
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={!paginationInfo.hasPrevPage || loading}
                  style={{ opacity: !paginationInfo.hasPrevPage ? 0.5 : 1, padding: '6px 12px' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {getPageNumbers().map((pNum, idx) => {
                  if (pNum === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} style={{ padding: '0 6px', color: 'var(--c-ink-soft)', fontSize: '12px' }}>
                        ...
                      </span>
                    );
                  }
                  const isCurrent = pNum === page;
                  return (
                    <button
                      type="button"
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: isCurrent ? '1px solid var(--c-accent)' : '1px solid var(--c-line)',
                        background: isCurrent ? 'var(--c-accent)' : 'var(--c-surface)',
                        color: isCurrent ? '#ffffff' : 'var(--c-ink)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(prev => Math.min(prev + 1, paginationInfo.totalPages))}
                  disabled={!paginationInfo.hasNextPage || loading}
                  style={{ opacity: !paginationInfo.hasNextPage ? 0.5 : 1, padding: '6px 12px' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
