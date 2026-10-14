import React from 'react';
import { 
  Globe, 
  Send, 
  FileText, 
  History, 
  Settings, 
  Zap, 
  Clock,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  User,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onOpenAuth }) {
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    { id: 'website', label: 'Public Website', icon: Globe },
    { id: 'targets', label: 'Job Target Automation', icon: Send, badge: 'Core' },
    { id: 'template', label: 'Email Pitch & Message', icon: Mail, badge: 'Pitch' },
    { id: 'master', label: 'Master Resume', icon: FileText },
    { id: 'logs', label: 'Cron Dispatch Logs', icon: History },
    { id: 'settings', label: 'SMTP & Cron Settings', icon: Settings },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        {/* Brand Header with Close/Expand Button */}
        <div className="brand-header">
          <div className="brand-header-left">
            <div className="brand-icon" title="AutoResume Platform">
              <Zap size={20} />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <div className="brand-title">AutoResume</div>
                <div className="brand-subtitle">Multi-Tenant Platform</div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'item-collapsed' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-item-icon">
                  <Icon size={18} />
                </div>
                {!isCollapsed && <span className="nav-item-label">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="nav-badge">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / User Account & Cron Status */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* User Account Section */}
        {isAuthenticated ? (
          isCollapsed ? (
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                margin: '0 auto',
                cursor: 'pointer'
              }}
              onClick={logout}
              title={`${user.name} (${user.email}) - Click to Log Out`}
            >
              {getInitials(user.name)}
            </div>
          ) : (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  flexShrink: 0
                }}>
                  {getInitials(user.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Log Out"
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '6px', border: 'none', color: '#fb7185' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )
        ) : (
          isCollapsed ? (
            <button
              type="button"
              onClick={onOpenAuth}
              title="Sign In / Register"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                cursor: 'pointer'
              }}
            >
              <LogIn size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
            >
              <LogIn size={14} /> Sign In / Register
            </button>
          )
        )}

        {/* Cron Status */}
        {isCollapsed ? (
          <div 
            className="cron-badge-compact" 
            title="9:00 AM Daily Cron Active (Scheduled Auto Dispatch)"
          >
            <div className="pulse-dot"></div>
            <Clock size={14} color="#38bdf8" />
          </div>
        ) : (
          <div className="cron-badge-card">
            <div className="pulse-dot"></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#38bdf8" /> 9:00 AM Cron Active
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Scheduled Auto Dispatch</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
