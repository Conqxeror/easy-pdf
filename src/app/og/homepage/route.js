import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 0; // No caching - always generate fresh

export async function GET(req) {
	try {
		const url = new URL(req.url);
		const origin = `${url.protocol}//${url.host}`;

		let image;
		try {
			image = new ImageResponse(
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
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '0 60px', gap: 32, zIndex: 1, textAlign: 'center' }}>
						{/* Hero Title */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
							<div style={{ fontSize: 96, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Easy PDF</div>
							<div style={{ fontSize: 32, color: '#aaa', fontWeight: 400, lineHeight: 1.4 }}>Privacy-first PDF tools that run entirely in your browser.</div>
						</div>

						{/* Features */}
						<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
							{['Merge', 'Split', 'Compress', 'Convert', 'OCR'].map((feature) => (
								<div key={feature} style={{ padding: '8px 16px', background: '#222', border: '1px solid #444', borderRadius: 6, fontSize: 14, color: '#ddd', fontWeight: 500 }}>
									{feature}
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 60px', borderTop: '1px solid #333', zIndex: 1 }}>
						<div style={{ fontSize: 16, color: '#666', fontWeight: 500 }}>easypdf.app</div>
						<div style={{ width: 4, height: 4, background: '#666', borderRadius: '50%' }} />
						<div style={{ fontSize: 14, color: '#666' }}>Privacy-first PDF Tools</div>
					</div>
				</div>,
				{
					width: 1200,
					height: 630,
					headers: {
						'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
					},
				}
			);
			return image;
		} catch (err) {
			console.warn('Homepage ImageResponse failed, attempting static fallback', err);
			try {
				const staticOg = await fetch(`${origin}/og-static/homepage.png`);
				if (staticOg.ok) {
					const buffer = await staticOg.arrayBuffer();
					return new Response(buffer, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, s-maxage=86400' } });
				}
			} catch {
				// swallow
			}
			// last-resort: return a minimal error message
			return new Response('Failed to generate image', { status: 500 });
		}
	} catch (err) {
		console.error('Homepage OG generation failed', err);
		return new Response('Failed to generate image', { status: 500 });
	}
}
