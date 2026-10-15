import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PublicWebsite from './pages/PublicWebsite';
import JobTargetTab from './pages/admin/JobTargetTab';
import ResumeMasterTab from './pages/admin/ResumeMasterTab';
import EmailTemplateTab from './pages/admin/EmailTemplateTab';
import AutoFillManagerTab from './pages/admin/AutoFillManagerTab';
import LogsTab from './pages/admin/LogsTab';
import SettingsTab from './pages/admin/SettingsTab';
import CustomResumeTab from './pages/admin/CustomResumeTab';
import AuthModal from './components/AuthModal';
import ThemeAmbientBoxes from './components/ThemeAmbientBoxes';
import { useAuth } from './context/AuthContext';
import { Send, FileText, History, Settings, Globe, LogOut, UserCheck } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('targets');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // 1. Loading state while checking token
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--c-page)',
        color: 'var(--c-brand)',
        fontSize: '16px',
        fontWeight: 600,
        gap: '12px'
      }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px' }}></div>
        <span>Initializing AutoResume Platform...</span>
      </div>
    );
  }

  // 2. Unauthenticated: ONLY show Public Website (strictly protect all admin UI & data)
  if (!isAuthenticated) {
    return (
      <div style={{ position: 'relative', overflowX: 'hidden' }}>
        <ThemeAmbientBoxes />
        <PublicWebsite 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
          onGoToAdmin={() => setIsAuthModalOpen(true)} 
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  // 3. Authenticated: Render Admin Workspace & Tenant Environment
  const getPageTitle = () => {
    switch (activeTab) {
      case 'website':
        return { title: 'AutoResume Platform', desc: 'Public website preview & features' };
      case 'targets':
        return { 
          title: `Job Target Automation (${user?.name}'s Workspace)`, 
          desc: 'Input Email & Job Description to store targets with daily 9 AM Cron dispatch' 
        };
      case 'custom-resume':
        return { 
          title: `ATS Resume Builder & Tailor (${user?.name})`, 
          desc: 'Input target company, role, and job description to instantly compile a tailored ATS PDF resume' 
        };
      case 'template':
        return { 
          title: `Cold Email Pitch & Message (${user?.name})`, 
          desc: 'Customize the email message and subject dispatched to recruiters daily at 9:00 AM' 
        };
      case 'master':
        return { 
          title: `Master Resume Base (${user?.name})`, 
          desc: 'Personal base resume and PDF attached to outgoing job applications' 
        };
      case 'autofill':
        return { 
          title: `Job AutoFill Q&A Rules (${user?.name})`, 
          desc: 'Modify questions, keywords, and answers used by the Chrome Extension to auto-fill job applications' 
        };
      case 'logs':
        return { title: 'Cron Execution Audit Logs', desc: 'Daily 9:00 AM scheduled email dispatch history' };
      case 'settings':
        return { title: 'SMTP Email & Sender Configuration', desc: 'Manage custom email credentials and SMTP settings' };
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
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content" style={{ position: 'relative', overflowX: 'hidden' }}>
        {/* Ambient Theme Background Boxes */}
        <ThemeAmbientBoxes />

        <header className="top-bar" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-desc">{desc}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#38bdf8'
              }}
            >
              <UserCheck size={15} />
              <span>Workspace: <strong>{user?.name}</strong></span>
            </div>

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

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Log Out of Workspace"
              style={{ color: '#fb7185' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        <div className="content-scrollable">
          <div className="page-body">
            {activeTab === 'website' && (
              <PublicWebsite 
                onOpenAuth={() => setIsAuthModalOpen(true)} 
                onGoToAdmin={() => setActiveTab('targets')} 
              />
            )}
            {activeTab === 'targets' && <JobTargetTab key={user?.id} />}
            {activeTab === 'custom-resume' && <CustomResumeTab key={user?.id} />}
            {activeTab === 'template' && <EmailTemplateTab key={user?.id} />}
            {activeTab === 'master' && <ResumeMasterTab key={user?.id} />}
            {activeTab === 'autofill' && <AutoFillManagerTab key={user?.id} />}
            {activeTab === 'logs' && <LogsTab key={user?.id} />}
            {activeTab === 'settings' && <SettingsTab key={user?.id} />}
          </div>
        </div>
      </main>

      {/* Multi-Tenant Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
