import React from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
	title: "Terms of Service - easy-pdf | Free PDF Tools",
	description: "Terms of service for easy-pdf. Completely free, client-side PDF tools with no warranties.",
	keywords: ["terms of service", "easy-pdf terms", "pdf tools usage policy"],
	canonicalUrl: "https://easy-pdf-murex.vercel.app/terms",
	metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
	pageType: "article",
	breadcrumbs: [
		{ name: "Home", url: "https://easy-pdf-murex.vercel.app" },
		{ name: "Terms", url: "https://easy-pdf-murex.vercel.app/terms" }
	]
});

const structuredData = generateComprehensiveJsonLd('article');

export default function TermsPage() {
	const toolName = "Terms of Service";
	const toolDescription = "By using easy-pdf, you agree to these terms. We provide 100% client-side PDF tools for free.";

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<ToolPageLayout
				title="Terms of Service"
				subtitle="Please read these terms carefully before using our service."
				toolName={toolName}
				toolDescription={toolDescription}
				currentTool="terms"
				breadcrumbs={[
					{ label: 'Home', href: '/' },
					{ label: 'Terms', href: '/terms' }
				]}
			>
				<div className="prose dark:prose-invert max-w-none text-foreground">
					<h3>1. Service Description</h3>
					<p>easy-pdf provides free online PDF tools that run entirely in your web browser. We do not upload your files to any server.</p>

					<h3>2. Privacy</h3>
					<p>Since processing is client-side, your files remain on your device. We do not have access to your documents. Please review our Privacy Policy at <a href="/privacy">/privacy</a> for more details.</p>

					<h3>3. Disclaimer of Warranties</h3>
					<p>The service is provided &quot;as is&quot; without any warranties. We are not liable for any data loss or corruption resulting from the use of these tools.</p>

					<h3>4. Usage</h3>
					<p>You may use these tools for personal or commercial purposes for free. You may not reverse engineer or exploit the service.</p>
				</div>
			</ToolPageLayout>
		</>
	);
}
