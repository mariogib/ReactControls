import test from "node:test";
import assert from "node:assert/strict";
import { buildExcelWorkbook } from "./excelExport.js";

async function readZipTextEntries(blob: Blob): Promise<Map<string, string>> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const entries = new Map<string, string>();
  let offset = 0;
  const decoder = new TextDecoder();

  while (offset + 4 <= bytes.length) {
    const signature =
      bytes[offset]! |
      (bytes[offset + 1]! << 8) |
      (bytes[offset + 2]! << 16) |
      (bytes[offset + 3]! << 24);

    // End of central directory — stop scanning local headers.
    if (signature === 0x06054b50) {
      break;
    }

    // Local file header
    if (signature !== 0x04034b50) {
      break;
    }

    const compression = bytes[offset + 8]! | (bytes[offset + 9]! << 8);
    const compressedSize =
      bytes[offset + 18]! |
      (bytes[offset + 19]! << 8) |
      (bytes[offset + 20]! << 16) |
      (bytes[offset + 21]! << 24);
    const nameLength = bytes[offset + 26]! | (bytes[offset + 27]! << 8);
    const extraLength = bytes[offset + 28]! | (bytes[offset + 29]! << 8);
    const nameStart = offset + 30;
    const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    assert.equal(compression, 0, `entry ${name} should use STORE compression`);
    entries.set(name, decoder.decode(bytes.subarray(dataStart, dataEnd)));
    offset = dataEnd;
  }

  return entries;
}

test("buildExcelWorkbook creates an xlsx zip with worksheet table parts", async () => {
  const workbook = buildExcelWorkbook({
    filename: "campaigns",
    title: "Campaigns",
    timestamp: "2026-07-20",
    columns: [
      { header: "Campaign", key: "name" },
      { header: "Status", key: "status" },
      { header: "Budget", key: "budget", format: (value) => `R ${value}` },
    ],
    data: [
      { name: "VIP Renewal", status: "active", budget: 11200 },
      { name: "Summer Push", status: "scheduled", budget: 5400 },
    ],
  });

  const bytes = new Uint8Array(await workbook.arrayBuffer());
  assert.equal(bytes[0], 0x50); // P
  assert.equal(bytes[1], 0x4b); // K

  const entries = await readZipTextEntries(workbook);
  assert.ok(entries.has("xl/worksheets/sheet1.xml"));
  assert.ok(entries.has("xl/tables/table1.xml"));

  const sheet = entries.get("xl/worksheets/sheet1.xml")!;
  assert.match(sheet, /VIP Renewal/);
  assert.match(sheet, /R 11200/);
  assert.match(sheet, /<tableParts count="1">/);
  assert.doesNotMatch(sheet, /<autoFilter/);

  const table = entries.get("xl/tables/table1.xml")!;
  assert.match(table, /name="Campaigns"/);
  assert.match(table, /ref="A1:C3"/);
  assert.match(table, /headerRowCount="1"/);
  assert.match(table, /<autoFilter ref="A1:C3"\/>/);
  assert.match(table, /tableColumn id="1" name="Campaign"/);
  assert.match(table, /TableStyleMedium2/);

  const styles = entries.get("xl/styles.xml")!;
  assert.match(styles, /patternType="gray125"/);
  assert.match(styles, /defaultTableStyle="TableStyleMedium2"/);
});

test("buildExcelWorkbook rejects empty columns", () => {
  assert.throws(
    () =>
      buildExcelWorkbook({
        filename: "empty",
        title: "Empty",
        timestamp: "2026-07-20",
        columns: [],
        data: [],
      }),
    /at least one column/,
  );
});
