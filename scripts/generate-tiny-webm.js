const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
const outputPath = path.join(fixturesDir, 'tiny.webm');

fs.mkdirSync(fixturesDir, { recursive: true });

if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
  console.log(`tiny.webm already exists at ${outputPath}`);
  process.exit(0);
}

const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
if (ffmpegCheck.status !== 0) {
  console.warn('ffmpeg is not available; skipping tiny.webm generation.');
  process.exit(0);
}

const generate = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-f', 'lavfi',
    '-i', 'color=c=black:s=160x90:d=1',
    '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=mono',
    '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'libopus',
    '-shortest',
    outputPath,
  ],
  { stdio: 'inherit' }
);

if (generate.status !== 0) {
  console.warn('Failed to generate tiny.webm with ffmpeg; continuing without it.');
  process.exit(0);
}

console.log(`Generated tiny.webm at ${outputPath}`);