const fs = require("fs");
const path = require("path");

const GUESTHOUSES_PATH = path.resolve(__dirname, "../../data/guesthouses.json");

const readList = () => {
  try {
    const data = fs.readFileSync(GUESTHOUSES_PATH, "utf8");
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

const writeList = (list) => {
  const dir = path.dirname(GUESTHOUSES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(GUESTHOUSES_PATH, JSON.stringify(list, null, 2), "utf8");
};

const getListHandler = (req, res) => {
  const list = readList();
  return res.status(200).json({ success: true, list });
};

const sortList = (list) => list.slice().sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

const patchListHandler = (req, res) => {
  const body = req.body || {};
  let list = body.list;
  if (!Array.isArray(list)) {
    return res.status(400).json({ success: false, message: "list must be an array of strings" });
  }
  list = list.map((item) => String(item).trim()).filter(Boolean);
  list = [...new Set(list)];
  list = sortList(list);
  writeList(list);
  return res.status(200).json({ success: true, list });
};

const refreshFromGoogleHandler = async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return res.status(503).json({
      success: false,
      message: "Google Places API key not configured. Set GOOGLE_PLACES_API_KEY in the environment to refresh from Google Maps.",
    });
  }

  const DON_DET_LAT = 14.0167;
  const DON_DET_LNG = 105.9167;
  const RADIUS_M = 3000;
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", "guesthouse Don Det Laos");
  url.searchParams.set("location", `${DON_DET_LAT},${DON_DET_LNG}`);
  url.searchParams.set("radius", String(RADIUS_M));
  url.searchParams.set("key", apiKey.trim());

  let response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: "Failed to reach Google Places API: " + (err.message || "network error"),
    });
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return res.status(502).json({
      success: false,
      message: "Google Places API error: " + (data.status || "unknown") + (data.error_message ? " – " + data.error_message : ""),
    });
  }

  const existing = readList();
  const existingSet = new Set(existing.map((n) => normalizeName(n)));
  const newNames = [];
  const results = data.results || [];
  for (const place of results) {
    const name = (place.name || "").trim();
    if (!name) continue;
    const norm = normalizeName(name);
    if (existingSet.has(norm)) continue;
    existingSet.add(norm);
    newNames.push(name);
  }

  const merged = sortList([...existing, ...newNames]);
  writeList(merged);

  return res.status(200).json({
    success: true,
    message: `List updated. ${newNames.length} new place(s) added from Google Maps.`,
    list: merged,
    addedCount: newNames.length,
  });
};

function normalizeName(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  getListHandler,
  patchListHandler,
  refreshFromGoogleHandler,
};
