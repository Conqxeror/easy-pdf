"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle } from "lucide-react";

/**
 * ToolActions
 * A lightweight, consistent action bar for tool pages.
 * Props:
 * - primary: { label, onClick, href, disabled }
 * - secondary: { label, onClick, href }
 * - download: { href, label }
 * - isProcessing: boolean
 */
export default function ToolActions({ primary = {}, secondary = {}, download = null, isProcessing = false }) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center gap-3">
      <div className="flex-1">
        {primary && (
          primary.href ? (
            <a href={primary.href} className="w-full">
              <Button size="lg" className="w-full" disabled={primary.disabled || isProcessing}>
                {primary.label}
              </Button>
            </a>
          ) : (
            <Button size="lg" className="w-full" onClick={primary.onClick} disabled={primary.disabled || isProcessing}>
              {primary.label}
            </Button>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        {download && download.href && (
          <a href={download.href} download className="inline-flex items-center">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>{download.label || "Download"}</span>
            </Button>
          </a>
        )}

        {secondary && (secondary.href || secondary.onClick) && (
          secondary.href ? (
            <a href={secondary.href} className="inline-flex">
              <Button variant="ghost" size="lg" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>{secondary.label}</span>
              </Button>
            </a>
          ) : (
            <Button variant="ghost" size="lg" onClick={secondary.onClick} className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>{secondary.label}</span>
            </Button>
          )
        )}
      </div>
    </div>
  );
}
