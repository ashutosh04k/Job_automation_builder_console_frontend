import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PublicWebsite from './pages/PublicWebsite';
import JobTargetTab from './pages/admin/JobTargetTab';
import ResumeMasterTab from './pages/admin/ResumeMasterTab';
import LogsTab from './pages/admin/LogsTab';
import SettingsTab from './pages/admin/SettingsTab';
import { Send, FileText, History, Settings, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('targets');

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
    <div class="app-container">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main class="main-content">
        <header class="top-bar">
          <div>
            <h1 class="page-title">{title}</h1>
            <p class="page-desc">{desc}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              class={`btn ${activeTab === 'website' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
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

        <div class="page-body">
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
