const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const out = path.join(process.cwd(), 'tests', 'fixtures', 'tiny.webm');

  console.log('Generating tiny webm fixture using Playwright (chromium)...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Make a short page that records a tiny canvas animation and returns a data URL
  const dataUrl = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 20, 120, 50);

    document.body.appendChild(canvas);

    // Capture a stream and record it
    const stream = canvas.captureStream(30);
    // Use a codec that Chromium supports
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
    recorder.start();
    await new Promise((r) => setTimeout(r, 600));
    recorder.stop();

    await new Promise((resolve) => {
      recorder.onstop = () => resolve();
    });

    const blob = new Blob(chunks, { type: 'video/webm' });
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsDataURL(blob);
    });
  });

  await browser.close();

  const b64 = dataUrl.split(',')[1];
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(out, buf);
  console.log('Wrote', out);
})();
