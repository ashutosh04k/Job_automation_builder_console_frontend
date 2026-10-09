import React from 'react';
import { Zap, Clock, Mail, Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function PublicWebsite({ onGoToAdmin }) {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div class="glass-card" style={{ 
        textAlign: 'center', 
        padding: '60px 40px', 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.6) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)'
      }}>
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(56, 189, 248, 0.15)', 
          color: '#38bdf8', 
          padding: '6px 16px', 
          borderRadius: '30px', 
          fontSize: '13px', 
          fontWeight: 700, 
          marginBottom: '20px' 
        }}>
          <Sparkles size={16} /> Automated Daily Resume Tailor & Mailer
        </span>
        
        <h1 style={{ 
          fontSize: '46px', 
          fontWeight: 800, 
          lineHeight: 1.15, 
          letterSpacing: '-1px', 
          marginBottom: '20px',
          background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Get Hired Faster with Daily 9 AM <br /> Tailored Resumes Delivered to Employers
        </h1>

        <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '720px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
          Input your target recruiter email & job description in your admin portal. Our intelligent cron scheduler rewrites and formats a matching resume, emailing it automatically every morning at 9:00 AM.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button class="btn btn-primary" onClick={onGoToAdmin} style={{ padding: '14px 28px', fontSize: '15px' }}>
            Open Admin Panel <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '30px' }}>
        <div class="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '16px' }}>
            <Clock size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>9:00 AM Daily Cron Scheduler</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
            Runs silently every morning on node-cron schedule (<code style={{ color: '#38bdf8' }}>0 9 * * *</code>), fetching active job targets and sending emails while you sleep.
          </p>
        </div>

        <div class="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '16px' }}>
            <Cpu size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Dynamic Resume Tailoring</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
            Parses the job description to highlight matching keywords, customized executive summary, and optimized technical bullet points for maximum recruiter impact.
          </p>
        </div>

        <div class="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '16px' }}>
            <Mail size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Nodemailer Integration</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
            Integrated with custom SMTP or Gmail App Passwords. Supports simulation mode for instant zero-config testing.
          </p>
        </div>
      </div>

      {/* Live Architecture Flow */}
      <div class="glass-card" style={{ marginTop: '30px' }}>
        <h3 class="card-header-title">
          <ShieldCheck size={20} color="#34d399" /> System Workflow & MERN Architecture
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>STEP 1</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Admin Input</div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Enter recipient email & job description in admin form.</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>STEP 2</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>MongoDB Storage</div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Saved securely to Mongoose JobTarget collection.</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>STEP 3</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>9:00 AM Cron Trigger</div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Node-cron automatically fires daily at 9am.</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: '#34d399', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>STEP 4</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Email Dispatch</div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Nodemailer delivers tailored HTML resume to mail.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
