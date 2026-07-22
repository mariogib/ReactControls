import { triggerBlobDownload } from "./fileDownload.js";
import type { ExcelColumn } from "./excelExport.js";

export type PdfColumn = ExcelColumn;

export interface ExportToPdfArgs {
  filename: string;
  title: string;
  columns: PdfColumn[];
  data: Array<Record<string, unknown>>;
  timestamp: string;
}

type PdfPageSize = {
  width: number;
  height: number;
};

const PAGE: PdfPageSize = { width: 842, height: 595 }; // A4 landscape
const MARGIN = 36;
const TITLE_SIZE = 16;
const HEADER_SIZE = 9;
const BODY_SIZE = 8;
const ROW_HEIGHT = 16;
const TITLE_GAP = 20;

function formatCell(column: PdfColumn, row: Record<string, unknown>): string {
  const raw = row[column.key];
  if (column.format) {
    return column.format(raw);
  }
  if (raw == null) {
    return "";
  }
  return String(raw);
}

/** Escape text for PDF literal strings (basic WinAnsi/ASCII). */
function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function truncateToWidth(value: string, maxWidth: number, fontSize: number): string {
  const approxCharWidth = fontSize * 0.5;
  const maxChars = Math.max(1, Math.floor(maxWidth / approxCharWidth));
  if (value.length <= maxChars) {
    return value;
  }
  if (maxChars <= 1) {
    return value.slice(0, 1);
  }
  return `${value.slice(0, maxChars - 1)}~`;
}

function buildPageContent(
  title: string,
  headers: string[],
  rows: string[][],
  columnWidths: number[],
  pageIndex: number,
  pageCount: number,
  timestamp: string,
): string {
  const lines: string[] = [];
  let y = PAGE.height - MARGIN;

  lines.push("BT");
  lines.push(`/F1 ${TITLE_SIZE} Tf`);
  lines.push(`1 0 0 1 ${MARGIN} ${y - TITLE_SIZE} Tm`);
  lines.push(`(${escapePdfText(title)}) Tj`);
  lines.push("ET");
  y -= TITLE_SIZE + TITLE_GAP;

  const drawRow = (cells: string[], fontSize: number, headerRow: boolean) => {
    let x = MARGIN;
    lines.push("BT");
    lines.push(`/F${headerRow ? 2 : 1} ${fontSize} Tf`);
    for (let index = 0; index < cells.length; index += 1) {
      const width = columnWidths[index]!;
      const text = truncateToWidth(cells[index] ?? "", width - 6, fontSize);
      lines.push(`1 0 0 1 ${x + 3} ${y - fontSize} Tm`);
      lines.push(`(${escapePdfText(text)}) Tj`);
      x += width;
    }
    lines.push("ET");

    const lineY = y - ROW_HEIGHT + 2;
    lines.push("0.75 G");
    lines.push(`${MARGIN} ${lineY} m ${PAGE.width - MARGIN} ${lineY} l S`);
    y -= ROW_HEIGHT;
  };

  drawRow(headers, HEADER_SIZE, true);

  for (const row of rows) {
    if (y < MARGIN + ROW_HEIGHT * 2) {
      break;
    }
    drawRow(row, BODY_SIZE, false);
  }

  lines.push("BT");
  lines.push("/F1 8 Tf");
  lines.push(`1 0 0 1 ${MARGIN} ${MARGIN - 12} Tm`);
  lines.push(
    `(${escapePdfText(`Generated: ${timestamp}  |  Page ${pageIndex + 1} of ${pageCount}`)}) Tj`,
  );
  lines.push("ET");

  return lines.join("\n");
}

function buildPdfDocument(contentStreams: string[]): Uint8Array {
  const fontRegularObject = 3;
  const fontBoldObject = 4;
  let nextObject = 5;

  const contentObjectNumbers: number[] = [];
  const pageObjectNumbers: number[] = [];

  for (let index = 0; index < contentStreams.length; index += 1) {
    contentObjectNumbers.push(nextObject);
    nextObject += 1;
    pageObjectNumbers.push(nextObject);
    nextObject += 1;
  }

  const objectMap = new Map<number, string>();
  objectMap.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objectMap.set(
    2,
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`,
  );
  objectMap.set(fontRegularObject, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objectMap.set(fontBoldObject, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  for (let index = 0; index < contentStreams.length; index += 1) {
    const stream = contentStreams[index]!;
    const contentObject = contentObjectNumbers[index]!;
    const pageObject = pageObjectNumbers[index]!;
    objectMap.set(
      contentObject,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    objectMap.set(
      pageObject,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Contents ${contentObject} 0 R /Resources << /Font << /F1 ${fontRegularObject} 0 R /F2 ${fontBoldObject} 0 R >> >> >>`,
    );
  }

  const maxObject = Math.max(...objectMap.keys());
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let objectNumber = 1; objectNumber <= maxObject; objectNumber += 1) {
    const body = objectMap.get(objectNumber);
    if (!body) {
      throw new Error(`Missing PDF object ${objectNumber}`);
    }
    offsets[objectNumber] = pdf.length;
    pdf += `${objectNumber} 0 obj\n${body}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${maxObject + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let objectNumber = 1; objectNumber <= maxObject; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObject + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function chunkRows(rows: string[][], rowsPerPage: number): string[][][] {
  if (rows.length === 0) {
    return [[]];
  }
  const pages: string[][][] = [];
  for (let index = 0; index < rows.length; index += rowsPerPage) {
    pages.push(rows.slice(index, index + rowsPerPage));
  }
  return pages;
}

/** Build a landscape PDF containing a tabular list of the provided rows. */
export function buildPdfDocumentBlob(args: ExportToPdfArgs): Blob {
  const { title, columns, data, timestamp } = args;
  if (columns.length === 0) {
    throw new Error("PDF export requires at least one column.");
  }

  const headers = columns.map((column, index) => column.header.trim() || `Column${index + 1}`);
  const tableWidth = PAGE.width - MARGIN * 2;
  const columnWidths = columns.map(() => tableWidth / columns.length);
  const bodyRows = data.map((row) => columns.map((column) => formatCell(column, row)));

  const availableForRows = PAGE.height - MARGIN * 2 - TITLE_SIZE - TITLE_GAP - ROW_HEIGHT - 16;
  const rowsPerPage = Math.max(1, Math.floor(availableForRows / ROW_HEIGHT));
  const pages = chunkRows(bodyRows, rowsPerPage);

  const streams = pages.map((pageRows, pageIndex) =>
    buildPageContent(title, headers, pageRows, columnWidths, pageIndex, pages.length, timestamp),
  );

  const bytes = buildPdfDocument(streams);
  const payload = Uint8Array.from(bytes);
  return new Blob([payload], { type: "application/pdf" });
}

/** Download a PDF report with the list data rendered as a table. */
export async function exportToPdf(args: ExportToPdfArgs): Promise<void> {
  const pdf = buildPdfDocumentBlob(args);
  const safeName = args.filename.replace(/[\\/:*?"<>|]+/g, "-").trim() || "export";
  triggerBlobDownload(pdf, `${safeName}-${args.timestamp}.pdf`);
}
