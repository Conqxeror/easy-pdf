export async function POST(req) {
	try {
		const body = await req.json();
		// Optionally forward to GA4 Measurement Protocol if env vars are provided
		const measurementId = process.env.GA_MEASUREMENT_ID;
		const apiSecret = process.env.GA_API_SECRET;
		if (measurementId && apiSecret) {
			try {
				const clientId = body.sessionId || `og-${Math.random().toString(36).slice(2)}`;
				const mpUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
				await fetch(mpUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ client_id: clientId, events: [{ name: 'og_image_serve', params: { slug: body.slug || '', tool: body.tool || '' } }] })
				});
			} catch (e) {
				if (process.env.NODE_ENV === 'development') {
					console.warn('Failed to forward OG event to GA', e);
				}
			}
		}
		return new Response(null, { status: 204 });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('Failed to parse OG log', err);
		}
		return new Response(null, { status: 400 });
	}
}
