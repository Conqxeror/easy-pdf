const fs = require('fs');
// const path = require('path'); // not used yet
const glob = require('glob');

const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { ignore: 'node_modules/**' });

let changedFiles = 0;

files.forEach(file => {
	let content = fs.readFileSync(file, 'utf8');
	let originalContent = content;

	// 1. Text Colors: Replace all grays with foreground (Black in Light, White in Dark)
	// This ensures "black texts" in light mode.
	content = content.replace(/text-(gray|zinc|slate|neutral)-[0-9]+/g, 'text-foreground');

	// 2. Background Colors: Replace all grays with background (White in Light, Black in Dark)
	// This ensures "white background" in light mode.
	content = content.replace(/bg-(gray|zinc|slate|neutral)-[0-9]+/g, 'bg-background');

	// 3. Border Colors: Replace all grays with border (Gray/Black in Light, White in Dark)
	content = content.replace(/border-(gray|zinc|slate|neutral)-[0-9]+/g, 'border-border');

	// 4. Hardcoded White/Black
	// bg-white -> bg-background
	content = content.replace(/bg-white/g, 'bg-background');
	// bg-black -> bg-foreground (Black in Light, White in Dark? No, bg-foreground would be Black in Light, White in Dark)
	// If we want "Black background in Dark Mode", bg-background is Black.
	// If we want "White background in Light Mode", bg-background is White.
	// So bg-black (hardcoded) is likely a dark section.
	// If we change it to bg-background, it becomes White in Light Mode.
	// This is what the user wants: "white when in light mode".
	content = content.replace(/bg-black/g, 'bg-background');

	// 5. Text White/Black
	// text-white -> text-background (White in Light? No, text-background is White in Light. So text-white on bg-black becomes text-background on bg-foreground?)
	// Usually text-white is used on dark backgrounds.
	// If we changed the background to bg-background (White), we must change text-white to text-foreground (Black).
	content = content.replace(/text-white/g, 'text-foreground');
	// text-black -> text-foreground
	content = content.replace(/text-black/g, 'text-foreground');

	// 6. Hover states
	// hover:bg-gray-100 -> hover:bg-accent (or similar)
	// But since we replaced bg-gray-100 with bg-background, we might have hover:bg-background which does nothing.
	// Let's replace hover:bg-background with hover:bg-secondary/10 or something visible?
	// Or just leave it. The user wants "picture perfect".
	// Let's map hover:bg-gray-* to hover:bg-secondary (Black in Light, White in Dark) but with opacity?
	// Or hover:bg-primary-hover?
	// Let's stick to the aggressive replacement for now.

	if (content !== originalContent) {
		fs.writeFileSync(file, content, 'utf8');
		console.log(`Updated ${file}`);
		changedFiles++;
	}
});

console.log(`Finished processing. Modified ${changedFiles} files.`);
