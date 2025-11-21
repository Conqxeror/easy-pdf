import { ImageResponse } from 'next/og';
import { toolsData } from '@/lib/toolData';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    
    // Validate slug exists and is a string
    if (!slug || typeof slug !== 'string') {
      return new Response('Invalid slug', { status: 400 });
    }

    const toolHref = `/${slug}`;
    const tool = toolsData.find((t) => t.href === toolHref);
    
    // If tool not found, try static image first, then fallback
    if (!tool) {
      try {
        const url = new URL(req.url);
        const origin = `${url.protocol}//${url.host}`;
        const staticOg = await fetch(`${origin}/og-static/${slug}.png`);
        if (staticOg.ok) {
          const buffer = await staticOg.arrayBuffer();
          return new Response(buffer, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, s-maxage=86400' } });
        }
      } catch {}
      return new Response('Tool not found', { status: 404 });
    }

    const title = tool?.ogTitle || tool?.seoTitle || tool?.title || 'easy-pdf';
    const description = tool?.seoDescription || 'Privacy-first PDF tools — no uploads.';

    const url = new URL(req.url);
    const origin = `${url.protocol}//${url.host}`;


    // Try dynamic OG generation with ImageResponse
    try {
      return new ImageResponse(
        (
          <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>
            {/* Background Grid Pattern */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1 }} />
            
            {/* Header with Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '40px 60px', zIndex: 1 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: 48 }}>
                <g transform="translate(12 12) scale(0.91) translate(-12 -12) translate(1 1)" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                  <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                  <path d="m2.3 2.3 7.286 7.286" />
                  <circle cx="11" cy="11" r="2" />
                </g>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>easy-pdf</div>
                <div style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>Privacy-First Tools</div>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', flex: 1, padding: '0 60px', gap: 32, zIndex: 1 }}>
              {/* Tool Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: '800px' }}>{title}</div>
                <div style={{ fontSize: 28, color: '#aaa', fontWeight: 400, maxWidth: '800px', lineHeight: 1.4 }}>{description.length > 100 ? description.substring(0, 100) + '...' : description}</div>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontSize: 16, color: '#ddd' }}>Client-side Only</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontSize: 16, color: '#ddd' }}>No Uploads</span>
                </div>
                {tool?.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
                    <span style={{ fontSize: 16, color: '#ddd' }}>{tool.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '40px 60px', borderTop: '1px solid #333', zIndex: 1 }}>
              <div style={{ fontSize: 16, color: '#666', fontWeight: 500 }}>easypdf.app</div>
              <div style={{ fontSize: 14, color: '#666' }}>Privacy-first PDF Tools</div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    } catch (err) {
      // ImageResponse generation failed - try fallbacks
      console.warn('OG route ImageResponse generation failed', err);
      
      // Try static OG image
      try {
        const staticOg = await fetch(`${origin}/og-static/${slug}.png`);
        if (staticOg.ok) {
          const buffer = await staticOg.arrayBuffer();
          return new Response(buffer, { 
            status: 200, 
            headers: { 
              'Content-Type': 'image/png', 
              'Cache-Control': 'public, s-maxage=86400' 
            } 
          });
        }
      } catch {
        // Static also failed
      }

      // Final fallback: generic tool icon
      try {
        const fallback = await fetch(`${origin}/images/tools/tool.png`);
        if (fallback.ok) {
          const buffer = await fallback.arrayBuffer();
          return new Response(buffer, { 
            status: 200, 
            headers: { 
              'Content-Type': 'image/png', 
              'Cache-Control': 'public, s-maxage=86400' 
            } 
          });
        }
      } catch {
        // Everything failed
      }

      // Return error placeholder
      return new Response('Failed to generate image', { status: 500 });
    }
  } catch (err) {
    console.error('OG route error', err);
    return new Response('Internal server error', { status: 500 });
  }
}
