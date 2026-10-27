import React, { useMemo, useState } from 'react';
import { PlusCircle, Loader2, AlertCircle } from 'lucide-react';
import { apiUrl, authFetch } from '../config/api';

/**
 * "Add missing skills I really have": the user ticks JD terms they have used and
 * adds each one VISIBLY to the master resume, either to the Skills list (partial
 * credit) or as a one-line bullet in their own words (full credit). Nothing is
 * hidden or invented. Same API as the extension: POST /api/resume/add-missing.
 *
 * Props:
 *   report   ATS report (backend) incl. keywords + addTargets
 *   onSaved  ({ added }) => void   called after a successful save (re-score / re-render there)
 */

const BULLET_MIN = 15;
const BULLET_MAX = 220;

/** One row per missing term ("Webpack / Vite" becomes two rows). */
function missingTerms(report) {
  const k = report?.keywords || {};
  const rows = [];
  const seen = new Set();
  const push = (term, kind) => {
    const t = String(term || '').trim();
    if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); rows.push({ term: t, kind }); }
  };
  (k.required?.missing || []).forEach((g) => g.split(' / ').forEach((t) => push(t, 'Required')));
  (k.preferred?.missing || []).forEach((g) => g.split(' / ').forEach((t) => push(t, 'Nice to have')));
  (k.terms?.missing || []).forEach((t) => push(t, 'JD term'));
  return rows;
}

// Rough check while typing (the server does the real one): does the sentence name the term?
const namesTerm = (term, text) => term.toLowerCase().replace(/\.js$/, '').split(/[\s/]+/)
  .filter((w) => w.length > 2).some((w) => text.toLowerCase().includes(w.replace(/s$/, '')));

const box = { border: '1px solid var(--c-line)', borderRadius: 10, padding: 12, background: 'var(--c-surface)', display: 'flex', flexDirection: 'column', gap: 10 ,marginBottom:'40px'};
const small = { fontSize: 12, color: 'var(--c-ink-soft)', margin: 0, lineHeight: 1.45 };
const field = { width: '100%', boxSizing: 'border-box', padding: '7px 9px', borderRadius: 6, border: '1px solid var(--c-line-strong)', background: 'var(--c-surface)', color: 'var(--c-ink)', font: 'inherit', fontSize: 12 };

export default function AddMissingPanel({ report, onSaved }) {
  const rows = useMemo(() => missingTerms(report), [report]);
  const targets = report?.addTargets || [];
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({}); // term -> { checked, mode, target, bullet }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!report || report.score == null || rows.length === 0) return null;

  const get = (term, kind) => state[term] || {
    checked: false, mode: kind === 'JD term' ? 'bullet' : 'skill', target: targets[0]?.key || '', bullet: ''
  };
  const set = (term, kind, patch) => setState((s) => ({ ...s, [term]: { ...get(term, kind), ...patch } }));
  const chosen = rows.filter((r) => get(r.term, r.kind).checked);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const additions = chosen.map(({ term, kind }) => {
        const r = get(term, kind);
        return r.mode === 'bullet' ? { term, mode: 'bullet', bullet: r.bullet.trim(), target: r.target } : { term, mode: 'skill' };
      });
      const res = await authFetch(apiUrl('/api/resume/add-missing'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additions })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) throw new Error((body.errors && body.errors.join(' ')) || body.error || `Could not save (${res.status})`);
      setState({});
      setOpen(false);
      onSaved?.(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)} style={{ alignSelf: 'stretch', justifyContent: 'center',marginBottom:'40px' }}>
        <PlusCircle size={14} /> Add missing skills I really have ({rows.length})
      </button>
    );
  }

  return (
    <section style={box} aria-label="Add missing skills">
      <p style={small}>
        Tick only what you have really used. It is added <strong>visibly</strong> to your master resume, so it counts for every job.
        A bullet in your own words counts fully; a Skills-list entry counts partly.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
        {rows.map(({ term, kind }, i) => {
          const r = get(term, kind);
          const len = r.bullet.trim().length;
          const ok = len >= BULLET_MIN && namesTerm(term, r.bullet);
          const id = `am-${i}`;
          return (
            <div key={term} style={{ border: '1px solid var(--c-line)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--c-ink)', cursor: 'pointer' }}>
                <input id={id} type="checkbox" checked={r.checked} onChange={(e) => set(term, kind, { checked: e.target.checked })} />
                {term}
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--c-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{kind}</span>
              </label>

              {r.checked && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 24 }}>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--c-ink)' }} role="radiogroup" aria-label={`How to add ${term}`}>
                    {[['skill', 'Skills list'], ['bullet', 'Bullet (counts more)']].map(([value, label]) => (
                      <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input type="radio" name={`${id}-mode`} checked={r.mode === value} onChange={() => set(term, kind, { mode: value })} />
                        {label}
                      </label>
                    ))}
                  </div>
                  {r.mode === 'bullet' && (
                    <>
                      <select aria-label={`Where you used ${term}`} value={r.target} onChange={(e) => set(term, kind, { target: e.target.value })} style={field}>
                        {targets.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                      <textarea
                        aria-label={`Bullet showing ${term}`}
                        rows={2}
                        maxLength={BULLET_MAX}
                        placeholder={`e.g. Used ${term} to … (one line, your own words)`}
                        value={r.bullet}
                        onChange={(e) => set(term, kind, { bullet: e.target.value })}
                        style={{ ...field, resize: 'vertical' }}
                      />
                      <span style={{ fontSize: 11, color: !len ? 'var(--c-ink-soft)' : ok ? 'var(--c-go)' : 'var(--c-accent-deep)' }}>
                        {!len ? `Mention "${term}" and what you did with it (${BULLET_MIN}–${BULLET_MAX} characters).`
                          : !namesTerm(term, r.bullet) ? `Name "${term}" in the sentence so an ATS can find it.`
                          : len < BULLET_MIN ? 'A little more detail, please.' : `${len}/${BULLET_MAX} · looks good`}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12, color: 'var(--c-error)' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setOpen(false); setError(''); }} style={{ flex: 1, justifyContent: 'center' }}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving || chosen.length === 0} style={{ flex: 1, justifyContent: 'center' }}>
          {saving ? <><Loader2 size={14} className="spin-animation" /> Saving…</> : `Save & re-score (${chosen.length})`}
        </button>
      </div>
    </section>
  );
}
