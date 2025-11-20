import { ImageResponse } from 'next/og';
import { toolsData } from '@/lib/toolData';

export const runtime = 'edge';

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const toolHref = `/${slug}`;
    const tool = toolsData.find((t) => t.href === toolHref);

    const title = tool?.ogTitle || tool?.seoTitle || tool?.title || 'easy-pdf';
    const subtitle = tool?.ogSubtitle || tool?.seoDescription || 'Privacy-first PDF tools — no uploads.';

    const url = new URL(req.url);
    const origin = `${url.protocol}//${url.host}`;

    // Try CDN fonts first (more reliable in CI), then local fonts. If both fail, warn.
    let interBold, interReg;
    try {
      const interBoldReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Bold.woff2');
      const interRegReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Regular.woff2');
      if (interBoldReq.ok && interRegReq.ok) {
        interBold = await interBoldReq.arrayBuffer();
        interReg = await interRegReq.arrayBuffer();
      }
    } catch {
      // try local fonts next in case CDN is blocked or unavailable
    }

    if (!interBold || !interReg) {
      try {
        const localBold = await fetch(`${origin}/fonts/Inter-Bold.woff2`);
        const localReg = await fetch(`${origin}/fonts/Inter-Regular.woff2`);
        if (localBold.ok && localReg.ok) {
          interBold = await localBold.arrayBuffer();
          interReg = await localReg.arrayBuffer();
        }
      } catch {
        // final fallback: leave fonts undefined and continue without custom fonts
        console.warn('OG fonts unavailable; falling back to system fonts.');
      }
    }

    // If fonts couldn't be loaded, return a static fallback image rather than using ImageResponse.
    if (!interBold || !interReg) {
      try {
        const fallback = await fetch(`${origin}/images/tools/tool.png`);
        if (fallback.ok) {
          const buffer = await fallback.arrayBuffer();
          return new Response(buffer, {
            status: 200,
            headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, s-maxage=86400' }
          });
        }
      } catch (err) {
        console.warn('OG font and fallback image fetch both failed', err);
      }
    }

    const image = new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '60px',
            background: 'linear-gradient(135deg,#111827 0%, #0f172a 100%)',
            color: 'white',
            boxSizing: 'border-box',
            fontFamily: 'Inter'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tool?.ogIcon || `${origin}/images/tools/tool.png`} width="64" height="64" style={{ borderRadius: 8 }} alt={`${tool?.title || 'easy-pdf'} icon`} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.05 }}>{title}</span>
              <span style={{ marginTop: 10, fontSize: 20, opacity: 0.85, maxWidth: 740 }}>{subtitle}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 18, opacity: 0.95, fontWeight: 600 }}>easy-pdf</span>
              <span style={{ fontSize: 14, opacity: 0.75 }}>Privacy-first • Client-side • No uploads</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '8px 14px', background: '#111827', borderRadius: 8, fontSize: 14, opacity: 0.95 }}>Try now</span>
              <span style={{ padding: '8px 14px', background: '#1f2937', borderRadius: 8, fontSize: 14, opacity: 0.85 }}>{tool?.category || ''}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: interBold && interReg ? [
          { name: 'Inter', data: interReg, weight: 400, style: 'normal' },
          { name: 'Inter', data: interBold, weight: 700, style: 'normal' }
        ] : []
      }
    );

    try {
      image.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    } catch {
      console.warn('Unable to set cache header on ImageResponse');
    }

    try {
      void fetch(`${origin}/api/og/log`, {
        method: 'POST',
        body: JSON.stringify({ slug, tool: tool?.title || null, path: req.url }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // no-op
    }

    return image;
  } catch (err) {
    console.error('OG generation failed', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
