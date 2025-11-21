import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req) {
	try {
		// Use Google Fonts for consistent typography
		const url = new URL(req.url);
		const origin = `${url.protocol}//${url.host}`;
		let interBold, interReg;

		// Try CDN fonts first (more reliable in CI/dev without local font files),
		// then fall back to local fonts if needed.
		try {
			const interBoldReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Bold.woff2');
			const interRegReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Regular.woff2');
			if (interBoldReq.ok && interRegReq.ok) {
				interBold = await interBoldReq.arrayBuffer();
				interReg = await interRegReq.arrayBuffer();
			}
		} catch {
			// fall through to local font attempt
		}

		// If the CDN didn't provide fonts, attempt to load local fonts as a fallback
		if (!interBold || !interReg) {
			try {
				const localBold = await fetch(`${origin}/fonts/Inter-Bold.woff2`);
				const localReg = await fetch(`${origin}/fonts/Inter-Regular.woff2`);
				if (localBold.ok && localReg.ok) {
					interBold = await localBold.arrayBuffer();
					interReg = await localReg.arrayBuffer();
				}
			} catch {
				// leave interBold/interReg undefined and continue without custom fonts
			}
		}

		// NOTE: We intentionally do NOT prefer static OG images here anymore, 
		// because we want the new dynamic design to be the primary source.


		let image;
		try {
			image = new ImageResponse(
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
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, maxWidth: '1000px', textAlign: 'center' }}>
						
						{/* Hero Title */}
						<span style={{ 
							fontSize: 100, 
							fontWeight: 800, 
							letterSpacing: '-0.04em', 
							lineHeight: 1,
							marginBottom: 32,
							backgroundImage: 'linear-gradient(to bottom right, #fff, #ccc)',
							backgroundClip: 'text',
							color: 'transparent',
						}}>
							Easy PDF
						</span>

						{/* Subtitle */}
						<span style={{ 
							fontSize: 36, 
							color: '#A1A1AA', 
							lineHeight: 1.4,
							fontWeight: 400,
							maxWidth: '800px',
							marginBottom: 64,
						}}>
							Privacy-first PDF tools that run entirely in your browser.
						</span>

						{/* Feature Pills */}
						<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
							{['Merge', 'Split', 'Compress', 'Convert', 'OCR', 'Security'].map((feature) => (
								<div key={feature} style={{
									padding: '12px 28px',
									background: '#111',
									border: '1px solid #333',
									borderRadius: 999,
									color: '#fff',
									fontSize: 20,
									fontWeight: 500,
									boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
								}}>
									{feature}
								</div>
							))}
						</div>
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
						
						<div style={{ fontSize: 20, fontWeight: 600, color: '#666' }}>
							easypdf.app
						</div>
					</div>
				</div>
			,
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

		try {
			image.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
		} catch {
			console.warn('Unable to set cache header on ImageResponse');
		}

		// Small analytics ping
		try {
			void fetch(`${origin}/api/og/log`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug: 'homepage', path: req.url })
			});
		} catch {
			// ignore
		}

		return image;
	} catch (err) {
		console.error('Homepage OG generation failed', err);
		return new Response('Failed to generate image', { status: 500 });
	}
}
