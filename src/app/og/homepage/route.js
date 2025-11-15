import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req) {
	try {
		// Use Google Fonts for consistent typography
		const url = new URL(req.url);
		const origin = `${url.protocol}//${url.host}`;
		let interBold, interReg;

		try {
			const localBold = await fetch(`${origin}/fonts/Inter-Bold.woff2`);
			const localReg = await fetch(`${origin}/fonts/Inter-Regular.woff2`);
			if (localBold.ok && localReg.ok) {
				interBold = await localBold.arrayBuffer();
				interReg = await localReg.arrayBuffer();
			} else {
				throw new Error('Local fonts not available');
			}
		} catch {
			const interBoldReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Bold.woff2');
			const interRegReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Regular.woff2');
			interBold = await interBoldReq.arrayBuffer();
			interReg = await interRegReq.arrayBuffer();
		}

		const image = new ImageResponse(
			(
				<div
					style={{
						width: '1200px',
						height: '630px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						padding: '60px',
						background: 'linear-gradient(135deg,#0f172a 0%, #111827 100%)',
						color: 'white',
						boxSizing: 'border-box',
						fontFamily: 'Inter'
					}}
				>
					<div style={{ textAlign: 'center' }}>
						<span style={{ fontSize: 64, fontWeight: 700 }}>easy-pdf</span>
						<div style={{ fontSize: 24, marginTop: 8 }}>Privacy-first PDF tools that run in your browser</div>
						<div style={{ fontSize: 16, opacity: 0.85, marginTop: 12 }}>Try tools like Merge, Split, Compress, and more — all client-side</div>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
				fonts: [
					{ name: 'Inter', data: interReg, weight: 400, style: 'normal' },
					{ name: 'Inter', data: interBold, weight: 700, style: 'normal' }
				]
			}
		);

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
