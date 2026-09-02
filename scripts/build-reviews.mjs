// data/gya_training_reviews_119.csv -> src/data/reviews.json
//
// HANDOFF 5.6: "Render from the CSV at build time, never retype by hand."
// The CSV is the source of truth; this generator is the only thing allowed to
// turn it into something the app imports. Re-run it (npm run build:reviews)
// whenever Apollo sends a new export - never hand-edit src/data/reviews.json.
import { readFileSync, writeFileSync } from 'node:fs';

const CSV = 'data/gya_training_reviews_119.csv';
const OUT = 'src/data/reviews.json';

// The review column is free text containing commas, quotes and newlines, so the
// split has to respect RFC-4180 quoting rather than cutting on every comma.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        // A doubled quote inside a quoted field is one literal quote.
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      // Swallow the \n of a \r\n pair rather than emitting a blank row.
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  // A file with no trailing newline still has one row in hand.
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

const rows = parseCsv(readFileSync(CSV, 'utf8'));
const [header, ...body] = rows;
const cols = header.map((h) => h.trim());

const EXPECTED = ['id', 'reviewer_name', 'role', 'company', 'country', 'review'];
if (EXPECTED.some((c, i) => cols[i] !== c)) {
  throw new Error(`${CSV}: expected columns ${EXPECTED.join(',')} but got ${cols.join(',')}`);
}

const reviews = body.map((r) => {
  const o = Object.fromEntries(cols.map((c, i) => [c, (r[i] ?? '').trim()]));
  return {
    id: Number(o.id),
    name: o.reviewer_name,
    role: o.role,
    company: o.company,
    country: o.country,
    review: o.review,
  };
});

const bad = reviews.filter((r) => !Number.isFinite(r.id) || !r.name || !r.review);
if (bad.length) throw new Error(`${CSV}: ${bad.length} row(s) missing id, name or review text`);

const ids = new Set(reviews.map((r) => r.id));
if (ids.size !== reviews.length) throw new Error(`${CSV}: duplicate ids`);

writeFileSync(OUT, JSON.stringify(reviews, null, 2) + '\n');
console.log(`${OUT}: ${reviews.length} reviews from ${new Set(reviews.map((r) => r.country)).size} countries`);
