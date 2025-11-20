import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolSeo = getToolMetadata('/html-to-pdf');
const structuredData = toolSeo?.structuredData || [];

const faqStructuredData = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	"mainEntity": [
		{
			"@type": "Question",
			"name": "Does HTML stay on my device?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "Yes. The HTML to PDF converter works entirely inside your browser so your snippets, pasted markup, and generated PDFs never leave your device."
			}
		},
		{
			"@type": "Question",
			"name": "Can I convert pages while offline?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "Once the page has loaded you can keep using the editor and generator without a network connection because all rendering happens locally."
			}
		},
		{
			"@type": "Question",
			"name": "What page sizes are supported?",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "The tool supports A4, Letter, and Legal sizes in portrait or landscape orientation. More sizes can be added easily if you need them."
			}
		}
	]
};

export default function HtmlToPdfLayout({ children }) {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
			/>
			{children}
		</>
	);
}
