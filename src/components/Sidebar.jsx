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
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const menuItems = [
    { id: 'website', label: 'Public Website', icon: Globe },
    { id: 'targets', label: 'Job Target Automation', icon: Send, badge: 'Core' },
    { id: 'master', label: 'Master Resume', icon: FileText },
    { id: 'logs', label: 'Cron Dispatch Logs', icon: History },
    { id: 'settings', label: 'SMTP & Cron Settings', icon: Settings },
  ];

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
                <div className="brand-subtitle">Daily 9 AM Cron</div>
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

      {/* Footer Info / Cron Status */}
      <div className="sidebar-footer">
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
              <div style={{ fontSize: '11px', color: '#64748b' }}>Every Morning Auto Dispatch</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
