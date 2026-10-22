import React from 'react';
import { Gauge, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Loader2, RefreshCw, Info } from 'lucide-react';

/**
 * Presentational view of the backend ATS report (backend/shared/atsScorer.js).
 * Props: status, report, error, onRetry, title, compact
 * Every number shown here comes from the server; nothing is computed or padded locally.
 */

const scoreColor = (score) =>
  score >= 80 ? 'var(--c-go)' : score >= 65 ? 'var(--c-brand)' : score >= 50 ? 'var(--c-accent)' : 'var(--c-error)';

function ScoreRing({ score, size = 84 }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const value = Math.max(0, Math.min(100, score ?? 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`ATS match score ${value} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-line)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={scoreColor(value)} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: size * 0.28, fontWeight: 800, fill: 'var(--c-ink)' }}>
        {value}
      </text>
    </svg>
  );
}

function Chip({ children, tone }) {
  const tones = {
    good: { bg: 'var(--c-go-soft)', fg: 'var(--c-go)' },
    bad: { bg: 'var(--c-error-soft)', fg: 'var(--c-error)' },
    warn: { bg: 'var(--c-accent-soft)', fg: 'var(--c-accent-deep)' }
  }[tone];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
      background: tones.bg, color: tones.fg, border: '1px solid var(--c-line)', whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
}

function ChipGroup({ label, items, tone, icon: Icon }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-soft)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        <Icon size={12} /> {label} ({items.length})
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((k) => <Chip key={k} tone={tone}>{k}</Chip>)}
      </div>
    </div>
  );
}

const box = { display: 'flex', flexDirection: 'column', gap: 14 };
const muted = { fontSize: 12, color: 'var(--c-ink-soft)', margin: 0, lineHeight: 1.5 };

export default function AtsScorePanel({ status, report, error, onRetry, title = 'ATS Match Score', compact = false }) {
  const header = (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
      <Gauge size={16} color="var(--c-brand)" /> {title}
    </h3>
  );

  if (status === 'idle') {
    return (
      <div className="card" style={box}>
        {header}
        <p style={muted}>Paste a job description to see how well your tailored resume matches it.</p>
      </div>
    );
  }

  if (status === 'loading' && !report) {
    return (
      <div className="card" style={box} aria-busy="true">
        {header}
        <p style={{ ...muted, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loader2 size={14} className="spin-animation" /> Tailoring your resume and scoring it…
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="card" style={box} role="alert">
        {header}
        <p style={{ ...muted, color: 'var(--c-error)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
        </p>
        {onRetry && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{ alignSelf: 'flex-start' }}>
            <RefreshCw size={13} /> Try again
          </button>
        )}
      </div>
    );
  }

  if (!report || report.score === null) {
    return (
      <div className="card" style={box}>
        {header}
        <p style={muted}>{report?.reason || 'No score available.'}</p>
      </div>
    );
  }

  const { score, label, confidence, breakdown, keywords, suggestions, checks } = report;

  return (
    <div className="card" style={{ ...box, opacity: status === 'loading' ? 0.6 : 1, transition: 'opacity 0.2s' }} aria-busy={status === 'loading'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        {header}
        {status === 'loading' && <Loader2 size={14} className="spin-animation" aria-label="Updating score" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <ScoreRing score={score} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(score) }}>{label} match</span>
          <span style={muted}>Scored on the exact text of the tailored PDF.</span>
          {confidence !== 'high' && (
            <span style={{ ...muted, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--c-accent-deep)' }}>
              <Info size={12} /> {confidence === 'low' ? 'Low confidence: few skills found in the JD.' : 'Medium confidence: short skill list in the JD.'}
            </span>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {breakdown.map((b) => (
          <div key={b.key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
              <span style={{ color: 'var(--c-ink)', fontWeight: 600 }}>
                {b.label} <span style={{ color: 'var(--c-ink-soft)', fontWeight: 400 }}>{b.weight ? `· ${b.weight}%` : '· not scored'}</span>
              </span>
              <span style={{ color: b.score === null ? 'var(--c-ink-soft)' : scoreColor(b.score), fontWeight: 700 }}>
                {b.score === null ? '—' : b.score}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: 'var(--c-surface-alt)', overflow: 'hidden' }}>
              <div style={{ width: `${b.score ?? 0}%`, height: '100%', background: b.score === null ? 'transparent' : scoreColor(b.score), transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--c-ink-soft)' }}>{b.detail}</span>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <ChipGroup label="Required — on resume" items={keywords.required.matched} tone="good" icon={CheckCircle2} />
      <ChipGroup label="Required — missing" items={keywords.required.missing} tone="bad" icon={XCircle} />
      <ChipGroup label="Nice to have — missing" items={keywords.preferred.missing} tone="warn" icon={AlertTriangle} />
      {!compact && <ChipGroup label="Nice to have — on resume" items={keywords.preferred.matched} tone="good" icon={CheckCircle2} />}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-soft)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            <Lightbulb size={12} /> How to improve
          </span>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.slice(0, compact ? 3 : undefined).map((s) => (
              <li key={s} style={{ fontSize: 12, color: 'var(--c-ink)', lineHeight: 1.45 }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Format checks */}
      {!compact && checks?.length > 0 && (
        <details>
          <summary style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)', cursor: 'pointer' }}>
            Format checks ({checks.filter((c) => c.passed).length}/{checks.length} passed)
          </summary>
          <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {checks.map((c) => (
              <li key={c.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-ink)' }}>
                {c.passed
                  ? <CheckCircle2 size={13} color="var(--c-go)" aria-label="passed" />
                  : <XCircle size={13} color="var(--c-error)" aria-label="failed" />}
                {c.label}{c.detail ? <span style={{ color: 'var(--c-ink-soft)' }}> · {c.detail}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p style={{ ...muted, fontSize: 11 }}>
        This measures how well your resume covers this job description. Each company configures its ATS differently, so no tool can give an exact pass/fail.
      </p>
    </div>
  );
}
