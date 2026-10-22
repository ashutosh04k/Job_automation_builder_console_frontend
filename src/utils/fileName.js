const slug = (s = '') => String(s).trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

/** "Jane Doe", "Frontend Developer", "Acme" -> "Jane_Doe_Frontend_Developer_Acme.pdf" */
export function resumeFileName(fullName, role, company) {
  return [slug(fullName) || 'Resume', slug(role), slug(company)].filter(Boolean).join('_') + '.pdf';
}
