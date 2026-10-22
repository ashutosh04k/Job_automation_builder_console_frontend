// Pure helpers for the master-resume editor.

export const EMPTY = {
  experience: () => ({ company: '', role: '', period: '', location: '', highlights: [] }),
  education: () => ({ degree: '', institution: '', period: '', score: '' }),
  skills: () => ({ category: '', items: [] }),
  projects: () => ({ name: '', link: '', technologies: [], highlights: [] })
};

export const SECTION_KEYS = ['experience', 'skills', 'education', 'projects', 'certifications', 'achievements'];
const HEADER_KEYS = ['fullName', 'title', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'summary'];

/**
 * Apply a parsed PDF draft to the current resume.
 * Sections are replaced by the PDF's; header fields only fill in when the PDF has a value
 * (so a good saved value is never wiped by a missing one).
 */
export function applyDraft(resume, draft) {
  const next = { ...resume };
  HEADER_KEYS.forEach((k) => { if (draft[k]) next[k] = draft[k]; });
  SECTION_KEYS.forEach((k) => { next[k] = Array.isArray(draft[k]) ? draft[k] : []; });
  return next;
}

/** "a\nb\n\nc" -> ["a","b","c"] (one bullet per line). */
export const linesToList = (text = '') => text.split('\n').map((s) => s.trim()).filter(Boolean);
/** "a, b ,c" -> ["a","b","c"] */
export const csvToList = (text = '') => text.split(',').map((s) => s.trim()).filter(Boolean);

export function countDraft(d = {}) {
  const bullets = (d.experience || []).reduce((n, e) => n + (e.highlights || []).length, 0)
    + (d.projects || []).reduce((n, p) => n + (p.highlights || []).length, 0);
  return {
    roles: (d.experience || []).length,
    projects: (d.projects || []).length,
    bullets,
    skills: (d.skills || []).reduce((n, g) => n + (g.items || []).length, 0),
    education: (d.education || []).length
  };
}
