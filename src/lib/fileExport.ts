export function downloadCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","),
    ...rows.map((row) => headers.map((key) => {
      const value = row[key] ?? "";
      const formatted = typeof value === "string" ? value.replace(/"/g, '""') : value;
      return `"${formatted}"`;
    }).join(","))
  ].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadPDF(filename: string, title: string, rows: any[]) {
  if (!rows.length) return;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  doc.setFontSize(18);
  doc.text(title, margin, y);
  y += 30;

  doc.setFontSize(10);

  const headers = Object.keys(rows[0]);
  const rowHeight = 18;
  const colWidth = (pageWidth - margin * 2) / headers.length;

  headers.forEach((header, index) => {
    doc.text(header.toUpperCase(), margin + index * colWidth, y);
  });

  y += rowHeight;

  rows.forEach((row) => {
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 60;
    }

    headers.forEach((header, index) => {
      const text = String(row[header] ?? "");
      doc.text(text, margin + index * colWidth, y, { maxWidth: colWidth - 10 });
    });

    y += rowHeight;
  });

  doc.save(filename);
}

export async function downloadXLSX(filename: string, rows: any[]) {
  if (!rows.length) return;
  const { utils, writeFile } = await import("xlsx");
  const worksheet = utils.json_to_sheet(rows);
  const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
  writeFile(workbook, filename);
}
