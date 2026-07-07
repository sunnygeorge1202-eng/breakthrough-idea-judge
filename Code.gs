/**
 * Breakthrough Idea Contest — scoring backend.
 * Deploy as Web App (Execute as: Me, Access: Anyone) and paste the
 * resulting URL into SCRIPT_URL in index.html.
 *
 * Each judge's submissions are written to a sheet named after that judge,
 * inside the "Breakthrough Idea Scores" Spreadsheet in this script's Drive.
 * A "Consolidated" sheet is kept in sync with every row from every judge.
 */

const SPREADSHEET_NAME = "Breakthrough Idea Contest — Scores";
const HEADERS = [
  "Timestamp", "Judge", "Idea / Presenter",
  "Creativity & Originality (20%)", "Innovation (25%)",
  "Replicability & Scalability (10%)", "Impact to Business & Client (30%)",
  "Execution & Implementation (15%)", "Weighted Total (/5)"
];

function getSpreadsheet_() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  // remove default empty sheet later once real sheets exist
  return ss;
}

function ensureSheet_(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const row = [
      data.timestamp || new Date().toISOString(),
      data.judge || "",
      data.idea || "",
      data.creativity || "",
      data.innovation || "",
      data.replicability || "",
      data.impact || "",
      data.execution || "",
      data.weightedTotal || ""
    ];

    const ss = getSpreadsheet_();

    // Remove the default blank "Sheet1" if it's still empty and unused
    const defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet);
    }

    // Per-judge sheet
    const judgeSheetName = (data.judge || "Unknown Judge").substring(0, 90);
    const judgeSheet = ensureSheet_(ss, judgeSheetName);
    judgeSheet.appendRow(row);

    // Consolidated sheet across all judges
    const consolidated = ensureSheet_(ss, "Consolidated");
    consolidated.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Breakthrough Idea Contest scoring endpoint is live.");
}
