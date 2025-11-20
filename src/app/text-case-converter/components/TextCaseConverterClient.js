"use client";

import React, { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/enhancedUX";
import { toast } from "sonner";

const SAMPLE_TEXT = "Meet me at 10:00 AM outside Gate 5. Bring the PDF drafts.";

const splitIntoWords = (value) => {
	if (!value) return [];
	return value
		.replace(/[_-]+/g, " ")
		.replace(/([a-z\d])([A-Z])/g, "$1 $2")
		.replace(/[^\p{L}\p{N}\s]+/gu, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
};

const toCamelCase = (value) => {
	const words = splitIntoWords(value.toLowerCase());
	if (!words.length) return "";
	return words
		.map((word, index) =>
			index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
		)
		.join("");
};

const toPascalCase = (value) => {
	const words = splitIntoWords(value);
	return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
};

const toSnakeCase = (value) => splitIntoWords(value).map((word) => word.toLowerCase()).join("_");
const toKebabCase = (value) => splitIntoWords(value).map((word) => word.toLowerCase()).join("-");
const toTitleCase = (value) =>
	splitIntoWords(value)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
const toSentenceCase = (value) => {
	if (!value.trim()) return "";
	const trimmed = value.trim();
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
const toConstantCase = (value) => splitIntoWords(value).map((word) => word.toUpperCase()).join("_");

const TRANSFORMS = [
	{
		key: "upper",
		label: "Uppercase",
		description: "Turns everything into ALL CAPS for emphasis or shouting in style.",
		transform: (value) => value.toUpperCase(),
	},
	{
		key: "lower",
		label: "Lowercase",
		description: "Great for slugs and case-insensitive comparisons.",
		transform: (value) => value.toLowerCase(),
	},
	{
		key: "sentence",
		label: "Sentence case",
		description: "Capitalizes only the first letter and softens the rest.",
		transform: toSentenceCase,
	},
	{
		key: "title",
		label: "Title Case",
		description: "Perfect for blog titles and slide headlines.",
		transform: toTitleCase,
	},
	{
		key: "camel",
		label: "camelCase",
		description: "JavaScript-friendly naming for props and variables.",
		transform: toCamelCase,
	},
	{
		key: "pascal",
		label: "PascalCase",
		description: "Component and class names stay consistent with this format.",
		transform: toPascalCase,
	},
	{
		key: "snake",
		label: "snake_case",
		description: "Underscore-delimited identifiers popular in Python-land.",
		transform: toSnakeCase,
	},
	{
		key: "kebab",
		label: "kebab-case",
		description: "SEO-friendly URLs and Tailwind utility names live here.",
		transform: toKebabCase,
	},
	{
		key: "constant",
		label: "CONSTANT_CASE",
		description: "Uppercase snake case for environment variables and enums.",
		transform: toConstantCase,
	},
];

export default function TextCaseConverterClient() {
	const [inputText, setInputText] = useState("");

	const derived = useMemo(
		() =>
			TRANSFORMS.map((config) => ({
				...config,
				value: config.transform(inputText),
			})),
		[inputText]
	);

	const stats = useMemo(() => ({
		characters: inputText.length,
		words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
		lines: inputText ? inputText.split(/\n/).length : 0,
	}), [inputText]);

	const handleCopy = async (value, label) => {
		if (!value) {
			toast.error("Nothing to copy yet");
			return;
		}
		await copyToClipboard(value, `${label} copied to clipboard`);
	};

	const applyTransform = (value) => {
		setInputText(value);
		toast.success("Transformation applied to the editor");
	};

	const toolName = "Text Case Converter";
	const toolDescription = "Flip text between uppercase, lowercase, camelCase, snake_case, and more without leaving your browser. Perfect for content writers and developers working on tight deadlines.";

	const steps = [
		"Paste or type the text you want to transform.",
		"Pick the target casing style from the cards below.",
		"Copy the transformed result or apply it back to the editor for further tweaks.",
	];

	const faqs = [
		{
			question: "Does this change my original text?",
			answer: "The input area stays intact until you choose \"Apply to editor\" on a specific casing card.",
		},
		{
			question: "Will it handle multilingual content?",
			answer: "Yes. We rely on Unicode-aware splitting so accented characters remain untouched.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Convert any snippet into the exact casing style you need in seconds."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Text Case Converter", href: "/text-case-converter" },
			]}
			currentTool="text-case-converter"
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3">
					<Button variant="secondary" size="sm" onClick={() => setInputText(SAMPLE_TEXT)}>
						Load sample text
					</Button>
					<Button variant="outline" size="sm" onClick={() => setInputText("")}>Clear editor</Button>
					<div className="flex items-center gap-3 text-xs text-foreground dark:text-foreground">
						<span>Characters: {stats.characters}</span>
						<span>Words: {stats.words}</span>
						<span>Lines: {stats.lines}</span>
					</div>
				</div>

				<Textarea
					value={inputText}
					onChange={(event) => setInputText(event.target.value)}
					placeholder="Paste any text, slug, or identifier. We'll take it from there."
					rows={8}
					className="font-mono"
				/>

				<div className="grid gap-4 md:grid-cols-2">
					{derived.map((item) => (
						<Card key={item.key} className="border-border bg-background">
							<CardHeader>
								<CardTitle className="text-lg text-foreground">{item.label}</CardTitle>
								<CardDescription className="text-foreground">{item.description}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Textarea value={item.value} readOnly className="font-mono min-h-[120px]" />
								<div className="flex flex-wrap gap-3">
									<Button size="sm" onClick={() => handleCopy(item.value, item.label)}>
										Copy
									</Button>
									<Button variant="outline" size="sm" onClick={() => applyTransform(item.value)}>
										Apply to editor
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</ToolPageLayout>
	);
}
