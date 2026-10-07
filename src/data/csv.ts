// CSV export for audit. Cells that a spreadsheet would read as a formula are prefixed with an apostrophe,
// so a company name or note starting with "=", "+", "-" or "@" can never execute on open.
const cell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function downloadCsv(filename: string, head: string[], rows: string[][]) {
  const csv = [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
