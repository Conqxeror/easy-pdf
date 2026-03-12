"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { copyToClipboard } from "@/lib/enhancedUX";
import { toast } from "sonner";

const SAMPLE_URL = "https://easy-pdf.dev/search?q=PDF tools &ref=hero banner";

const safeEncode = (value) => encodeURIComponent(value ?? "");
const safeDecode = (value) => decodeURIComponent((value ?? "").replace(/\+/g, "%20"));

export default function UrlEncoderClient() {
	const [plainValue, setPlainValue] = useState("");
	const [encodedValue, setEncodedValue] = useState("");
	const [error, setError] = useState("");

	const syncEncode = (value) => {
		setPlainValue(value);
		setEncodedValue(safeEncode(value));
	};

	const handleDecode = () => {
		try {
			const decoded = safeDecode(encodedValue);
			syncEncode(decoded);
			setError("");
			toast.success("Decoded string moved to the plain editor");
		} catch {
			setError("The encoded string is invalid. Make sure percent sequences are complete (e.g., %20).");
		}
	};

	const handleEncodeClick = () => {
		setEncodedValue(safeEncode(plainValue));
		setError("");
		toast.success("Plain text encoded");
	};

	const copy = async (value, label) => {
		if (!value) {
			toast.error("Nothing to copy yet");
			return;
		}
		await copyToClipboard(value, `${label} copied to clipboard`);
	};

	const toolName = "URL Encoder / Decoder";
	const toolDescription = "Safely encode query parameters or decode percent-encoded URLs without memorizing ASCII tables.";
	const steps = [
		"Paste raw text (or an entire URL) into the plain editor.",
		"Copy the encoded string or tweak individual parameters before sharing.",
		"Need to inspect an encoded link? Paste it into the encoded box and decode back instantly.",
	];

	const faqs = [
		{
			question: "Do you send my URLs to a server?",
			answer: "No. Encoding and decoding happen entirely inside your browser tab.",
		},
		{
			question: "Why do spaces turn into plus signs?",
			answer: "In query strings, spaces often become +. We treat + as a space automatically when decoding.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Encode or decode URLs, payloads, and query params in one privacy-first workspace."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "URL Encoder / Decoder", href: "/url-encoder" },
			]}
			currentTool="url-encoder"
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3">
					<Button size="sm" variant="secondary" onClick={() => syncEncode(SAMPLE_URL)}>
						Load sample URL
					</Button>
					<Button size="sm" variant="outline" onClick={() => { setPlainValue(""); setEncodedValue(""); setError(""); }}>
						Clear both editors
					</Button>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Plain text</h3>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleEncodeClick}>Encode</Button>
								<Button size="sm" variant="outline" onClick={() => copy(plainValue, "Plain text")}>Copy</Button>
							</div>
						</div>
						<Textarea
							value={plainValue}
							onChange={(event) => syncEncode(event.target.value)}
							placeholder="Paste anything that needs to be URL-safe"
							className="font-mono min-h-[200px]"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Encoded string</h3>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleDecode}>Decode to plain</Button>
								<Button size="sm" variant="outline" onClick={() => copy(encodedValue, "Encoded string")}>
									Copy
								</Button>
							</div>
						</div>
						<Textarea
							value={encodedValue}
							onChange={(event) => setEncodedValue(event.target.value)}
							placeholder="Paste encoded links or JWT payloads here"
							className="font-mono min-h-[200px]"
						/>
					</div>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertTitle>Unable to decode</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
			</div>
		</ToolPageLayout>
	);
}
