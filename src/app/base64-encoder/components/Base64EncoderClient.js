"use client";

import React, { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { copyToClipboard } from "@/lib/enhancedUX";
import { toast } from "sonner";

const SAMPLE_TEXT = "share-token: 7b2c1a68-6de1-4351-b427-4c8b675af68a";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB guard for inline encoding

const encodeString = (value) => {
	if (!value) return "";
	const encoder = new TextEncoder();
	const bytes = encoder.encode(value);
	let binary = "";
	bytes.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return btoa(binary);
};

const decodeString = (value) => {
	if (!value) return "";
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	const decoder = new TextDecoder();
	return decoder.decode(bytes);
};

const formatFileSize = (bytes) => {
	if (!bytes && bytes !== 0) return "—";
	if (bytes === 0) return "0 Bytes";
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export default function Base64EncoderClient() {
	const [plainValue, setPlainValue] = useState("");
	const [encodedValue, setEncodedValue] = useState("");
	const [error, setError] = useState("");
	const [fileMeta, setFileMeta] = useState(null);
	const [isEncodingFile, setIsEncodingFile] = useState(false);

	const stats = useMemo(
		() => ({
			plainChars: plainValue.length,
			encodedChars: encodedValue.length,
		}),
		[plainValue, encodedValue]
	);

	const handleEncode = () => {
		try {
			const result = encodeString(plainValue);
			setEncodedValue(result);
			setError("");
			toast.success("Plain text encoded to Base64");
		} catch {
			setError("Unable to encode. Make sure the text is valid UTF-8.");
		}
	};

	const handleDecode = () => {
		try {
			const result = decodeString(encodedValue.trim());
			setPlainValue(result);
			setError("");
			toast.success("Base64 decoded to plain text");
		} catch {
			setError("That string is not valid Base64. Remove whitespace or ensure padding (\"=\") is intact.");
		}
	};

	const handleCopy = async (value, label) => {
		if (!value) {
			toast.error("Nothing to copy yet");
			return;
		}
		await copyToClipboard(value, `${label} copied to clipboard`);
	};

	const handleFiles = (files) => {
		setError("");
		if (!files || files.length === 0) {
			setFileMeta(null);
			return;
		}
		const file = files[0];
		if (file.size > MAX_FILE_SIZE) {
			setError("File too large for inline Base64 encoding. Please pick something under 15MB.");
			return;
		}
		setIsEncodingFile(true);
		const reader = new FileReader();
		reader.onload = () => {
			setIsEncodingFile(false);
			const result = reader.result;
			if (typeof result === "string") {
				const [, base64Payload] = result.split(",");
				setEncodedValue(base64Payload || "");
				setPlainValue("");
				setFileMeta({ name: file.name, size: file.size, type: file.type || "application/octet-stream" });
				toast.success(`Encoded ${file.name} to Base64`);
			}
		};
		reader.onerror = () => {
			setIsEncodingFile(false);
			setError("Failed to read the file. Please try again.");
		};
		reader.readAsDataURL(file);
	};

	const clearAll = () => {
		setPlainValue("");
		setEncodedValue("");
		setError("");
		setFileMeta(null);
	};

	const toolName = "Base64 Encoder / Decoder";
	const toolDescription = "Convert text or small files to Base64 (and back) entirely inside your browser. Perfect for inline payloads, data URLs, and quick debugging.";
	const steps = [
		"Paste your text or drop a file into the uploader.",
		"Click Encode to produce a Base64 payload, or Decode to restore plain text.",
		"Copy the result or keep editing without leaving the page.",
	];
	const faqs = [
		{
			question: "What file types are supported?",
			answer: "Any file under 15MB works. We read it as a Data URL and surface the Base64 payload for you to reuse.",
		},
		{
			question: "Does the conversion happen locally?",
			answer: "Yes. Encoding and decoding run entirely inside your browser, so your data never leaves the device.",
		},
	];

	return (
		<ToolPageLayout
			title={toolName}
			subtitle="Encode or decode Base64 strings without leaving your browser or leaking data."
			toolName={toolName}
			toolDescription={toolDescription}
			steps={steps}
			faqs={faqs}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Base64 Encoder", href: "/base64-encoder" },
			]}
			currentTool="base64-encoder"
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3 text-xs text-foreground dark:text-foreground">
					<Button size="sm" variant="secondary" onClick={() => setPlainValue(SAMPLE_TEXT)}>
						Load sample string
					</Button>
					<Button size="sm" variant="outline" onClick={clearAll}>
						Clear all
					</Button>
					<span>Plain chars: {stats.plainChars}</span>
					<span>Encoded chars: {stats.encodedChars}</span>
				</div>

				<FileDropzone
					accept="*/*"
					multiple={false}
					onFiles={handleFiles}
					error={error}
					setError={setError}
					label="Drop a file to encode"
					description="We encode files entirely in-browser. Recommended max size: 15MB."
					maxSize={MAX_FILE_SIZE}
					isLoading={isEncodingFile}
				/>

				{fileMeta && (
					<div className="rounded-none border border-border bg-background/60 p-4 text-sm text-foreground">
						<p className="font-semibold">Last encoded file:</p>
						<p>{fileMeta.name}</p>
						<p>{fileMeta.type} • {formatFileSize(fileMeta.size)}</p>
					</div>
				)}

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Plain text</h3>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleEncode}>Encode</Button>
								<Button size="sm" variant="outline" onClick={() => handleCopy(plainValue, "Plain text")}>
									Copy
								</Button>
							</div>
						</div>
						<Textarea
							value={plainValue}
							onChange={(event) => setPlainValue(event.target.value)}
							placeholder="Paste any UTF-8 text here"
							className="font-mono min-h-[220px]"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Base64 string</h3>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleDecode}>Decode</Button>
								<Button size="sm" variant="outline" onClick={() => handleCopy(encodedValue, "Base64 string")}>Copy</Button>
							</div>
						</div>
						<Textarea
							value={encodedValue}
							onChange={(event) => setEncodedValue(event.target.value)}
							placeholder="Paste Base64 payloads or data URLs here"
							className="font-mono min-h-[220px]"
						/>
					</div>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertTitle>Something went wrong</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
			</div>
		</ToolPageLayout>
	);
}
