import React from 'react';
import { 
  Globe, 
  Send, 
  FileText, 
  History, 
  Settings, 
  Zap, 
  Clock 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'website', label: 'Public Website', icon: Globe },
    { id: 'targets', label: 'Job Target Automation', icon: Send, badge: 'Core' },
    { id: 'master', label: 'Master Resume', icon: FileText },
    { id: 'logs', label: 'Cron Dispatch Logs', icon: History },
    { id: 'settings', label: 'SMTP & Cron Settings', icon: Settings },
  ];

  return (
    <aside class="sidebar">
      <div>
        <div class="brand-header">
          <div class="brand-icon">
            <Zap size={22} />
          </div>
          <div>
            <div class="brand-title">AutoResume</div>
            <div class="brand-subtitle">Daily 9 AM Cron Engine</div>
          </div>
        </div>

        <nav class="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                class={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    fontSize: '10px', 
                    background: 'rgba(56, 189, 248, 0.2)', 
                    color: '#38bdf8', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontWeight: 700 
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="cron-badge-card">
          <div class="pulse-dot"></div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="#38bdf8" /> 9:00 AM Cron Active
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Every Morning Auto Dispatch</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
