import React from 'react';
import { 
  Zap, 
  Clock, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicWebsite({ onOpenAuth, onGoToAdmin }) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Public Top Navigation Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#090d16',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)'
          }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
              AutoResume
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Multi-Tenant Resume Automation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onGoToAdmin}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <ArrowRight size={15} /> Go to {user?.name}'s Workspace
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onOpenAuth}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onOpenAuth}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                <UserPlus size={14} /> Get Started Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {/* Hero Banner */}
        <div className="glass-card" style={{ 
          textAlign: 'center', 
          padding: '64px 36px', 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.7) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(56, 189, 248, 0.15)', 
            color: '#38bdf8', 
            padding: '8px 20px', 
            borderRadius: '30px', 
            fontSize: '13px', 
            fontWeight: 700, 
            marginBottom: '24px',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <Sparkles size={16} /> Automated Daily 9 AM Resume Dispatch Platform
          </span>
          
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 800, 
            lineHeight: 1.15, 
            letterSpacing: '-1.5px', 
            marginBottom: '20px',
            background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Land More Interviews While You Sleep. <br />
            Personalized Resumes Delivered Every Morning.
          </h1>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '720px', margin: '0 auto 36px auto', lineHeight: 1.65 }}>
            Add any recruiter email & job posting to your queue. Our multi-tenant engine automatically aligns your profile with the job's key requirements and delivers your tailored resume and custom PDF directly to employer inboxes every day at 9:00 AM.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={onGoToAdmin} 
                style={{ padding: '14px 32px', fontSize: '15px' }}
              >
                Enter Your Workspace <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={onOpenAuth} 
                  style={{ padding: '14px 32px', fontSize: '15px' }}
                >
                  <LogIn size={18} /> Sign In to Your Workspace
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={onOpenAuth} 
                  style={{ padding: '14px 28px', fontSize: '15px' }}
                >
                  <UserPlus size={18} /> Create Account
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '28px', color: '#64748b', fontSize: '13px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#34d399" /> Strict Tenant Data Isolation
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#34d399" /> Automated 9:00 AM Cron Schedule
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#34d399" /> Custom PDF Resume Attachment
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
          <div className="glass-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '16px' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f8fafc' }}>
              9:00 AM Daily Automated Cron
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Runs reliably every weekday at 9:00 AM. It fetches your active targets, formats your tailored application, and delivers it to recruiters at the optimal morning peak time.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '16px' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f8fafc' }}>
              Isolated Multi-Tenant Security
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Every user has a completely segregated environment. Your resumes, job target queues, custom uploaded PDFs, and logs are 100% private to your authenticated account.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '16px' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f8fafc' }}>
              Gmail REST API + Custom PDF
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Sends via official Google OAuth2 REST APIs, bypassing SMTP port restrictions to land in the Primary inbox with your exact customized PDF attached.
            </p>
          </div>
        </div>

        {/* Live Architecture Flow */}
        <div className="glass-card" style={{ marginTop: '24px' }}>
          <h3 className="card-header-title">
            <ShieldCheck size={20} color="#34d399" /> System Workflow & Architecture
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>STEP 1</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>Sign In to Workspace</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>Log in to access your secure, private applicant queue.</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>STEP 2</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>Add Target or Chrome Scrape</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>Paste recruiter email + job post or use the Chrome Extension.</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>STEP 3</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>Dynamic Profile Matching</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>Engine formats your skills and experience to match the role.</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>STEP 4</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>9:00 AM Cron Dispatch</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>Automated dispatch sends your custom PDF email to the recruiter.</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: '#64748b',
        fontSize: '13px'
      }}>
        AutoResume SaaS Platform &copy; 2026. Private multi-tenant applicant automation.
      </footer>
    </div>
  );
}
