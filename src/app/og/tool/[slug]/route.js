import { ImageResponse } from 'next/server';
import { toolsData } from '@/lib/toolData';

export const runtime = 'edge';

// Dynamic OG image endpoint for tools. Example: /og/tool/merge
export async function GET(req, { params }) {
	try {
		const { slug } = params;
		const toolHref = `/${slug}`;
		const tool = toolsData.find(t => t.href === toolHref);

		// `hostname` not used; remove assignment

		const title = tool?.ogTitle || tool?.seoTitle || tool?.title || 'easy-pdf';
		const subtitle = tool?.ogSubtitle || tool?.seoDescription || 'Privacy-first PDF tools — no uploads.';

		// Try to load fonts from local public folder first for better caching and privacy.
		// If the fonts are not present in /public/fonts, fall back to Google Fonts CDN.
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
			// Fallback to Google Fonts
			const interBoldReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Bold.woff2');
			const interRegReq = await fetch('https://fonts.gstatic.com/s/inter/v12/Inter-Regular.woff2');
			interBold = await interBoldReq.arrayBuffer();
			interReg = await interRegReq.arrayBuffer();
		}

		// Render an improved OG design with logo, icon (if present), and CTA.
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
						{/* Use raw <img> inside ImageResponse; this is OK for OG image generation */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={tool?.ogIcon || (`/images/tools/${slug}.png`)} width="64" height="64" style={{ borderRadius: 8, background: '#111827' }} alt={`${tool?.title || 'easy-pdf'} icon`} />
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
				fonts: [
					{ name: 'Inter', data: interReg, weight: 400, style: 'normal' },
					{ name: 'Inter', data: interBold, weight: 700, style: 'normal' }
				]
			}
		);

		// Set caching headers for CDN caching (cache for 1 day, revalidate in background)
		try {
			image.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
		} catch {
			console.warn('Unable to set cache header on ImageResponse');
		}

		// POST a lightweight analytics hit to the server logging endpoint. This helps us
		// measure demand for specific tool images. Log asynchronously and ignore failures.
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
