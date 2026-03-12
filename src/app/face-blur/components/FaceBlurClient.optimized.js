"use client";
/* eslint-disable @next/next/no-assign-module-variable */

import React, { useState, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, AlertCircle, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// ✅ OPTIMIZATION: Lazy load MediaPipe library
// Only loaded when user starts processing
let mediaPipeLoaded = false;
let FaceDetectorImport = null;
let FilesetResolverImport = null;

const loadMediaPipe = async () => {
	if (mediaPipeLoaded) {
		return { FaceDetector: FaceDetectorImport, FilesetResolver: FilesetResolverImport };
	}

	const module = await import("@mediapipe/tasks-vision");
	FaceDetectorImport = module.FaceDetector;
	FilesetResolverImport = module.FilesetResolver;
	mediaPipeLoaded = true;

	return { FaceDetector: FaceDetectorImport, FilesetResolver: FilesetResolverImport };
};

export default function FaceBlurClient() {
	const [image, setImage] = useState(null);
	const [processedImage, setProcessedImage] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isLoadingModel, setIsLoadingModel] = useState(false);
	const [error, setError] = useState(null);
	const [faceDetector, setFaceDetector] = useState(null);
	const canvasRef = useRef(null);

	// ✅ OPTIMIZATION: Load model only when user uploads first image
	const loadModel = async () => {
		if (faceDetector) return faceDetector;

		setIsLoadingModel(true);
		setError(null);

		try {
			const { FaceDetector, FilesetResolver } = await loadMediaPipe();

			const vision = await FilesetResolver.forVisionTasks(
				"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
			);

			const detector = await FaceDetector.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
					delegate: "GPU"
				},
				runningMode: "IMAGE"
			});

			setFaceDetector(detector);
			setIsLoadingModel(false);
			return detector;
		} catch (err) {
			setError("Failed to load AI model. Please refresh the page and try again.");
			setIsLoadingModel(false);
			throw err;
		}
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const url = URL.createObjectURL(file);
		setImage(url);
		setProcessedImage(null);
		setError(null);

		// ✅ OPTIMIZATION: Load model on demand
		try {
			let detector = faceDetector;
			if (!detector) {
				detector = await loadModel();
			}

			if (detector) {
				await processImage(url, detector);
			}
		} catch {
			toast.error("Failed to process image");
		}
	};

	const processImage = async (imageUrl, detector) => {
		if (!detector) {
			setError("AI model not loaded. Please try again.");
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = imageUrl;
			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
			});

			const detections = detector.detect(img);

			const canvas = canvasRef.current;
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");

			// Draw original image
			ctx.drawImage(img, 0, 0);

			if (detections.detections.length === 0) {
				setError("No faces detected in the image. Try a different photo with visible faces.");
				setIsProcessing(false);
				return;
			}

			// Blur faces
			detections.detections.forEach((detection) => {
				const { originX, originY, width, height } = detection.boundingBox;

				// Extract face region
				const faceData = ctx.getImageData(originX, originY, width, height);

				// Apply pixelation blur
				const pixelSize = Math.max(5, Math.floor(width / 10));

				for (let y = 0; y < height; y += pixelSize) {
					for (let x = 0; x < width; x += pixelSize) {
						// Get average color of the block
						let r = 0, g = 0, b = 0, count = 0;

						for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
							for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
								const i = ((y + dy) * width + (x + dx)) * 4;
								r += faceData.data[i];
								g += faceData.data[i + 1];
								b += faceData.data[i + 2];
								count++;
							}
						}

						r = Math.floor(r / count);
						g = Math.floor(g / count);
						b = Math.floor(b / count);

						// Fill block
						ctx.fillStyle = `rgb(${r},${g},${b})`;
						ctx.fillRect(originX + x, originY + y, pixelSize, pixelSize);
					}
				}
			});

			setProcessedImage(canvas.toDataURL("image/png"));
		} catch (err) {
			setError(`Failed to process image: ${err.message}`);
		} finally {
			setIsProcessing(false);
		}
	};

	const downloadImage = () => {
		if (!processedImage) return;
		const link = document.createElement("a");
		link.download = "blurred-faces.png";
		link.href = processedImage;
		link.click();
	};

	return (
		<ToolPageLayout
			title="Blur Faces"
			subtitle="Automatically detect and blur faces in photos with AI."
			toolName="Face Blur"
			toolDescription="Protect privacy by automatically blurring faces in your images using AI. Processing happens entirely in your browser - your photos never leave your device."
			currentTool="face-blur"
			steps={[
				"Upload an image containing faces.",
				"AI automatically detects all faces (first upload loads the AI model).",
				"Faces are automatically blurred with pixelation effect.",
				"Download the privacy-protected image."
			]}
			faqs={[
				{
					question: "Is my photo uploaded to a server?",
					answer: "No, all face detection and blurring happens locally in your browser. Your photos never leave your device, ensuring complete privacy."
				},
				{
					question: "What image formats are supported?",
					answer: "The tool supports common image formats including JPG, PNG, and WebP. For best results, use high-resolution photos with clear, visible faces."
				},
				{
					question: "How accurate is the face detection?",
					answer: "The AI model can detect most clearly visible faces facing the camera. Detection accuracy may be lower for profile views, partially obscured faces, or very small faces in the image."
				},
				{
					question: "Can I adjust the blur intensity?",
					answer: "In this version, blur intensity is set automatically based on the detected face size so the result stays fast and consistent across the image."
				}
			]}
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Face Blur", href: "/face-blur" }
			]}
		>
			<div className="grid gap-8 lg:grid-cols-2">
				{/* Input */}
				<div className="space-y-6">
					<div className="border-2 border-dashed rounded-none p-8 text-center bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden hover:bg-muted/20 transition-colors">
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
							disabled={isProcessing || isLoadingModel}
							aria-label="Upload image"
						/>
						<div className="flex flex-col items-center gap-4 text-muted-foreground">
							<div className="p-4 rounded-none bg-muted">
								<Upload className="w-8 h-8" />
							</div>
							<div className="space-y-1">
								<p className="font-medium text-foreground">Click or drag image to upload</p>
								<p className="text-sm">Supports JPG, PNG, WebP</p>
								{isLoadingModel && <p className="text-xs text-amber-500 flex items-center gap-2 justify-center">
									<Loader2 className="w-3 h-3 animate-spin" />
									Loading AI model... (first time only)
								</p>}
							</div>
						</div>
					</div>

					{image && (
						<div className="relative rounded-none overflow-hidden border bg-muted/50 aspect-video flex items-center justify-center">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={image} alt="Original" className="max-h-full max-w-full object-contain" />
						</div>
					)}
				</div>

				{/* Output */}
				<div className="space-y-6">
					<div className="border rounded-none p-8 text-center bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
						{isProcessing || isLoadingModel ? (
							<div className="flex flex-col items-center gap-4">
								<Loader2 className="w-10 h-10 animate-spin text-primary" />
								<p className="text-muted-foreground">
									{isLoadingModel ? "Loading AI model..." : "Detecting and blurring faces..."}
								</p>
							</div>
						) : error ? (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Note</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						) : processedImage ? (
							<div className="relative w-full h-full flex items-center justify-center">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={processedImage} alt="Processed with blurred faces" className="max-h-full max-w-full object-contain" />
							</div>
						) : (
							<div className="flex flex-col items-center gap-4 text-muted-foreground">
								<EyeOff className="w-10 h-10 opacity-20" />
								<p>Image with blurred faces will appear here</p>
							</div>
						)}
					</div>

					<Button
						size="lg"
						className="w-full"
						onClick={downloadImage}
						disabled={!processedImage}
					>
						<Download className="w-4 h-4 mr-2" /> Download Image
					</Button>
				</div>
			</div>
			<canvas ref={canvasRef} className="hidden" aria-hidden="true" />
		</ToolPageLayout>
	);
}
