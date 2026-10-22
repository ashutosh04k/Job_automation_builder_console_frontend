import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Building, GraduationCap, FolderGit2, Code, Award } from 'lucide-react';
import { EMPTY, linesToList, csvToList } from '../utils/resumeDraft';

/**
 * Editor for the structured parts of the master resume (what the tailored PDF is built from).
 * Props: value (resume object), onChange(nextResume)
 */

/** Textarea/input that edits a list as text, keeping what you type until the list changes from outside. */
function ListField({ id, value = [], onChange, parse, join, multiline = false, rows = 4, placeholder }) {
  const [text, setText] = useState(join(value));
  useEffect(() => {
    // Only overwrite local text when the list really changed (e.g. a PDF import), not on every keystroke.
    if (join(parse(text)) !== join(value)) setText(join(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const props = {
    id,
    className: multiline ? 'form-textarea' : 'form-input',
    value: text,
    placeholder,
    onChange: (e) => { setText(e.target.value); onChange(parse(e.target.value)); }
  };
  return multiline ? <textarea {...props} rows={rows} /> : <input type="text" {...props} />;
}
const Bullets = (p) => <ListField {...p} multiline parse={linesToList} join={(l) => l.join('\n')} />;
const Csv = (p) => <ListField {...p} parse={csvToList} join={(l) => l.join(', ')} />;

function Field({ id, label, value, onChange, placeholder }) {
  return (
    <div className="form-group" style={{ margin: 0 }}>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input id={id} type="text" className="form-input" value={value || ''} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function EntryToolbar({ index, total, onMove, onRemove, label }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`}><ArrowUp size={14} /></button>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label={`Move ${label} down`}><ArrowDown size={14} /></button>
      <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemove(index)} aria-label={`Remove ${label}`}><Trash2 size={14} /></button>
    </div>
  );
}

const entryBox = { border: '1px solid var(--c-line)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--c-surface)' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 10 };

function Section({ icon: Icon, title, hint, count, onAdd, addLabel, children }) {
  return (
    <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h3 className="card-header-title" style={{ fontSize: 16, margin: 0 }}><Icon size={18} /> {title} <span style={{ fontWeight: 400, color: 'var(--c-ink-soft)' }}>({count})</span></h3>
          {hint && <p className="card-subtitle" style={{ margin: '4px 0 0' }}>{hint}</p>}
        </div>
        {onAdd && <button type="button" className="btn btn-secondary btn-sm" onClick={onAdd}><Plus size={14} /> {addLabel}</button>}
      </div>
      {children}
    </section>
  );
}

export default function ResumeSectionsEditor({ value, onChange }) {
  const set = (key, list) => onChange({ ...value, [key]: list });
  const list = (key) => (Array.isArray(value[key]) ? value[key] : []);
  const update = (key, i, patch) => set(key, list(key).map((e, k) => (k === i ? { ...e, ...patch } : e)));
  const remove = (key) => (i) => set(key, list(key).filter((_, k) => k !== i));
  const move = (key) => (i, dir) => {
    const arr = [...list(key)];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set(key, arr);
  };
  const add = (key) => () => set(key, [...list(key), EMPTY[key]()]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Section icon={Building} title="Experience" count={list('experience').length} onAdd={add('experience')} addLabel="Add role"
        hint="Most recent first. Put every bullet you have here; the tailored resume picks the most relevant ones for each job and fits one page.">
        {list('experience').map((e, i) => (
          <div key={i} style={entryBox}>
            <EntryToolbar index={i} total={list('experience').length} onMove={move('experience')} onRemove={remove('experience')} label={e.role || `role ${i + 1}`} />
            <div style={grid2}>
              <Field id={`exp-role-${i}`} label="Role" value={e.role} onChange={(v) => update('experience', i, { role: v })} placeholder="Software Developer" />
              <Field id={`exp-company-${i}`} label="Company" value={e.company} onChange={(v) => update('experience', i, { company: v })} placeholder="Acme Pvt Ltd" />
              <Field id={`exp-period-${i}`} label="Dates" value={e.period} onChange={(v) => update('experience', i, { period: v })} placeholder="Jul 2025 - Present" />
              <Field id={`exp-loc-${i}`} label="Location (optional)" value={e.location} onChange={(v) => update('experience', i, { location: v })} placeholder="Gurugram, India" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor={`exp-bullets-${i}`}>Bullets (one per line)</label>
              <Bullets id={`exp-bullets-${i}`} value={e.highlights} rows={Math.min(12, Math.max(4, (e.highlights || []).length + 1))}
                onChange={(v) => update('experience', i, { highlights: v })} placeholder="Built ... using ..., which ... (impact)" />
            </div>
          </div>
        ))}
      </Section>

      <Section icon={Code} title="Skills" count={list('skills').length} onAdd={add('skills')} addLabel="Add group"
        hint="Comma-separated. Spell skills the way job descriptions do (e.g. React.js, Node.js).">
        {list('skills').map((g, i) => (
          <div key={i} style={{ ...entryBox, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 160px' }}>
              <Field id={`sk-cat-${i}`} label="Group" value={g.category} onChange={(v) => update('skills', i, { category: v })} placeholder="Frontend" />
            </div>
            <div className="form-group" style={{ margin: 0, flex: '3 1 280px' }}>
              <label className="form-label" htmlFor={`sk-items-${i}`}>Skills</label>
              <Csv id={`sk-items-${i}`} value={g.items} onChange={(v) => update('skills', i, { items: v })} placeholder="React.js, Redux, TypeScript" />
            </div>
            <EntryToolbar index={i} total={list('skills').length} onMove={move('skills')} onRemove={remove('skills')} label={g.category || `skill group ${i + 1}`} />
          </div>
        ))}
      </Section>

      <Section icon={GraduationCap} title="Education" count={list('education').length} onAdd={add('education')} addLabel="Add education">
        {list('education').map((e, i) => (
          <div key={i} style={entryBox}>
            <EntryToolbar index={i} total={list('education').length} onMove={move('education')} onRemove={remove('education')} label={e.degree || `education ${i + 1}`} />
            <div style={grid2}>
              <Field id={`edu-deg-${i}`} label="Degree" value={e.degree} onChange={(v) => update('education', i, { degree: v })} placeholder="B.Tech Computer Science" />
              <Field id={`edu-inst-${i}`} label="Institution" value={e.institution} onChange={(v) => update('education', i, { institution: v })} />
              <Field id={`edu-period-${i}`} label="Years" value={e.period} onChange={(v) => update('education', i, { period: v })} placeholder="2019 - 2023" />
              <Field id={`edu-score-${i}`} label="Score (optional)" value={e.score} onChange={(v) => update('education', i, { score: v })} placeholder="CGPA 8.5/10" />
            </div>
          </div>
        ))}
      </Section>

      <Section icon={FolderGit2} title="Projects" count={list('projects').length} onAdd={add('projects')} addLabel="Add project">
        {list('projects').map((p, i) => (
          <div key={i} style={entryBox}>
            <EntryToolbar index={i} total={list('projects').length} onMove={move('projects')} onRemove={remove('projects')} label={p.name || `project ${i + 1}`} />
            <div style={grid2}>
              <Field id={`pr-name-${i}`} label="Name" value={p.name} onChange={(v) => update('projects', i, { name: v })} />
              <Field id={`pr-link-${i}`} label="Link (optional)" value={p.link} onChange={(v) => update('projects', i, { link: v })} placeholder="https://..." />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor={`pr-tech-${i}`}>Technologies</label>
              <Csv id={`pr-tech-${i}`} value={p.technologies} onChange={(v) => update('projects', i, { technologies: v })} placeholder="React.js, Node.js, MongoDB" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor={`pr-bullets-${i}`}>Bullets (one per line)</label>
              <Bullets id={`pr-bullets-${i}`} value={p.highlights} rows={4} onChange={(v) => update('projects', i, { highlights: v })} />
            </div>
          </div>
        ))}
      </Section>

      <Section icon={Award} title="Certifications & Achievements" count={list('certifications').length + list('achievements').length}
        hint="Shown at the end of the resume when there is room; dropped first when fitting one page.">
        <div style={grid2}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="certs">Certifications (one per line)</label>
            <Bullets id="certs" value={list('certifications')} rows={4} onChange={(v) => set('certifications', v)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="achievements">Achievements (one per line)</label>
            <Bullets id="achievements" value={list('achievements')} rows={4} onChange={(v) => set('achievements', v)} />
          </div>
        </div>
      </Section>
    </div>
  );
}
