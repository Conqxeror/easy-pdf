"use client";

import React, { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { copyToClipboard } from "@/lib/enhancedUX";

const DEFAULT_PATTERN = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}";
const DEFAULT_INPUT = `invite ken@easy-pdf.dev or mia@pdf.tools for the beta list\\nbackup: ops@sub.mail.easy-pdf.dev`;

const PRESETS = [
	{
		label: "Emails",
		pattern: DEFAULT_PATTERN,
		sample: DEFAULT_INPUT,
	},
	{
		label: "Hex colors",
		pattern: "#(?:[0-9a-fA-F]{3}){1,2}",
		sample: "Brand palette: #111827, #F472B6, gradient stops #0EA5E9 and #9333EA.",
	},
	{
		label: "URLs",
		pattern: "https?:\\/\\/[^\\s]+",
		sample: "Docs at https://easy-pdf.dev/docs and staging https://beta.easy-pdf.dev/changelog",
	},
];

const MAX_INPUT_SIZE = 40_000;
const MAX_MATCHES = 400;

const FLAG_META = [
	{ key: "global", flag: "g", label: "Global", description: "Find every match" },
	{ key: "caseInsensitive", flag: "i", label: "Ignore case", description: "Case-insensitive" },
	{ key: "multiline", flag: "m", label: "Multiline", description: "^ and $ per line" },
	{ key: "dotAll", flag: "s", label: "Dot matches newline", description: "Allow . to span lines" },
	{ key: "unicode", flag: "u", label: "Unicode", description: "Full Unicode mode" },
];

const buildFlagString = (state) =>
	FLAG_META.map(({ key, flag }) => (state[key] ? flag : ""))
		.join("");

const createHighlightSegments = (text, matches) => {
	if (!text) return [];
	const segments = [];
	let cursor = 0;
	matches.forEach(({ index, end, text: matchText }) => {
		if (cursor < index) {
			segments.push({ type: "plain", value: text.slice(cursor, index) });
		}
		segments.push({ type: "match", value: matchText });
		cursor = end;
	});
	if (cursor < text.length) {
		segments.push({ type: "plain", value: text.slice(cursor) });
	}
	return segments;
};

export default function RegexTesterClient() {
	const [pattern, setPattern] = useState(DEFAULT_PATTERN);
	const [testInput, setTestInput] = useState(DEFAULT_INPUT);
	const [flags, setFlags] = useState({
		global: true,
		caseInsensitive: false,
		multiline: true,
		dotAll: false,
		unicode: false,
	});

	const toggleFlag = (key) => {
		setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const analysis = useMemo(() => {
		if (!pattern) {
			return { matches: [], segments: [], error: "Enter a regex pattern to begin." };
		}

		try {
			if (testInput.length > MAX_INPUT_SIZE) {
				throw new Error("Input is too large for inline evaluation. Keep it under ~40k characters.");
			}

			const flagString = buildFlagString(flags);
			const regex = new RegExp(pattern, flagString);
			const iteratorFlags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
			const iterator = new RegExp(regex.source, iteratorFlags);
			const matches = [];

			let loops = 0;
			let match;
			while ((match = iterator.exec(testInput)) && loops < MAX_MATCHES) {
				if (match[0] === "") {
					matches.push({ text: "", index: match.index ?? iterator.lastIndex, end: (match.index ?? iterator.lastIndex) + 1, groups: [], rawGroups: {} });
					break;
				}
				matches.push({
					text: match[0],
					index: match.index ?? 0,
					end: (match.index ?? 0) + match[0].length,
					groups: match.slice(1),
					rawGroups: match.groups || {},
				});
				loops += 1;
			}

			const segments = createHighlightSegments(testInput, matches);
			const truncated = loops >= MAX_MATCHES;
			return { matches, segments, truncated, error: "" };
		} catch (err) {
			return { matches: [], segments: [], error: err.message };
		}
	}, [pattern, testInput, flags]);

	const groupCount = useMemo(() => {
		if (!analysis.matches.length) return 0;
		return Math.max(
			...analysis.matches.map((match) => Math.max(match.groups.length, Object.keys(match.rawGroups).length))
		);
	}, [analysis.matches]);

	const toolName = "Regex Tester";
	const toolDescription = "Preview JavaScript regular expressions with match highlights, capture groups, and helpful presets.";
	const steps = [
		"Paste or type your regex, then add sample input text.",
		"Toggle flags (global, multiline, etc.) to match your runtime environment.",
		"Inspect highlighted matches and capture groups, then copy the results for docs or code reviews.",
	];
	const faqs = [
		{
			question: "Do you support named capture groups?",
			answer: "Yes. Named and indexed groups are displayed in the results table as long as your pattern uses the /.../u flag when needed.",
		},
		{
			question: "How big can my test text be?",
			answer: "For responsive previews we cap inline evaluation at about 40k characters and 400 matches.",
		},
		{
			question: "Is anything uploaded?",
			answer: "Never. Everything is evaluated in-memory inside your browser tab.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Validate regex patterns with instant highlights, capture group tables, and friendly presets."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Regex Tester", href: "/regex-tester" },
			]}
			currentTool="regex-tester"
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
					{PRESETS.map((preset) => (
						<Button
							key={preset.label}
							size="sm"
							variant="secondary"
							onClick={() => {
								setPattern(preset.pattern);
								setTestInput(preset.sample);
							}}
						>
							{preset.label}
						</Button>
					))}
					<Button size="sm" variant="outline" onClick={() => { setPattern(""); setTestInput(""); }}>
						Clear inputs
					</Button>
					<span>Input chars: {testInput.length}</span>
				</div>

				{analysis.error && (
					<Alert variant="destructive">
						<AlertTitle>Regex error</AlertTitle>
						<AlertDescription>{analysis.error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-3">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<div className="flex items-center gap-2">
							<Label htmlFor="pattern" className="font-semibold">Pattern</Label>
							<code className="rounded-none bg-muted px-2 py-1 text-xs text-muted-foreground">/{pattern || ""}/{buildFlagString(flags)}</code>
						</div>
						<Button size="sm" variant="outline" onClick={() => copyToClipboard(pattern || "", "Pattern copied")}>Copy pattern</Button>
					</div>
					<Textarea
						id="pattern"
						value={pattern}
						onChange={(event) => setPattern(event.target.value)}
						placeholder="Type your regex (without surrounding / /)"
						className="font-mono"
					/>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					{FLAG_META.map(({ key, label, description }) => (
						<div key={key} className="flex items-start gap-3 rounded-none border p-3">
							<Checkbox id={key} checked={flags[key]} onCheckedChange={() => toggleFlag(key)} />
							<div>
								<Label htmlFor={key} className="font-semibold text-sm">{label}</Label>
								<p className="text-xs text-muted-foreground">{description}</p>
							</div>
						</div>
					))}
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<Label htmlFor="test-input" className="font-semibold">Test data</Label>
						<div className="flex gap-2">
							<Button size="sm" variant="outline" onClick={() => copyToClipboard(testInput || "", "Sample text copied")}>Copy text</Button>
							<Button size="sm" variant="outline" onClick={() => setTestInput(DEFAULT_INPUT)}>Load default sample</Button>
						</div>
					</div>
					<Textarea
						id="test-input"
						value={testInput}
						onChange={(event) => setTestInput(event.target.value)}
						placeholder="Paste multi-line strings, logs, URLs, etc."
						className="font-mono min-h-[220px]"
					/>
				</div>

				<div className="rounded-none border bg-card p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">Matches ({analysis.matches.length})</h3>
						{analysis.truncated && (
							<p className="text-xs text-amber-600">Stopped after {MAX_MATCHES} matches to avoid runaway loops.</p>
						)}
					</div>
					<div className="rounded-none border bg-background p-4 font-mono whitespace-pre-wrap leading-relaxed min-h-[160px]">
						{analysis.segments.length === 0 ? (
							<p className="text-muted-foreground">No matches yet. Update your regex or input.</p>
						) : (
							analysis.segments.map((segment, index) => (
								<span
									key={`${segment.value}-${index}`}
									className={segment.type === "match" ? "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100 px-0.5 rounded-none" : undefined}
								>
									{segment.value}
								</span>
							))
						)}
					</div>
				</div>

				<div className="overflow-x-auto rounded-none border">
					<table className="w-full text-sm">
						<thead className="bg-muted/60">
							<tr>
								<th className="px-3 py-2 text-left font-semibold">#</th>
								<th className="px-3 py-2 text-left font-semibold">Match</th>
								<th className="px-3 py-2 text-left font-semibold">Index</th>
								{groupCount > 0 && (
									<th className="px-3 py-2 text-left font-semibold">Groups</th>
								)}
							</tr>
						</thead>
						<tbody>
							{analysis.matches.length === 0 ? (
								<tr>
									<td colSpan={groupCount > 0 ? 4 : 3} className="px-3 py-4 text-center text-muted-foreground">
										No matches to display.
									</td>
								</tr>
							) : (
								analysis.matches.map((match, idx) => (
									<tr key={`${match.text}-${idx}`} className="border-t">
										<td className="px-3 py-2 align-top text-xs text-muted-foreground">{idx + 1}</td>
										<td className="px-3 py-2 font-mono break-all">{match.text || "(empty)"}</td>
										<td className="px-3 py-2 text-xs text-muted-foreground">{match.index}</td>
										{groupCount > 0 && (
											<td className="px-3 py-2 text-xs">
												{match.groups.length === 0 && Object.keys(match.rawGroups).length === 0 ? (
													<span className="text-muted-foreground">—</span>
												) : (
													<div className="space-y-1">
														{match.groups.map((value, groupIdx) => (
															<div key={`g-${groupIdx}`}>
																<span className="font-semibold">#{groupIdx + 1}:</span> {value ?? "(empty)"}
															</div>
														))}
														{Object.entries(match.rawGroups).map(([name, value]) => (
															<div key={name}>
																<span className="font-semibold">{name}:</span> {value ?? "(empty)"}
															</div>
														))}
													</div>
												)}
											</td>
										)}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</ToolPageLayout>
	);
}
