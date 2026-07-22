import test from "node:test";
import assert from "node:assert/strict";
import { buildPdfDocumentBlob } from "./pdfExport.js";

test("buildPdfDocumentBlob creates a PDF with title and table values", async () => {
  const pdf = buildPdfDocumentBlob({
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

  const bytes = new Uint8Array(await pdf.arrayBuffer());
  const text = new TextDecoder("latin1").decode(bytes);

  assert.equal(bytes[0], 0x25); // %
  assert.match(text, /^%PDF-1\.4/);
  assert.match(text, /Campaigns/);
  assert.match(text, /VIP Renewal/);
  assert.match(text, /Summer Push/);
  assert.match(text, /R 11200/);
  assert.match(text, /%%EOF/);
});

test("buildPdfDocumentBlob rejects empty columns", () => {
  assert.throws(
    () =>
      buildPdfDocumentBlob({
        filename: "empty",
        title: "Empty",
        timestamp: "2026-07-20",
        columns: [],
        data: [],
      }),
    /at least one column/,
  );
});
