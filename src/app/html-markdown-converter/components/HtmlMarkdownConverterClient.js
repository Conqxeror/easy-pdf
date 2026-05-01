"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DOMPurify from "dompurify";
import { copyToClipboard } from "@/lib/enhancedUX";
import { toast } from "sonner";

const SAMPLE_MARKDOWN = `## Release Notes\n\n- ✅ Client-side PDF processing\n- ⚡️ Video tools powered by ffmpeg.wasm\n- 🔒 Zero uploads by design\n\n[Explore tools →](https://easy-pdf.dev/tools)`;
const SAMPLE_HTML = `<section class="prose">\n  <h2>Instant conversions</h2>\n  <p>Drop your PDF and get a polished output without waiting on a server.</p>\n  <ul>\n    <li>Merge, split, and compress</li>\n    <li>Convert to DOCX, PPT, or XLSX</li>\n    <li>Keep everything 100% private</li>\n  </ul>\n</section>`;

let markdownLibrariesPromise;

const loadMarkdownLibraries = async () => {
	if (!markdownLibrariesPromise) {
		markdownLibrariesPromise = Promise.all([
			import("marked"),
			import("turndown"),
		]).then(([markedModule, turndownModule]) => {
			const TurndownService = turndownModule.default;
			const turndown = new TurndownService({ headingStyle: "atx" });
			turndown.keep(["span", "br", "sub", "sup"]);

			return {
				marked: markedModule.marked,
				turndown,
			};
		});
	}

	return markdownLibrariesPromise;
};

const sanitizeHtml = (value) => {
  if (typeof window === 'undefined') return "";
  return DOMPurify.sanitize(value, { ADD_TAGS: ["style"], ADD_ATTR: ["target", "rel", "class"] });
};

export default function HtmlMarkdownConverterClient() {
	const [markdownValue, setMarkdownValue] = useState(SAMPLE_MARKDOWN);
	const [htmlValue, setHtmlValue] = useState("");
	const [activeTab, setActiveTab] = useState("preview");
	const [error, setError] = useState("");

    useEffect(() => {
				let isMounted = true;

				const initializePreview = async () => {
					const { marked } = await loadMarkdownLibraries();

					if (isMounted) {
						setHtmlValue(sanitizeHtml(marked.parse(SAMPLE_MARKDOWN)));
					}
				};

				void initializePreview();

				return () => {
					isMounted = false;
				};
    }, []);

	const convertMarkdownToHtml = async () => {
		try {
			const { marked } = await loadMarkdownLibraries();
			const rendered = sanitizeHtml(marked.parse(markdownValue || ""));
			setHtmlValue(rendered);
			setError("");
			toast.success("Converted Markdown to HTML");
		} catch {
			setError("Unable to parse Markdown. Please double-check your syntax.");
		}
	};

	const convertHtmlToMarkdown = async () => {
		try {
			const { turndown } = await loadMarkdownLibraries();
			const markdown = turndown.turndown(htmlValue || "");
			setMarkdownValue(markdown);
			setError("");
			toast.success("Converted HTML to Markdown");
		} catch {
			setError("Unable to convert HTML. Ensure tags are properly closed.");
		}
	};

	const copy = async (value, label) => {
		if (!value) {
			toast.error("Nothing to copy yet");
			return;
		}
		await copyToClipboard(value, `${label} copied to clipboard`);
	};

	const clearAll = () => {
		setMarkdownValue("");
		setHtmlValue("");
		setError("");
	};

	const toolName = "HTML ↔ Markdown Converter";
	const toolDescription = "Flip markup between Markdown and clean HTML entirely inside your browser. Perfect for docs writers, changelog authors, and CMS migrations.";
	const steps = [
		"Paste Markdown or HTML into the respective editor.",
		"Use the action buttons to convert in either direction.",
		"Copy the output or preview the sanitized HTML before publishing.",
	];

	const faqs = [
		{
			question: "Do you strip inline styles?",
			answer: "We sanitize disallowed attributes for safety but keep basic classes, inline styles, and target rel attributes so you can paste into CMS fields confidently.",
		},
		{
			question: "Can I convert large documents?",
			answer: "Yes. Everything runs in-memory, so the practical limit is your browser. For very large files we recommend chunking sections to keep things responsive.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Convert documentation chunks, emails, or release notes between Markdown and HTML instantly."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "HTML ↔ Markdown", href: "/html-markdown-converter" },
			]}
			currentTool="html-markdown-converter"
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3 text-xs text-foreground dark:text-foreground">
					<Button size="sm" variant="secondary" onClick={async () => {
						const { marked } = await loadMarkdownLibraries();
						setMarkdownValue(SAMPLE_MARKDOWN);
						setHtmlValue(sanitizeHtml(marked.parse(SAMPLE_MARKDOWN)));
					}}>
						Load Markdown sample
					</Button>
					<Button size="sm" variant="secondary" onClick={async () => {
						const { turndown } = await loadMarkdownLibraries();
						setHtmlValue(SAMPLE_HTML);
						setMarkdownValue(turndown.turndown(SAMPLE_HTML));
					}}>
						Load HTML sample
					</Button>
					<Button size="sm" variant="outline" onClick={clearAll}>Clear editors</Button>
					<span>Markdown chars: {markdownValue.length}</span>
					<span>HTML chars: {htmlValue.length}</span>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Markdown</h3>
							<div className="flex gap-2">
								<Button size="sm" onClick={() => void convertMarkdownToHtml()}>Convert to HTML</Button>
								<Button size="sm" variant="outline" onClick={() => copy(markdownValue, "Markdown")}>Copy</Button>
							</div>
						</div>
						<Textarea
							value={markdownValue}
							onChange={(event) => setMarkdownValue(event.target.value)}
							placeholder="Paste Markdown here"
							className="font-mono min-h-[260px]"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">HTML</h3>
							<div className="flex gap-2">
								<Button size="sm" onClick={() => void convertHtmlToMarkdown()}>Convert to Markdown</Button>
								<Button size="sm" variant="outline" onClick={() => copy(htmlValue, "HTML")}>Copy</Button>
							</div>
						</div>
						<Textarea
							value={htmlValue}
							onChange={(event) => setHtmlValue(event.target.value)}
							placeholder="Paste HTML snippets or email templates"
							className="font-mono min-h-[260px]"
						/>
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList>
						<TabsTrigger value="preview">HTML Preview</TabsTrigger>
						<TabsTrigger value="source">Raw HTML</TabsTrigger>
					</TabsList>
					<TabsContent value="preview" className="border border-border rounded-none p-6 bg-background text-foreground min-h-[200px]">
						<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlValue) }} />
					</TabsContent>
					<TabsContent value="source">
						<Textarea readOnly value={htmlValue} className="font-mono min-h-[200px]" />
					</TabsContent>
				</Tabs>

				{error && (
					<Alert variant="destructive">
						<AlertTitle>Conversion error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
			</div>
		</ToolPageLayout>
	);
}
