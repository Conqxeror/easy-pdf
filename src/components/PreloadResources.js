'use client'

import ReactDOM from 'react-dom'

/**
 * Component that adds preconnect hints to the document head
 * for improved resource loading performance (Core Web Vitals).
 * 
 * Using ReactDOM.preconnect() ensures these hints are properly
 * placed in <head> rather than <body>.
 * 
 * Note: Google Fonts preconnect removed - using next/font which self-hosts fonts
 * for better privacy and performance (eliminates external DNS lookup).
 */
export function PreloadResources() {
	// Vercel Live (for preview deployments)
	ReactDOM.preconnect('https://vercel.live')

	return null
}
