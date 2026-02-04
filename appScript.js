function doGet(e) {
  const tenDuong = (e.parameter.ten_duong || "").toLowerCase().trim();
  const sheet = SpreadsheetApp.getActive().getSheetByName("data");

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // Get headers from first two rows to handle categories
  const headerRows = sheet.getRange(1, 1, 2, lastCol).getValues();
  const validHeaders = [];
  
  for (let c = 0; c < lastCol; c++) {
    let prefix = headerRows[0][c].toString().trim();
    let suffix = headerRows[1][c].toString().trim();
    // Combine prefix and suffix if prefix exists, otherwise just suffix
    let headerName = prefix ? `${prefix} - ${suffix}` : suffix;
    validHeaders.push(headerName);
  }

  // Data starts from row 3
  const data = sheet.getRange(3, 1, lastRow - 2, lastCol).getValues();

  const result = data
    .filter(r => r[1].toString().toLowerCase().includes(tenDuong))
    .map(row => {
      const obj = {};
      validHeaders.forEach((h, i) => {
        // Skip empty headers if any
        if (h) {
          obj[h] = row[i];
        }
      });
      return obj;
    });

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
