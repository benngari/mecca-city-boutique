// Small CSV helpers for the "Export CSV" downloads (opens cleanly in Excel / Google Sheets).

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);

  // Stop spreadsheet apps running text that starts like a formula (e.g. =HYPERLINK(...)).
  // Numbers are left alone so negative profits stay numeric.
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  if (/[",\r\n]/.test(text)) {
    text = '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

// columns: [{ label: 'Product', value: (row) => row.name }, ...]
export function toCsv(columns, rows) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(','));
  // The leading \uFEFF makes Excel open the file as UTF-8.
  return '\uFEFF' + [header, ...lines].join('\r\n') + '\r\n';
}

export function csvResponse(filename, csvText) {
  return new Response(csvText, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

// YYYY-MM-DD in Kenyan time.
export function eatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
}

// YYYY-MM-DD, HH:MM:SS in Kenyan time.
export function eatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-CA', { timeZone: 'Africa/Nairobi', hour12: false });
}
