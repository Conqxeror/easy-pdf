const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../src/app');
let errors = [];
let passed = 0;
let total = 0;

function walkDir(dir, callback) {
	fs.readdirSync(dir).forEach(f => {
		let dirPath = path.join(dir, f);
		let isDirectory = fs.statSync(dirPath).isDirectory();
		if (isDirectory) {
			walkDir(dirPath, callback);
		} else {
			callback(path.join(dir, f));
		}
	});
}

console.log("Starting strict SEO verification...");

walkDir(rootDir, (filePath) => {
	if (path.basename(filePath) !== 'page.js') return;

	const content = fs.readFileSync(filePath, 'utf8');
	const relativePath = path.relative(rootDir, filePath);

	// Skip route groups folders for counting if they don't have page.js (handled by filename check)
	// Skip specific unrelated pages if necessary, but we want 100% coverage.

	total++;
	const issues = [];

	// Check 1: "use client" check
	// If it has "use client", it cannot export metadata in the same file for Next.js 13+ App Router (usually).
	const hasUseClient = content.includes('"use client"') || content.includes("'use client'");
	const exportsMetadata = content.includes('export const metadata') || content.includes('export async function generateMetadata');

	if (hasUseClient && exportsMetadata) {
		issues.push('CRITICAL: File has "use client" but attempts to export metadata (this will fail in Next.js).');
	}

	// Check 2: Content
	if (!exportsMetadata) {
		issues.push('MISSING: No metadata export (checklist: title, description, canonical).');
	}

	// Check 3: JSON-LD
	// We look for the specific implementation we added: <script ... application/ld+json ...>
	// and ensure it references structuredData.
	const hasJsonLd = content.includes('application/ld+json');
	const hasStructuredDataRef = content.includes('structuredData');

	if (!hasJsonLd) {
		issues.push('MISSING: No <script type="application/ld+json"> tag found.');
	} else if (!hasStructuredDataRef) {
		issues.push('WARNING: JSON-LD tag exists but "structuredData" keyword missing (verify content).');
	}

	if (issues.length > 0) {
		errors.push({ file: relativePath, issues });
	} else {
		passed++;
	}
});

console.log(`\nVerification Complete.`);
console.log(`Total Pages Scanned: ${total}`);
console.log(`Successfully Optimized: ${passed}`);
console.log(`Pages with Issues: ${errors.length}`);

if (errors.length > 0) {
	console.log('\n--- ISSUES FOUND ---');
	errors.forEach(e => {
		console.log(`\n[ ] ${e.file}`);
		e.issues.forEach(i => console.log(`    - ${i}`));
	});
} else {
	console.log('\nAll pages passed strict SEO checks. ✅');
}
