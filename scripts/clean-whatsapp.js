import fs from "node:fs";
import path from "node:path";

const INPUT_FILE = path.resolve("scripts/whatsapp.txt");
const OUTPUT_FILE = path.resolve("scripts/whatsapp-clean.txt");

const REMOVE_SENDER = "Sushant Nautiyal";

if (!fs.existsSync(INPUT_FILE)) {
  console.error("Missing scripts/whatsapp.txt");
  process.exit(1);
}

const raw = fs.readFileSync(INPUT_FILE, "utf8");
const cleaned = cleanWhatsAppText(raw);

fs.writeFileSync(OUTPUT_FILE, cleaned, "utf8");

console.log("✅ Cleaned file created at scripts/whatsapp-clean.txt");


// ------------------------

function cleanWhatsAppText(text) {
  const lines = text.split(/\r?\n/);

  let result = [];
  let skipBlock = false;

  for (const line of lines) {
    const parsed = parseLine(line);

    if (parsed) {
      // New message line

      const sender = parsed.sender;

      if (
        sender.toLowerCase().includes("sushant") ||
        line.includes("end-to-end encrypted")
      ) {
        skipBlock = true;
        continue;
      }

      skipBlock = false;
      result.push(line);

    } else {
      // Continuation line

      if (!skipBlock && line.trim()) {
        result.push(line);
      }
    }
  }

  return result.join("\n");
}


// ------------------------

function parseLine(line) {
  const trimmed = line.trim();

  const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+.*-\s+([^:]+):/,
    /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),.*\]\s+([^:]+):/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;

    const sender = match[4] || match[3];

    return {
      sender: sender.trim()
    };
  }

  return null;
}