"use client";

import React, { useState, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Lock, Unlock, Image as ImageIcon } from "lucide-react";

export default function SteganographyClient() {
  const [mode, setMode] = useState("encode");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [resultImage, setResultImage] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      setResultImage(null);
      setDecodedMessage("");
      setError("");
    }
  };

  const encode = () => {
    if (!image || !message) return;
    setError("");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert message to binary string
    let binaryMessage = "";
    for (let i = 0; i < message.length; i++) {
      let binaryChar = message.charCodeAt(i).toString(2).padStart(8, "0");
      binaryMessage += binaryChar;
    }
    // Add null terminator
    binaryMessage += "00000000";

    if (binaryMessage.length > data.length / 4) {
      setError("Message is too long for this image. Use a larger PNG or shorten the message.");
      return;
    }

    for (let i = 0; i < binaryMessage.length; i++) {
      const bit = parseInt(binaryMessage[i]);
      // Modify the least significant bit of the red channel (every 4th byte is R, G, B, A)
      // Actually let's use R, G, B sequentially to pack more data
      // data[i * 4] is R, data[i * 4 + 1] is G, data[i * 4 + 2] is B

      // Let's just use the R channel for simplicity in this demo, or spread across RGB
      // Using just R channel: index = i * 4

      // Clear LSB
      data[i * 4] = (data[i * 4] & 0xFE) | bit;
    }

    ctx.putImageData(imageData, 0, 0);
    setResultImage(canvas.toDataURL("image/png"));
  };

  const decode = () => {
    if (!image) return;
    setError("");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let currentByte = "";
    let decoded = "";

    for (let i = 0; i < data.length; i += 4) {
      const bit = data[i] & 1;
      currentByte += bit;

      if (currentByte.length === 8) {
        if (currentByte === "00000000") break; // Null terminator
        decoded += String.fromCharCode(parseInt(currentByte, 2));
        currentByte = "";
      }
    }

    setDecodedMessage(decoded);
  };

  return (
    <ToolPageLayout
      title="Steganography"
      subtitle="Hide secret messages inside images."
      toolName="Steganography"
      toolDescription="Encode hidden text messages into PNG images using LSB (Least Significant Bit) steganography. The changes are invisible to the human eye."
      currentTool="steganography"
      steps={[
        "Upload an image (PNG recommended).",
        "Enter your secret message.",
        "Download the encoded image.",
        "To decode, upload the encoded image and click Decode."
      ]}
      faqs={[
        {
          question: "Will the image look different?",
          answer: "No, the changes are so subtle that the human eye cannot detect them."
        },
        {
          question: "Does it work with JPG?",
          answer: "No, JPG compression destroys the hidden data. Please use PNG."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Steganography", href: "/steganography" }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="encode">Hide Message (Encode)</TabsTrigger>
            <TabsTrigger value="decode">Read Message (Decode)</TabsTrigger>
          </TabsList>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="border-2 border-dashed p-8 text-center hover:bg-muted/50 transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="max-h-[300px] mx-auto shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-10 h-10" />
                    <p>Click to upload image</p>
                  </div>
                )}
              </div>

              {mode === "encode" ? (
                <div className="space-y-4">
                  <Label>Secret Message</Label>
                  <Textarea
                    placeholder="Enter text to hide..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button onClick={encode} disabled={!image || !message} className="w-full">
                    <Lock className="w-4 h-4 mr-2" /> Encode Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={decode} disabled={!image} className="w-full">
                    <Unlock className="w-4 h-4 mr-2" /> Decode Message
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Label>Result</Label>
              <div className="h-full min-h-[300px] border rounded-none bg-muted/30 p-6 flex items-center justify-center">
                {mode === "encode" ? (
                  resultImage ? (
                    <div className="text-center space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resultImage} alt="Encoded" className="max-h-[300px] mx-auto rounded-none shadow-sm" />
                      <Button asChild variant="outline">
                        <a href={resultImage} download="secret-image.png">
                          <Download className="w-4 h-4 mr-2" /> Download Image
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Save as PNG to keep the message intact.
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                      <p>Encoded image will appear here</p>
                    </div>
                  )
                ) : (
                  decodedMessage ? (
                    <div className="w-full h-full bg-card p-4 rounded-none border shadow-sm overflow-auto">
                      <p className="font-mono whitespace-pre-wrap">{decodedMessage}</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                      <p>Decoded message will appear here</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Tabs>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolPageLayout>
  );
}
