import { triggerBlobDownload } from "./fileDownload.js";
import { createZipBlob } from "./zipStore.js";

export interface ExcelColumn {
  header: string;
  key: string;
  format?: (value: unknown) => string;
}

export interface ExportToExcelArgs {
  filename: string;
  title: string;
  columns: ExcelColumn[];
  data: Array<Record<string, unknown>>;
  timestamp: string;
  /** Excel table display name. Defaults to a sanitized title. */
  tableName?: string;
  sheetName?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnLetter(index: number): string {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, " ").trim() || "Sheet1";
  return cleaned.slice(0, 31);
}

function sanitizeTableName(name: string): string {
  const cleaned = name
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/^_+/, "")
    .replace(/_+/g, "_");
  const withPrefix = /^[A-Za-z_]/.test(cleaned) ? cleaned : `Table_${cleaned}`;
  return (withPrefix || "ExportTable").slice(0, 255);
}

function uniqueHeaders(columns: ExcelColumn[]): string[] {
  const seen = new Map<string, number>();
  return columns.map((column, index) => {
    const base = column.header.trim() || `Column${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

function formatCell(column: ExcelColumn, row: Record<string, unknown>): string {
  const raw = row[column.key];
  if (column.format) {
    return column.format(raw);
  }
  if (raw == null) {
    return "";
  }
  return String(raw);
}

function buildSheetXml(
  columns: ExcelColumn[],
  headers: string[],
  data: Array<Record<string, unknown>>,
  tableRef: string,
): string {
  const headerRow = headers
    .map((header, index) => {
      const cellRef = `${columnLetter(index)}1`;
      return `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`;
    })
    .join("");

  const bodyRows = data
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 2;
      const cells = columns
        .map((column, columnIndex) => {
          const cellRef = `${columnLetter(columnIndex)}${excelRow}`;
          return `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(formatCell(column, row))}</t></is></c>`;
        })
        .join("");
      return `<row r="${excelRow}">${cells}</row>`;
    })
    .join("");

  // Do not put a worksheet-level autoFilter here: it conflicts with the Table autoFilter
  // and Excel will repair the file by removing the Table.
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="${tableRef}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>
    <row r="1">${headerRow}</row>
    ${bodyRows}
  </sheetData>
  <tableParts count="1">
    <tablePart r:id="rId1"/>
  </tableParts>
</worksheet>`;
}

function buildTableXml(
  tableName: string,
  headers: string[],
  tableRef: string,
): string {
  const columnsXml = headers
    .map(
      (header, index) =>
        `<tableColumn id="${index + 1}" name="${escapeXml(header)}"/>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="${escapeXml(tableName)}" displayName="${escapeXml(tableName)}" ref="${tableRef}" headerRowCount="1" totalsRowShown="0">
  <autoFilter ref="${tableRef}"/>
  <tableColumns count="${headers.length}">
    ${columnsXml}
  </tableColumns>
  <tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>
</table>`;
}

/** Build a real Office Open XML (.xlsx) workbook containing an Excel Table. */
export function buildExcelWorkbook(args: ExportToExcelArgs): Blob {
  const { title, columns, data } = args;
  if (columns.length === 0) {
    throw new Error("Excel export requires at least one column.");
  }

  const headers = uniqueHeaders(columns);
  const rowCount = Math.max(data.length + 1, 1);
  const lastColumn = columnLetter(columns.length - 1);
  const tableRef = `A1:${lastColumn}${rowCount}`;
  const sheetName = sanitizeSheetName(args.sheetName ?? title);
  const tableName = sanitizeTableName(args.tableName ?? title);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="15000"/>
  </bookViews>
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const sheetRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/>
</Relationships>`;

  // Excel expects the second fill (gray125). A single-fill stylesheet often makes
  // table styles fail validation and get stripped on open.
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1">
    <font>
      <sz val="11"/>
      <color theme="1"/>
      <name val="Calibri"/>
      <family val="2"/>
      <scheme val="minor"/>
    </font>
  </fonts>
  <fills count="2">
    <fill>
      <patternFill patternType="none"/>
    </fill>
    <fill>
      <patternFill patternType="gray125"/>
    </fill>
  </fills>
  <borders count="1">
    <border>
      <left/>
      <right/>
      <top/>
      <bottom/>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;

  const zip = createZipBlob([
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rootRels },
    { name: "xl/workbook.xml", data: workbook },
    { name: "xl/_rels/workbook.xml.rels", data: workbookRels },
    { name: "xl/styles.xml", data: styles },
    {
      name: "xl/worksheets/sheet1.xml",
      data: buildSheetXml(columns, headers, data, tableRef),
    },
    { name: "xl/worksheets/_rels/sheet1.xml.rels", data: sheetRels },
    { name: "xl/tables/table1.xml", data: buildTableXml(tableName, headers, tableRef) },
  ]);

  return new Blob([zip], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** Download a proper .xlsx file with the list data as an Excel Table. */
export async function exportToExcel(args: ExportToExcelArgs): Promise<void> {
  const workbook = buildExcelWorkbook(args);
  const safeName = args.filename.replace(/[\\/:*?"<>|]+/g, "-").trim() || "export";
  triggerBlobDownload(workbook, `${safeName}-${args.timestamp}.xlsx`);
}
