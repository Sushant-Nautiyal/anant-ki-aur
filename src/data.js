const LOCAL_JSON_URL = "./data/messages.json";

// Future Google Sheet support:
// 1. Publish the sheet to web as CSV.
// 2. Paste the published CSV URL below.
// 3. Expected columns: date,message
// 4. Keep it empty to use only local JSON.
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS11BNTNc_RzdXUDLU_PZlSO5vf-2Acgct3N8bUVZJIsr08acmAldID_JgrR8x8nSlroFwwLJ6WQJo7/pub?output=csv";

export async function loadDailyMessages() {
  const localMessages = await loadLocalJsonMessages();

  if (!GOOGLE_SHEET_CSV_URL) {
    return normalizeMessages(localMessages);
  }

  try {
    const sheetMessages = await loadGoogleSheetMessages(GOOGLE_SHEET_CSV_URL);

    // Sheet messages override local messages for matching dates.
    return normalizeMessages([...localMessages, ...sheetMessages]);
  } catch (error) {
    console.warn("Google Sheet data unavailable. Falling back to local JSON.", error);
    return normalizeMessages(localMessages);
  }
}

async function loadLocalJsonMessages() {
 const response = await fetch(addCacheBuster(LOCAL_JSON_URL), {
 cache: "no-store",
 headers: {
 "Cache-Control": "no-cache"
 }
 });

 if (!response.ok) throw new Error("Unable to load local messages.json");

 const data = await response.json();
 return Array.isArray(data) ? data : [];
}

async function loadGoogleSheetMessages(csvUrl) {
 const freshUrl = addCacheBuster(csvUrl);

 const response = await fetch(freshUrl, {
 cache: "no-store",
 headers: {
 "Cache-Control": "no-cache"
 }
 });

 if (!response.ok) throw new Error("Unable to load Google Sheet CSV");

 const csv = await response.text();
 return parseCsvMessages(csv);
}

function addCacheBuster(url) {
 const separator = url.includes("?") ? "&" : "?";
 return `${url}${separator}v=${Date.now()}`;
}

function parseCsvMessages(csv) {
  const rows = parseCsv(csv.trim());
  if (!rows.length) return [];

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const dateIndex = headers.indexOf("date");
  const messageIndex = headers.indexOf("message");

  if (dateIndex === -1 || messageIndex === -1) {
    throw new Error("Google Sheet CSV must contain date and message columns");
  }

  return rows.slice(1).map((row) => ({
    date: row[dateIndex],
    message: row[messageIndex]
  }));
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  rows.push(row);
  return rows.filter((items) => items.some((item) => item.trim()));
}

function normalizeMessages(messages) {
  const map = new Map();

  for (const item of messages) {
    if (!item || typeof item.message !== "string") continue;

    const date = normalizeDate(item.date);
    const message = item.message.trim();

    if (!date || !message) continue;
    map.set(date, message);
  }

  return map;
}

function normalizeDate(value) {
  if (!value) return null;

  const text = String(value).trim();

  // Already correct: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  // Common Indian formats from manual sheets or exports: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const match = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!match) return null;

  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];

  return `${year}-${month}-${day}`;
}
