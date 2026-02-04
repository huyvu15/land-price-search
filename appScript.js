function doGet(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.getActive().getSheetByName("data");
  const lastRow = sheet.getLastRow();

  // CASE 1: Get List of Street Names (for Autocomplete)
  if (action === "list_names") {
    if (lastRow < 3) return createJSON([]);
    // Column B is index 2, data starts at row 3
    const range = sheet.getRange(3, 2, lastRow - 2, 1).getValues();
    
    const uniqueNames = [...new Set(
      range.flat()
           .map(n => n.toString().trim())
           .filter(n => n)
    )].sort();
    
    return createJSON(uniqueNames);
  }

  // CASE 2: Search/Filter Data (Default)
  const tenDuong = (e.parameter.ten_duong || "").toLowerCase().trim();
  const lastCol = sheet.getLastColumn();

  // Get headers from first two rows
  const headerRows = sheet.getRange(1, 1, 2, lastCol).getValues();
  const validHeaders = [];
  
  for (let c = 0; c < lastCol; c++) {
    let prefix = headerRows[0][c].toString().trim();
    let suffix = headerRows[1][c].toString().trim();
    let headerName = prefix ? `${prefix} - ${suffix}` : suffix;
    validHeaders.push(headerName);
  }

  // Get Data
  const data = sheet.getRange(3, 1, lastRow - 2, lastCol).getValues();

  const result = data
    .filter(r => {
      // Index 1 (Column B) is Street Name
      if (!tenDuong) return true; // Return all if no query
      return r[1].toString().toLowerCase().includes(tenDuong);
    })
    .map(row => {
      const obj = {};
      validHeaders.forEach((h, i) => {
        if (h) obj[h] = row[i];
      });
      return obj;
    });

  return createJSON(result);
}

function createJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
