"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { jwtDecode } from "jwt-decode";
import { Code2, Clock, ShieldCheck } from "lucide-react";

export default function JwtDecoderClient() {
  const [token, setToken] = useState("");

  let header = null;
  let payload = null;
  let error = "";

  if (token.trim()) {
    try {
      header = jwtDecode(token, { header: true });
      payload = jwtDecode(token);
    } catch {
      error = "Invalid JWT format.";
    }
  }

  const formatJson = (obj) => JSON.stringify(obj, null, 2);

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <ToolPageLayout
      title="JWT Decoder"
      subtitle="Decode and inspect JSON Web Tokens."
      toolName="JWT Decoder"
      toolDescription="Decode JSON Web Tokens (JWT) to view their header and payload claims. Debug authentication issues and inspect token contents securely in your browser."
      currentTool="jwt-decoder"
      steps={[
        "Paste your JWT string into the input box.",
        "View the decoded Header and Payload instantly.",
        "Check expiration times and other claims."
      ]}
      faqs={[
        {
          question: "Is my token sent to a server?",
          answer: "No. Decoding happens entirely in your browser using JavaScript."
        },
        {
          question: "Does this verify the signature?",
          answer: "No, this tool only decodes the token to show its contents. It does not verify the cryptographic signature."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "JWT Decoder", href: "/jwt-decoder" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Label>Encoded Token</Label>
          <Textarea
            placeholder="Paste JWT here (eyJ...)"
            className="h-[400px] font-mono text-sm break-all"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Header
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-none overflow-auto text-xs font-mono h-[150px]">
                {header ? formatJson(header) : "// Header will appear here"}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Payload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-none overflow-auto text-xs font-mono h-[250px]">
                {payload ? formatJson(payload) : "// Payload will appear here"}
              </pre>
            </CardContent>
          </Card>

          {payload && (payload.iat || payload.exp) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {payload.iat && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued At (iat):</span>
                    <span className="font-mono">{formatTime(payload.iat)}</span>
                  </div>
                )}
                {payload.exp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires At (exp):</span>
                    <span className="font-mono">{formatTime(payload.exp)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
