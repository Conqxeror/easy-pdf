"use client";

import React, { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { copyToClipboard, sanitizeFileName } from "@/lib/enhancedUX";
import { diffChars, diffLines, diffWords } from "diff";

const SAMPLE_ORIGINAL = `Yesterday we announced the PDF collaboration beta with live cursors, inline chat, and audit trails.
It required a static worker and a dedicated upload step to keep sync stable.`;

const SAMPLE_REVISED = `Today we are shipping the collaboration beta to everyone with real-time cursors, inline annotations, chat, and audit-ready trails.
Everything now runs 100% locally, so there is no upload step or worker mindset anymore.`;

const MAX_TEXT_SIZE = 200_000; // Light guardrail for in-browser diffs

const diffModes = [
	{ value: "words", label: "Words", description: "Great for marketing copy and paragraphs." },
	{ value: "lines", label: "Lines", description: "Best for release notes or config files." },
	{ value: "chars", label: "Characters", description: "Inspect tiny tweaks or typos." },
];

const normalizeWhitespace = (value) =>
	value
		.replace(/[\t ]+/g, " ")
		.replace(/ *\n */g, "\n")
		.trim();

const diffEngines = {
	words: (a, b, options) => diffWords(a, b, { ignoreCase: options.ignoreCase }),
	lines: (a, b, options) => diffLines(a, b, { ignoreWhitespace: options.collapseWhitespace }),
	chars: (a, b, options) => diffChars(options.ignoreCase ? a.toLowerCase() : a, options.ignoreCase ? b.toLowerCase() : b),
};

export default function TextDiffCheckerClient() {
	const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL);
	const [revisedText, setRevisedText] = useState(SAMPLE_REVISED);
	const [diffMode, setDiffMode] = useState("words");
	const [ignoreCase, setIgnoreCase] = useState(false);
	const [collapseWhitespace, setCollapseWhitespace] = useState(false);

	const diffAnalysis = useMemo(() => {
		if (!originalText && !revisedText) {
			return { segments: [], stats: { insertions: 0, deletions: 0, unchanged: 0, delta: 0 }, report: "", error: "" };
		}

		try {
			if (originalText.length > MAX_TEXT_SIZE || revisedText.length > MAX_TEXT_SIZE) {
				throw new Error("Input too large. Please keep each field under ~200k characters for instant diffs.");
			}

			const preparedOriginal = collapseWhitespace ? normalizeWhitespace(originalText) : originalText;
			const preparedRevised = collapseWhitespace ? normalizeWhitespace(revisedText) : revisedText;
			const engine = diffEngines[diffMode];
			const segments = engine(preparedOriginal, preparedRevised, { ignoreCase, collapseWhitespace }) || [];

			const stats = segments.reduce(
				(acc, part) => {
					const length = part.count ?? part.value?.length ?? 0;
					if (part.added) acc.insertions += length;
					else if (part.removed) acc.deletions += length;
					else acc.unchanged += length;
					return acc;
				},
				{ insertions: 0, deletions: 0, unchanged: 0, delta: 0 }
			);
			stats.delta = stats.insertions - stats.deletions;

			const report = segments
				.map((part) => {
					const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
					return `${prefix}${part.value || ""}`;
				})
				.join("");

			return { segments, stats, report, error: "" };
		} catch (err) {
			console.error("Diff calculation failed", err);
			return { segments: [], stats: { insertions: 0, deletions: 0, unchanged: 0, delta: 0 }, report: "", error: err.message };
		}
	}, [originalText, revisedText, diffMode, ignoreCase, collapseWhitespace]);

	const copyReport = async () => {
		if (!diffAnalysis.report) {
			toast.error("Generate a diff first");
			return;
		}
		await copyToClipboard(diffAnalysis.report, "Diff report copied");
	};

	const downloadReport = () => {
		if (!diffAnalysis.report) return;
		const blob = new Blob([diffAnalysis.report], { type: "text/plain" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `${sanitizeFileName("text-diff")}.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setTimeout(() => URL.revokeObjectURL(link.href), 300);
	};

	const swapTexts = () => {
		setOriginalText(revisedText);
		setRevisedText(originalText);
	};

	const toolName = "Text Diff Checker";
	const toolDescription = "Spot wording changes, config tweaks, or typo fixes with a fast visual diff that never uploads your documents.";
	const steps = [
		"Paste the original copy on the left and the updated version on the right.",
		"Choose the diff mode (words, lines, or characters) and optional ignore toggles.",
		"Review highlights, copy the diff report, or download a .txt summary.",
	];
	const faqs = [
		{
			question: "Do you support Markdown or code?",
			answer: "Yes. The line diff mode is perfect for Markdown snippets, config files, or code blocks.",
		},
		{
			question: "How big can the files be?",
			answer: "For responsive comparisons keep each textarea under ~200k characters (roughly a short chapter).",
		},
		{
			question: "Is anything uploaded?",
			answer: "Never. All comparisons run in memory using the diff library and disappear when you refresh the page.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Compare two snippets instantly with inline highlights, stats, and share-ready reports."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Text Diff Checker", href: "/text-diff-checker" },
			]}
			currentTool="text-diff-checker"
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
					<Button size="sm" variant="secondary" onClick={() => setOriginalText(SAMPLE_ORIGINAL)}>
						Load original sample
					</Button>
					<Button size="sm" variant="secondary" onClick={() => setRevisedText(SAMPLE_REVISED)}>
						Load revised sample
					</Button>
					<Button size="sm" variant="outline" onClick={swapTexts}>
						Swap sides
					</Button>
					<Button size="sm" variant="outline" onClick={() => { setOriginalText(""); setRevisedText(""); }}>
						Clear
					</Button>
					<span>Original chars: {originalText.length}</span>
					<span>Revised chars: {revisedText.length}</span>
				</div>

				{diffAnalysis.error && (
					<Alert variant="destructive">
						<AlertTitle>Unable to compute diff</AlertTitle>
						<AlertDescription>{diffAnalysis.error}</AlertDescription>
					</Alert>
				)}

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Original Text</h3>
							<Button size="sm" variant="outline" onClick={() => copyToClipboard(originalText || "", "Original text copied")}>Copy</Button>
						</div>
						<Textarea
							value={originalText}
							onChange={(event) => setOriginalText(event.target.value)}
							placeholder="Paste the current copy, policy, or config"
							className="min-h-[260px] font-mono text-sm"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Revised Text</h3>
							<Button size="sm" variant="outline" onClick={() => copyToClipboard(revisedText || "", "Revised text copied")}>Copy</Button>
						</div>
						<Textarea
							value={revisedText}
							onChange={(event) => setRevisedText(event.target.value)}
							placeholder="Paste the updated draft, config, or proposal"
							className="min-h-[260px] font-mono text-sm"
						/>
					</div>
				</div>

				<div className="border bg-card p-4 space-y-4">
					<div className="flex flex-wrap items-center gap-3">
						{diffModes.map((mode) => (
							<Button
								key={mode.value}
								size="sm"
								variant={diffMode === mode.value ? "default" : "outline"}
								onClick={() => setDiffMode(mode.value)}
							>
								{mode.label}
							</Button>
						))}
						<div className="flex items-center gap-2">
							<Checkbox id="ignoreCase" checked={ignoreCase} onCheckedChange={(value) => setIgnoreCase(Boolean(value))} />
							<Label htmlFor="ignoreCase" className="text-sm">Ignore case</Label>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="collapseWhitespace"
								checked={collapseWhitespace}
								onCheckedChange={(value) => setCollapseWhitespace(Boolean(value))}
							/>
							<Label htmlFor="collapseWhitespace" className="text-sm">Collapse whitespace</Label>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						{diffModes.find((mode) => mode.value === diffMode)?.description}
					</p>
				</div>

				<div className="border bg-background p-4">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-semibold">Highlighted diff</h4>
						<div className="flex gap-2 text-xs">
							<span className="bg-emerald-100/60 px-2 py-1 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">Additions</span>
							<span className="bg-rose-100/60 px-2 py-1 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">Deletions</span>
							<span className="bg-muted px-2 py-1">Unchanged</span>
						</div>
					</div>
					<div className="border bg-muted/40 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]" aria-live="polite">
						{diffAnalysis.segments.length === 0 ? (
							<p className="text-muted-foreground">Add text to both editors to see the diff.</p>
						) : (
							diffAnalysis.segments.map((part, index) => {
								const baseClass = part.added
									? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
									: part.removed
										? "text-rose-700 dark:text-rose-300 bg-rose-500/10 line-through"
										: "text-foreground";
								return (
									<span key={`${part.value}-${index}`} className={`${baseClass} px-0.5`}>{part.value}</span>
								);
							})
						)}
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-4">
					<StatCard label="Insertions" value={`+${diffAnalysis.stats.insertions}`} accent="text-emerald-500" />
					<StatCard label="Deletions" value={`-${diffAnalysis.stats.deletions}`} accent="text-rose-500" />
					<StatCard label="Unchanged" value={diffAnalysis.stats.unchanged} accent="text-muted-foreground" />
					<StatCard label="Net delta" value={diffAnalysis.stats.delta} accent="text-primary-foreground" />
				</div>

				<div className="flex flex-wrap gap-3">
					<Button onClick={copyReport} disabled={!diffAnalysis.report}>
						Copy diff report
					</Button>
					<Button variant="outline" onClick={downloadReport} disabled={!diffAnalysis.report}>
						Download .txt
					</Button>
				</div>
			</div>
		</ToolPageLayout>
	);
}

function StatCard({ label, value, accent }) {
	return (
		<div className="border bg-card p-4">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className={`text-2xl font-semibold ${accent}`}>{value}</p>
		</div>
	);
}
