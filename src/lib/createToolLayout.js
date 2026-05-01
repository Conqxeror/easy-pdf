import React from "react";
import { getToolMetadata } from "./toolSeoHelper";
import { dedupeJsonLdSchemas } from "./seoEnhancements";

/**
 * Helper to generate per-tool layout files with consistent metadata + structured data
 * @param {string} href - Tool route, e.g. "/mp4-to-mp3"
 * @param {object} options - Optional overrides for FAQs and custom structured data
 */
export function createToolLayout(href, options = {}) {
	const toolSeo = getToolMetadata(href);
	const metadata = toolSeo?.metadata || {};
	const schemas = [];

	const slug = href.replace(/^\//, "");
	if (options.includeBaseStructuredData === true && toolSeo?.structuredData) {
		schemas.push(toolSeo.structuredData);
	}

	const customData = options.customStructuredData;
	if (customData) {
		const toAdd = Array.isArray(customData) ? customData : [customData];
		toAdd.filter(Boolean).forEach((schema) => schemas.push(schema));
	}

	const uniqueSchemas = dedupeJsonLdSchemas(schemas);

	const Layout = ({ children }) => (
		<>
			{uniqueSchemas.map((schema, index) => (
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
