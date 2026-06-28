import fs from "node:fs";
import path from "node:path";

const INPUT_FILE = path.resolve("scripts/whatsapp-clean.txt");
const OUTPUT_FILE = path.resolve("public/data/messages.json");

const REQUIRED_SENDER = "Samarpan";

const VALID_ENDINGS = [
  "Hari om.",
  "Satya sharnam.",
  "Guru sharnam.",
  "Hari sharnam."
];

if (!fs.existsSync(INPUT_FILE)) {
  console.error("Missing input file: scripts/whatsapp.txt");
  console.error("Export WhatsApp chat as .txt and place it at scripts/whatsapp.txt");
  process.exit(1);
}

const rawText = fs.readFileSync(INPUT_FILE, "utf8");
const messages = parseWhatsAppExport(rawText);

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(messages, null, 2), "utf8");

console.log(`Created ${OUTPUT_FILE}`);
console.log(`Total Samarpan wisdom messages parsed: ${messages.length}`);

function parseWhatsAppExport(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let current = null;

  for (const line of lines) {
    const parsed = parseWhatsAppLine(line);

    if (parsed) {
      if (current) entries.push(current);
      current = parsed;
    } else if (current && line.trim()) {
      // Handle multi-line WhatsApp messages.
      current.message += `\n${line.trim()}`;
    }
  }

  if (current) entries.push(current);

  const dailyMap = new Map();

  for (const entry of entries) {
    const cleaned = cleanMessage(entry.message);

    if (!isRequiredSender(entry.sender)) continue;
    if (!hasValidEnding(cleaned)) continue;

    // One wisdom message per date.
    // If Samarpan has multiple valid messages on same date, append them.
    if (dailyMap.has(entry.date)) {
      dailyMap.set(entry.date, `${dailyMap.get(entry.date)}\n\n${cleaned}`);
    } else {
      dailyMap.set(entry.date, cleaned);
    }
  }

  return [...dailyMap.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, message]) => ({ date, message }));
}

function parseWhatsAppLine(line) {
  const trimmed = line.trim();

  // Supported formats:
  // 23/10/2018, 07:03 - Samarpan: Guru Gyan...
  // 23/10/18, 7:03 AM - Samarpan: Guru Gyan...
  // [23/10/2018, 07:03:10] Samarpan: Guru Gyan...
  const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm|AM|PM)?\s+-\s+([^:]+):\s*(.*)$/,
    /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm|AM|PM)?\]\s+([^:]+):\s*(.*)$/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;

    const [, day, month, yearValue, sender, message] = match;
    const year = yearValue.length === 2 ? `20${yearValue}` : yearValue;

    return {
      date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      sender: sender.trim(),
      message: message.trim()
    };
  }

  return null;
}

function isRequiredSender(sender) {
  return sender.trim().toLowerCase() === REQUIRED_SENDER.toLowerCase();
}

function hasValidEnding(message) {
  const normalized = message.trim();

  return VALID_ENDINGS.some((ending) => normalized.endsWith(ending));
}

function cleanMessage(message) {
  return message
    .replace(/\u200e/g, "")
    .replace(/<Media omitted>/gi, "")
    .replace(/This message was deleted/gi, "")
    .replace(/Messages and calls are end-to-end encrypted\..*/gi, "")
    .replace(/\s+$/g, "")
    .trim();
}