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

    // NOTE: We intentionally do NOT prefer static OG images here anymore, 
    // because we want the new dynamic design to be the primary source.
    // The static images in public/og-static are likely outdated or basic.


    let image;
    try {
      // If font loading failed above, ImageResponse will still render using system fonts.
      image = new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            color: 'white',
            fontFamily: 'Inter',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 2px 2px, #222 1px, transparent 0)',
              backgroundSize: '48px 48px',
              opacity: 0.5,
              zIndex: 0,
            }}
          />

          {/* Brand Header (Top Left) */}
          <div style={{ position: 'absolute', top: 60, left: 60, display: 'flex', alignItems: 'center', gap: 16, zIndex: 10 }}>
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={`${origin}/icon-192.png`} width="48" height="48" alt="Easy PDF Logo" style={{ borderRadius: 12 }} />
             <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Easy PDF</span>
          </div>

          {/* Main Content (Centered) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, maxWidth: '900px', textAlign: 'center' }}>
            
            {/* Tool Icon */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 120, 
              height: 120, 
              background: '#111', 
              border: '1px solid #333',
              borderRadius: 24,
              marginBottom: 40,
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}>
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={tool?.ogIcon || `${origin}/images/tools/tool.png`} width="72" height="72" alt={`${tool?.title || 'Tool'} icon`} />
            </div>

            {/* Title */}
            <span style={{ 
              fontSize: 80, 
              fontWeight: 800, 
              letterSpacing: '-0.04em', 
              lineHeight: 1.1,
              marginBottom: 24,
              backgroundImage: 'linear-gradient(to bottom right, #fff, #ccc)',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              {title}
            </span>

            {/* Subtitle / Description */}
            <span style={{ 
              fontSize: 32, 
              color: '#A1A1AA', 
              lineHeight: 1.5,
              fontWeight: 400,
              maxWidth: '800px',
              textWrap: 'balance'
            }}>
              {subtitle.length > 120 ? subtitle.substring(0, 120) + '...' : subtitle}
            </span>
          </div>

          {/* Footer (Bottom) */}
          <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
             <div style={{ display: 'flex', gap: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontSize: 20, fontWeight: 500, color: '#e5e7eb' }}>Client-side Only</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontSize: 20, fontWeight: 500, color: '#e5e7eb' }}>No Uploads</span>
                </div>
             </div>

             {tool?.category && (
              <div style={{ 
                padding: '10px 20px', 
                background: '#fff', 
                color: '#000', 
                fontSize: 18, 
                fontWeight: 600,
                borderRadius: 999,
              }}>
                {tool.category}
              </div>
            )}
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
    } catch (err) {
      // ImageResponse failed for some reason (fonts or Edge runtime issue). Try sensible fallbacks:
      console.warn('ImageResponse failed, attempting fallbacks', err);
      try {
        const staticOg = await fetch(`${origin}/og-static/${slug}.png`);
        if (staticOg.ok) {
          const buffer = await staticOg.arrayBuffer();
          return new Response(buffer, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, s-maxage=86400' } });
        }
      } catch {
        // swallow
      }

      // Final fallback: return the small tool icon (best-effort) so the request doesn't 500.
      try {
        const fallback = await fetch(`${origin}/images/tools/tool.png`);
        if (fallback.ok) {
          const buffer = await fallback.arrayBuffer();
          return new Response(buffer, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, s-maxage=86400' } });
        }
      } catch {
        // If everything failed, let the outer catch handle the error and return 500.
      }
    }

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
