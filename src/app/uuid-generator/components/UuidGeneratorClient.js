"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { copyToClipboard, sanitizeFileName, safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from "uuid";

const VERSION_OPTIONS = [
	{
		value: "v4",
		label: "UUID v4",
		description: "Random RFC 4122 (crypto.randomUUID)",
	},
	{
		value: "v7",
		label: "UUID v7",
		description: "Time-ordered (great for databases)",
	},
	{
		value: "v1",
		label: "UUID v1",
		description: "Timestamp + node identifier",
	},
];

const MAX_COUNT = 50;
const HISTORY_LIMIT = 200;

const generatorMap = {
	v1: () => uuidv1(),
	v4: () => (crypto?.randomUUID ? crypto.randomUUID() : uuidv4()),
	v7: () => (typeof uuidv7 === "function" ? uuidv7() : uuidv4()),
};

export default function UuidGeneratorClient() {
	const [version, setVersion] = useState("v4");
	const [count, setCount] = useState(10);
	const [uuids, setUuids] = useState([]);
	const [history, setHistory] = useState([]);
	const [lastGenerated, setLastGenerated] = useState(null);
	const [error, setError] = useState("");

	const generate = useCallback(
		(overrideCount) => {
			setError("");
			const qty = Math.min(Math.max(Number(overrideCount ?? count) || 1, 1), MAX_COUNT);
			try {
				const generator = generatorMap[version];
				const next = Array.from({ length: qty }, () => generator());
				setUuids(next);
				setHistory((prev) => {
					const stamped = next.map((value) => ({ value, version, createdAt: Date.now() }));
					return [...stamped, ...prev].slice(0, HISTORY_LIMIT);
				});
				setLastGenerated(Date.now());
				setCount(qty);
				toast.success(`Generated ${qty} ${version.toUpperCase()} IDs`);
			} catch {
				toast.error("Unable to generate UUIDs. Please retry or refresh.");
				setError("Unable to generate UUIDs. Please retry or refresh.");
			}
		},
		[version, count]
	);

	useEffect(() => {
		generate(count);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stats = useMemo(() => {
		const total = history.length;
		const byVersion = history.reduce(
			(acc, entry) => {
				acc[entry.version] += 1;
				return acc;
			},
			{ v1: 0, v4: 0, v7: 0 }
		);
		return { total, byVersion };
	}, [history]);

	const copyList = async () => {
		if (!uuids.length) {
			toast.error("Generate UUIDs first");
			return;
		}
		await copyToClipboard(uuids.join("\n"), "UUID list copied");
	};

	const downloadList = () => {
		if (!uuids.length) return;
		const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
		const link = document.createElement("a");
		const url = safeCreateObjectURL(blob);
		link.href = url;
		link.download = `${sanitizeFileName(`uuid-${version}`)}.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setTimeout(() => safeRevokeObjectURL(url), 300);
	};

	const toolName = "UUID Generator";
	const toolDescription = "Create RFC-compliant v1, v4, or v7 UUIDs entirely in your browser with batch exports and quick copy actions.";
	const steps = [
		"Pick the UUID version that matches your system requirements (random, time-ordered, etc.).",
		"Choose how many IDs to generate (up to 50 at a time) and click Generate UUIDs.",
		"Copy the list to your clipboard or download a .txt file for import scripts.",
	];
	const faqs = [
		{
			question: "Do you ever upload the UUIDs?",
			answer: "Never. All randomness and generation happens locally using Web Crypto and the uuid library.",
		},
		{
			question: "Why is the batch size limited?",
			answer: "Generating more than ~50 IDs per click can be unwieldy to review, so we cap it for usability. Run multiple batches if you need more.",
		},
		{
			question: "What is the difference between v4 and v7?",
			answer: "v4 is purely random while v7 includes sortable timestamps, which many databases prefer for clustering.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Generate secure UUIDs (v1, v4, v7) with batch copy/download actions—all within your browser."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "UUID Generator", href: "/uuid-generator" },
			]}
			currentTool="uuid-generator"
		>
			<div className="space-y-6">
				{error && (
					<Alert variant="destructive">
						<AlertTitle>Generation error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<section className="grid gap-4 md:grid-cols-3">
					{VERSION_OPTIONS.map((option) => (
						<button
							key={option.value}
							className={`border p-4 text-left transition ${version === option.value
								? "border-secondary bg-primary/5"
								: "border-border hover:border-secondary/40"
								}`}
							onClick={() => setVersion(option.value)}
						>
							<p className="font-semibold">{option.label}</p>
							<p className="text-sm text-muted-foreground">{option.description}</p>
						</button>
					))}
				</section>

				<div className="border p-4 flex flex-col gap-4 lg:flex-row lg:items-end">
					<div className="flex-1 space-y-2">
						<Label htmlFor="uuid-count">How many UUIDs?</Label>
						<Input
							id="uuid-count"
							type="number"
							min={1}
							max={MAX_COUNT}
							value={count}
							onChange={(event) => setCount(Math.min(Math.max(parseInt(event.target.value, 10) || 1, 1), MAX_COUNT))}
						/>
						<p className="text-xs text-muted-foreground">Up to {MAX_COUNT} at a time. Current selection: {count}.</p>
					</div>
					<div className="flex gap-3">
						<Button onClick={() => generate(count)}>Generate UUIDs</Button>
						<Button variant="outline" onClick={() => setHistory([])}>
							Clear history
						</Button>
					</div>
				</div>

				<section className="border bg-card p-4 space-y-3">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<div>
							<h3 className="font-semibold">Latest batch</h3>
							<p className="text-sm text-muted-foreground">
								{lastGenerated ? `Generated ${uuids.length} IDs · ${new Date(lastGenerated).toLocaleTimeString()}` : "Run the generator to start"}
							</p>
						</div>
						<div className="flex gap-2">
							<Button size="sm" onClick={copyList} disabled={!uuids.length}>
								Copy list
							</Button>
							<Button size="sm" variant="outline" onClick={downloadList} disabled={!uuids.length}>
								Download .txt
							</Button>
						</div>
					</div>
					<div className="rounded-none border bg-background p-4 font-mono text-sm max-h-[260px] overflow-auto space-y-2">
						{uuids.length === 0 ? (
							<p className="text-muted-foreground">No UUIDs yet. Generate a batch to view them here.</p>
						) : (
							uuids.map((value, idx) => (
								<div key={value} className="flex items-center gap-3">
									<span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
									<span>{value}</span>
									<Button
										size="sm"
										variant="ghost"
										className="ml-auto"
										onClick={() => copyToClipboard(value, "UUID copied")}
									>
										Copy
									</Button>
								</div>
							))
						)}
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-4">
					<StatCard label="All-time generated" value={stats.total} />
					<StatCard label="v4 batch" value={stats.byVersion.v4} />
					<StatCard label="v7 batch" value={stats.byVersion.v7} />
					<StatCard label="v1 batch" value={stats.byVersion.v1} />
				</section>

				<section className="border p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">History (latest first)</h3>
						<p className="text-xs text-muted-foreground">Capped at {HISTORY_LIMIT} entries</p>
					</div>
					<div className="max-h-[220px] overflow-auto">
						{history.length === 0 ? (
							<p className="text-muted-foreground text-sm">No history recorded yet.</p>
						) : (
							<ul className="space-y-2 text-sm font-mono">
								{history.map((entry) => (
									<li key={`${entry.value}-${entry.createdAt}`} className="flex gap-3">
										<span className="text-xs text-muted-foreground w-16">
											{new Date(entry.createdAt).toLocaleTimeString()}
										</span>
										<span className="rounded-none bg-muted px-2 py-0.5 text-xs uppercase tracking-wide">{entry.version}</span>
										<span className="break-all">{entry.value}</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</section>
			</div>
		</ToolPageLayout>
	);
}

function StatCard({ label, value }) {
	return (
		<div className="border bg-card p-4">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="text-2xl font-semibold">{value}</p>
		</div>
	);
}
