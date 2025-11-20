"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function MarkdownPreviewerClient() {
  const [input, setInput] = useState("# Hello World\n\nStart typing markdown here...");
  const [html, setHtml] = useState("");

  useEffect(() => {
    const rawHtml = marked.parse(input);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    setHtml(cleanHtml);
  }, [input]);

  return (
    <ToolPageLayout
      title="Markdown Previewer"
      subtitle="Real-time Markdown to HTML preview."
      toolName="Markdown Previewer"
      toolDescription="Write and preview Markdown content in real-time. Useful for README files, documentation, and blog posts."
      currentTool="markdown-previewer"
      steps={[
        "Type your Markdown in the left pane.",
        "See the rendered HTML result instantly in the right pane."
      ]}
      faqs={[
        {
          question: "Is GitHub Flavored Markdown supported?",
          answer: "Yes, we use the 'marked' library which supports GFM."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Markdown Previewer", href: "/markdown-previewer" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2 h-[600px]">
        <div className="flex flex-col gap-2 h-full">
          <Label>Markdown Input</Label>
          <Textarea
            className="flex-1 font-mono text-sm resize-none p-4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 h-full">
          <Label>Preview</Label>
          <div
            className="flex-1 border rounded-none p-6 overflow-auto prose prose-sm max-w-none dark:prose-invert bg-background dark:bg-background"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
