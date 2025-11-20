import React from "react";
import { getToolMetadata } from "./toolSeoHelper";
import { getFAQsForTool } from "./faqData";
import { generateFAQPageSchema } from "./seoEnhancements";

/**
 * Helper to generate per-tool layout files with consistent metadata + structured data
 * @param {string} href - Tool route, e.g. "/mp4-to-mp3"
 * @param {object} options - Optional overrides for FAQs and custom structured data
 */
export function createToolLayout(href, options = {}) {
	const toolSeo = getToolMetadata(href);
	const metadata = toolSeo?.metadata || {};
	const schemas = [];

	if (Array.isArray(toolSeo?.structuredData)) {
		schemas.push(...toolSeo.structuredData);
	} else if (toolSeo?.structuredData) {
		schemas.push(toolSeo.structuredData);
	}

	const slug = href.replace(/^\//, "");
	const faqs = Array.isArray(options.faqs) ? options.faqs : getFAQsForTool(slug);
	if (faqs && faqs.length > 0) {
		const faqSchema = generateFAQPageSchema(faqs);
		if (faqSchema) {
			schemas.push(faqSchema);
		}
	}

	const customData = options.customStructuredData;
	if (customData) {
		const toAdd = Array.isArray(customData) ? customData : [customData];
		toAdd.filter(Boolean).forEach((schema) => schemas.push(schema));
	}

	const Layout = ({ children }) => (
		<>
			{schemas.map((schema, index) => (
				<script
					key={`tool-schema-${slug || "default"}-${index}`}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
			{children}
		</>
	);

	Layout.displayName = `ToolLayout(${slug || "root"})`;

	return { metadata, Layout };
}
