// Estimates whether a resume bullet prints on one line in the tailored PDF.
// Must match backend/services/pdfService.js: Times 10.5pt, BULLET_TEXT_WIDTH 561.2pt.
// The server also shortens wording and tightens spacing a little, so a bullet
// up to ~3% over still prints on one line. This is an estimate (fonts differ slightly by OS).

const LINE_WIDTH_PT = 561.2;
const TOLERANCE = 1.03;
const FONT = '10.5px "Times New Roman", Times, serif';

let ctx = null;
function measure(text) {
  if (!ctx) {
    if (typeof document === 'undefined') return text.length * 4.6; // rough fallback
    ctx = document.createElement('canvas').getContext('2d');
    ctx.font = FONT;
  }
  return ctx.measureText(text).width;
}

/** { lines, overBy } — overBy = characters to cut so it fits on one line (0 if it fits). */
export function bulletFit(text = '') {
  const t = text.trim();
  if (!t) return { lines: 0, overBy: 0 };
  const w = measure(t);
  if (w <= LINE_WIDTH_PT * TOLERANCE) return { lines: 1, overBy: 0 };
  const perChar = w / t.length;
  return { lines: Math.ceil(w / LINE_WIDTH_PT), overBy: Math.ceil((w - LINE_WIDTH_PT) / perChar) };
}
