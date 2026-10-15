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
import ThemeAmbientBoxes from '../components/ThemeAmbientBoxes';

export default function PublicWebsite({ onOpenAuth, onGoToAdmin }) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--c-brand-deep)', position: 'relative', overflowX: 'hidden' }}>
      {/* Decorative Theme Ambient Background Circles */}
      <ThemeAmbientBoxes />
      {/* Public Top Navigation Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        borderBottom: '1px solid var(--c-on-dark-line)',
        background: 'var(--c-brand-deep)',
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
            background: 'linear-gradient(135deg, var(--c-accent) 0%, var(--c-accent-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(255, 122, 89, 0.35)'
          }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-on-dark)', letterSpacing: '-0.5px' }}>
              AutoResume
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-accent)', fontWeight: 600 }}>
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
          background: 'linear-gradient(135deg, var(--c-brand-deep) 0%, var(--c-brand) 100%)',
          border: '1px solid var(--c-on-dark-line)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(8, 42, 48, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Decorative Shapes inside Hero Card */}
          <div aria-hidden="true" style={{
            position: 'absolute', width: 420, height: 420, borderRadius: '50%', right: -140, top: -180,
            border: '60px solid rgba(255,122,89,0.14)', pointerEvents: 'none', zIndex: 0
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', width: 180, height: 180, borderRadius: '50%', right: 160, bottom: -110,
            backgroundColor: 'rgba(255,255,255,0.04)', pointerEvents: 'none', zIndex: 0
          }} />

          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 122, 89, 0.15)', 
            color: 'var(--c-accent)', 
            padding: '8px 20px', 
            borderRadius: '30px', 
            fontSize: '13px', 
            fontWeight: 700, 
            marginBottom: '24px',
            border: '1px solid rgba(255, 122, 89, 0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            <Sparkles size={16} /> Automated Daily 9 AM Resume Dispatch Platform
          </span>
          
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 800, 
            lineHeight: 1.15, 
            letterSpacing: '-1.5px', 
            marginBottom: '20px',
            color: 'var(--c-on-dark)',
            position: 'relative',
            zIndex: 1
          }}>
            Land More Interviews While You Sleep. <br />
            Personalized Resumes Delivered Every Morning.
          </h1>

          <p style={{ fontSize: '17px', color: 'var(--c-on-dark-muted)', maxWidth: '720px', margin: '0 auto 36px auto', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
            Add any recruiter email & job posting to your queue. Our multi-tenant engine automatically aligns your profile with the job's key requirements and delivers your tailored resume and custom PDF directly to employer inboxes every day at 9:00 AM.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
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

          <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '28px', color: 'var(--c-on-dark-muted)', fontSize: '13px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--c-go)" /> Strict Tenant Data Isolation
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--c-go)" /> Automated 9:00 AM Cron Schedule
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--c-go)" /> Custom PDF Resume Attachment
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
          <div className="glass-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--c-brand-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-brand)', marginBottom: '16px' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--c-ink)' }}>
              9:00 AM Daily Automated Cron
            </h3>
            <p style={{ color: 'var(--c-ink-soft)', fontSize: '14px', lineHeight: 1.6 }}>
              Runs reliably every weekday at 9:00 AM. It fetches your active targets, formats your tailored application, and delivers it to recruiters at the optimal morning peak time.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--c-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-accent)', marginBottom: '16px' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--c-ink)' }}>
              Isolated Multi-Tenant Security
            </h3>
            <p style={{ color: 'var(--c-ink-soft)', fontSize: '14px', lineHeight: 1.6 }}>
              Every user has a completely segregated environment. Your resumes, job target queues, custom uploaded PDFs, and logs are 100% private to your authenticated account.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--c-go-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-go)', marginBottom: '16px' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--c-ink)' }}>
              Gmail REST API + Custom PDF
            </h3>
            <p style={{ color: 'var(--c-ink-soft)', fontSize: '14px', lineHeight: 1.6 }}>
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
