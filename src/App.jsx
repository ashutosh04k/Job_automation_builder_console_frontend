import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PublicWebsite from './pages/PublicWebsite';
import JobTargetTab from './pages/admin/JobTargetTab';
import ResumeMasterTab from './pages/admin/ResumeMasterTab';
import LogsTab from './pages/admin/LogsTab';
import SettingsTab from './pages/admin/SettingsTab';
import { Send, FileText, History, Settings, Globe, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('targets');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'website':
        return { title: 'AutoResume Platform', desc: 'Public website showcase & features' };
      case 'targets':
        return { title: 'Admin Panel - Resume Automation Form', desc: '2 input fields: Email & Job Description stored to backend with daily 9 AM Cron dispatch' };
      case 'master':
        return { title: 'Master Resume Base', desc: 'Base profile tailored for each target job description' };
      case 'logs':
        return { title: 'Cron Execution Audit Logs', desc: 'Daily 9:00 AM scheduled email dispatch history' };
      case 'settings':
        return { title: 'SMTP Email & Cron Configuration', desc: 'Manage email permissions and SMTP credentials' };
      default:
        return { title: 'Admin Panel', desc: 'MERN Resume Automation System' };
    }
  };

  const { title, desc } = getPageTitle();

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={toggleSidebar} 
      />

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isCollapsed && (
              <button
                type="button"
                className="topbar-toggle-btn"
                onClick={toggleSidebar}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
            <div>
              <h1 className="page-title">{title}</h1>
              <p className="page-desc">{desc}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${activeTab === 'website' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={() => setActiveTab(activeTab === 'website' ? 'targets' : 'website')}
            >
              {activeTab === 'website' ? (
                <> <Send size={14} /> Switch to Admin Panel </>
              ) : (
                <> <Globe size={14} /> View Public Website </>
              )}
            </button>
          </div>
        </header>

        <div className="page-body">
          {activeTab === 'website' && <PublicWebsite onGoToAdmin={() => setActiveTab('targets')} />}
          {activeTab === 'targets' && <JobTargetTab />}
          {activeTab === 'master' && <ResumeMasterTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
