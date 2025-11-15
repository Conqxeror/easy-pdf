import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, "..", "public", "og-static");
const toolsDir = path.join(__dirname, "..", "public", "images", "tools");
const toolsDataPath = path.join(__dirname, "..", "src", "lib", "toolData.json");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(toolsDir)) fs.mkdirSync(toolsDir, { recursive: true });

const tools = JSON.parse(fs.readFileSync(toolsDataPath, "utf-8"));

function sanitizeText(text) {
	if (!text) return "";
	return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSVG({ title, subtitle, iconDataUrl, width = 1200, height = 630 }) {
	const escapedTitle = sanitizeText(title);
	const escapedSubtitle = sanitizeText(subtitle || "");

	return `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>\n  <defs>\n    <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>\n      <stop offset='0%' stop-color='#7c3aed'/>\n      <stop offset='100%' stop-color='#06b6d4'/>\n    </linearGradient>\n    <style>\n      .title { font-family: Inter, Arial, sans-serif; font-size: 56px; font-weight:700; fill: #fff; }\n      .subtitle { font-family: Inter, Arial, sans-serif; font-size: 32px; fill: rgba(255,255,255,0.95); }\n    </style>\n  </defs>\n  <rect width='100%' height='100%' fill='url(#g)'/>\n  <g transform='translate(80,80)'>\n    <rect x='0' y='0' width='1040' height='470' rx='24' fill='rgba(255,255,255,0.06)'/>\n    ${iconDataUrl ? `<image href='${iconDataUrl}' x='36' y='36' width='128' height='128'/>` : ''}\n    <text x='180' y='120' class='title'>${escapedTitle}</text>\n    <text x='180' y='180' class='subtitle'>${escapedSubtitle}</text>\n  </g>\n</svg>`;
}

async function generate() {
	console.log("Generating OG static images (SVG -> PNG) ...");

	// Homepage
	const homepageSVG = buildSVG({ title: "Easy PDF — Tools to manage PDFs", subtitle: "Merge, compress, convert and more", iconDataUrl: null });
	await sharp(Buffer.from(homepageSVG)).png().toFile(path.join(outDir, "homepage.png"));

	for (const t of tools) {
		const slug = t.slug || t.id || (t.name || "tool").toLowerCase().replace(/[^a-z0-9]+/g, "-");
		const title = t.ogTitle || t.title || t.name || "Easy PDF Tool";
		const subtitle = t.ogSubtitle || t.description || "";

		// Icon handling: if there is an existing PNG icon, use it; otherwise synthesize
		let iconDataUrl = null;
		const iconPath = path.join(__dirname, "..", "public", "images", "tools", `${slug}.png`);
		if (fs.existsSync(iconPath)) {
			const buf = fs.readFileSync(iconPath);
			iconDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
		} else {
			// create a simple SVG favicon-like icon and write it to disk for future runs
			const initial = (title && title[0]) ? title[0].toUpperCase() : "?";
			const iconSvg = `<?xml version="1.0" encoding="utf-8"?><svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'><rect width='100%' height='100%' rx='20' fill='#ffffff'/><text x='64' y='82' font-size='64' font-family='Arial' text-anchor='middle' fill='#111'>${initial}</text></svg>`;
			const buf = Buffer.from(iconSvg);
			const pngBuf = await sharp(buf).png().toBuffer();
			fs.writeFileSync(iconPath, pngBuf);
			iconDataUrl = `data:image/png;base64,${pngBuf.toString("base64")}`;
		}

		const svg = buildSVG({ title, subtitle, iconDataUrl });
		await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `${slug}.png`));
		console.log(`Generated ${slug}.png`);
	}

	console.log("Done generating OG static images.");
}

generate().catch((e) => {
	console.error(e);
	process.exit(1);
});
