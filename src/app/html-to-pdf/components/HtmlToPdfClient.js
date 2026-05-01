"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import { html as htmlLang } from "@codemirror/lang-html";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import FileDropzone from "@/components/ui/FileDropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertHtmlToPdf } from "@/lib/htmlToPdf";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { Loader2, Download, RefreshCcw } from "lucide-react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

const DEFAULT_TEMPLATE = `
<section style="padding:48px;font-family:'Inter',Arial,sans-serif;background:#f8fafc;color:#0f172a;">
  <header style="border-bottom:2px solid #e2e8f0;margin-bottom:32px;padding-bottom:16px;">
    <p style="text-transform:uppercase;font-size:12px;letter-spacing:4px;color:#94a3b8;margin:0;">easy-pdf</p>
	<h2 style="font-size:32px;margin:8px 0 0;">Launch recap</h2>
  </header>
  <article style="line-height:1.6;font-size:16px;margin-bottom:24px;">
    <p>Thanks for trying the new HTML to PDF converter. Paste your markup, tweak layout controls, and ship beautiful PDFs without uploads.</p>
    <ul style="margin:16px 0 0;padding-left:20px;">
      <li>Client-side rendering</li>
      <li>Accessible typography</li>
      <li>Instant downloads</li>
    </ul>
  </article>
  <footer style="display:flex;gap:12px;">
    <button style="background:#0f172a;color:white;padding:12px 20px;border-radius:999px;border:none;">Primary CTA</button>
    <button style="background:transparent;color:#0f172a;padding:12px 20px;border:1px solid #cbd5f5;border-radius:999px;">Secondary CTA</button>
  </footer>
</section>`;

const PAGE_SIZES = [
	{ value: "a4", label: "A4" },
	{ value: "letter", label: "Letter" },
	{ value: "legal", label: "Legal" }
];

const ORIENTATIONS = [
	{ value: "portrait", label: "Portrait" },
	{ value: "landscape", label: "Landscape" }
];

export default function HtmlToPdfClient() {
	const [htmlValue, setHtmlValue] = useState(DEFAULT_TEMPLATE);
	const [pageSize, setPageSize] = useState("a4");
	const [orientation, setOrientation] = useState("portrait");
	const [margin, setMargin] = useState("24");
	const [error, setError] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [downloadUrl, setDownloadUrl] = useState(null);
	const [downloadName, setDownloadName] = useState("html-to-pdf.pdf");
	const [stats, setStats] = useState(null);
	const [sourceUrl, setSourceUrl] = useState("");
	const [isFetchingUrl, setIsFetchingUrl] = useState(false);
	const previewRef = useRef(null);

	useEffect(() => {
		return () => {
			safeRevokeObjectURL(downloadUrl);
		};
	}, [downloadUrl]);

	const sanitizedHtml = useMemo(() => {
		if (typeof window === "undefined") return htmlValue;
		return DOMPurify.sanitize(htmlValue, { USE_PROFILES: { html: true } });
	}, [htmlValue]);

	const handleFiles = useCallback((files) => {
		if (!files || !files.length) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			setHtmlValue(evt.target?.result?.toString() || "");
		};
		reader.readAsText(files[0]);
	}, []);

	const fetchRemoteHtml = useCallback(async () => {
		if (!sourceUrl) {
			setError("Enter a URL to fetch HTML from.");
			return;
		}
		try {
			setIsFetchingUrl(true);
			setError("");
			const response = await fetch(sourceUrl, { mode: "cors" });
			if (!response.ok) {
				throw new Error(`Unable to fetch markup (status ${response.status}).`);
			}
			const text = await response.text();
			setHtmlValue(text);
		} catch (err) {
			setError(err?.message || "Failed to fetch the requested HTML.");
		} finally {
			setIsFetchingUrl(false);
		}
	}, [sourceUrl]);

	const handleGenerate = useCallback(async () => {
		try {
			setIsGenerating(true);
			setError("");
			const numericMargin = Number.parseInt(margin, 10);
			const { blob, stats: renderStats } = await convertHtmlToPdf({
				html: sanitizedHtml,
				pageSize,
				orientation,
				margin: Number.isFinite(numericMargin) ? numericMargin : 24,
				scale: window.devicePixelRatio > 1 ? 2 : 1.5
			});
			safeRevokeObjectURL(downloadUrl);
			const url = safeCreateObjectURL(blob);
			setDownloadUrl(url);
			setStats(renderStats);
			const prettyName = `html-to-pdf-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
			setDownloadName(prettyName);
		} catch (err) {
			setError(err?.message || "Something went wrong while generating the PDF.");
		} finally {
			setIsGenerating(false);
		}
	}, [margin, orientation, pageSize, sanitizedHtml, downloadUrl]);

	const resetTemplate = () => {
		setHtmlValue(DEFAULT_TEMPLATE);
		setError("");
		safeRevokeObjectURL(downloadUrl);
		setDownloadUrl(null);
		setStats(null);
	};

	return (
		<ToolPageLayout
			title="HTML to PDF Converter"
			subtitle="Convert HTML code or files to PDF instantly in your browser."
			toolName="HTML to PDF"
			toolDescription="Render HTML to PDF with full control over page size, orientation, and margins."
			currentTool="html-to-pdf"
			steps={[
				"Paste or type your HTML in the code editor, or upload an .html/.txt file.",
				"Adjust page size, orientation, and margins to match the final document.",
				"Use the live preview to double-check typography, spacing, and backgrounds.",
				"Click Generate PDF to render the document entirely in your browser.",
				"Download the PDF and share it without ever uploading sensitive HTML."
			]}
			features={[
				"Live HTML preview with syntax highlighting and auto-formatting",
				"Supports A4, Letter, and Legal sizes in portrait or landscape",
				"Sanitized rendering to avoid untrusted scripts or remote assets",
				"Client-side PDF engine powered by html2canvas + jsPDF"
			]}
			useCases={[
				{
					title: "Invoice Generation",
					description: "Paste an HTML invoice template and print it to PDF for clients."
				},
				{
					title: "Report Archiving",
					description: "Save web-based reports or dashboards as static PDF documents."
				},
				{
					title: "Documentation",
					description: "Convert technical documentation or wikis into shareable manuals."
				}
			]}
			faqs={[
				{
					question: "Does this support CSS and images?",
					answer: "Yes, inline styles and style tags are supported. Remote images work if they allow cross-origin access (CORS)."
				},
				{
					question: "Is my HTML uploaded to a server?",
					answer: "No. The conversion happens entirely in your browser using JavaScript libraries."
				},
				{
					question: "Can I use JavaScript in my HTML?",
					answer: "Scripts are sanitized for security reasons. Only static HTML and CSS are rendered."
				}
			]}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Convert & Create", href: "/categories/convert-create" },
				{ label: "HTML to PDF", href: "/html-to-pdf" }
			]}
		>
			<div className="space-y-8">
				{error && (
					<Alert variant="destructive">
						<p className="font-medium">{error}</p>
					</Alert>
				)}

				<Card variant="glass">
					<CardHeader>
						<CardTitle>Bring Your Own HTML</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<FileDropzone
							accept=".html,.htm,.txt,text/html,text/plain"
							multiple={false}
							label="Upload HTML file"
							description="Drop an .html / .txt export to load it into the editor"
							onFiles={handleFiles}
						/>

						<div className="grid gap-4 md:grid-cols-[1fr_auto]">
							<div className="space-y-2">
								<Label htmlFor="source-url">Fetch from URL</Label>
								<div className="flex flex-col gap-3 md:flex-row">
									<Input
										id="source-url"
										placeholder="https://example.com/template.html"
										value={sourceUrl}
										onChange={(e) => setSourceUrl(e.target.value)}
									/>
									<Button type="button" onClick={fetchRemoteHtml} disabled={isFetchingUrl}>
										{isFetchingUrl ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
										Fetch HTML
									</Button>
									<Button type="button" variant="secondary" onClick={resetTemplate}>
										<RefreshCcw className="mr-2 h-4 w-4" />Use Sample
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
					<Card className="h-full min-w-0">
						<CardHeader>
							<CardTitle>HTML Editor</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="rounded-none border border-border overflow-hidden max-w-full">
								<CodeMirror
									value={htmlValue}
									height="420px"
									className="max-w-full"
									theme="dark"
									extensions={[htmlLang()]}
									onChange={(value) => setHtmlValue(value)}
								/>
							</div>
						</CardContent>
					</Card>

					<Card className="h-full min-w-0">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Live Preview</CardTitle>
							<Badge variant="outline">Sanitized</Badge>
						</CardHeader>
						<CardContent>
							<div
								ref={previewRef}
								className="min-h-[420px] max-w-full rounded-none border border-border bg-background text-foreground shadow-inner overflow-auto [&_*]:max-w-full [&_*]:break-words"
								dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
							/>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Layout Settings</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label>Page Size</Label>
							<Select value={pageSize} onValueChange={setPageSize}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Choose size" />
								</SelectTrigger>
								<SelectContent>
									{PAGE_SIZES.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Orientation</Label>
							<Select value={orientation} onValueChange={setOrientation}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Orientation" />
								</SelectTrigger>
								<SelectContent>
									{ORIENTATIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="margin">Margin (pt)</Label>
							<Input
								id="margin"
								type="number"
								min="0"
								max="144"
								value={margin}
								onChange={(e) => setMargin(e.target.value)}
							/>
						</div>
					</CardContent>
				</Card>

				<div className="flex flex-wrap items-center gap-4">
					<Button type="button" size="lg" onClick={handleGenerate} disabled={isGenerating}>
						{isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
						Generate PDF
					</Button>
					{downloadUrl && (
						<Button asChild variant="secondary" size="lg">
							<a href={downloadUrl} download={downloadName}>
								<Download className="mr-2 h-4 w-4" />Download {downloadName}
							</a>
						</Button>
					)}
					{stats && (
						<p className="text-sm text-foreground">Rendered canvas: {stats.width}×{stats.height}px</p>
					)}
				</div>
			</div>
		</ToolPageLayout>
	);
}