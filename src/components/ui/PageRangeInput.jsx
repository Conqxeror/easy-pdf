import React from "react";
import { Input } from "@/components/ui/input"; // Import the ShadCN Input component

export default function PageRangeInput({
  startPage,
  endPage,
  setStartPage,
  setEndPage,
  totalPages,
  className = "",
}) {
  return (
    <div className={`flex gap-2 mb-4 ${className}`}>
      <Input
        type="number"
        min={1}
        max={totalPages || undefined}
        placeholder="Start Page"
        value={startPage}
        onChange={(e) => setStartPage(e.target.value)}
        aria-label="Start Page"
        // ShadCN Input component handles much of the styling internally
        // Custom classes for width and margin can still be applied
        className="w-28"
      />
      <Input
        type="number"
        min={1}
        max={totalPages || undefined}
        placeholder="End Page"
        value={endPage}
        onChange={(e) => setEndPage(e.target.value)}
        aria-label="End Page"
        // ShadCN Input component handles much of the styling internally
        // Custom classes for width and margin can still be applied
        className="w-28"
      />
      {totalPages && (
        <span className="text-sm text-gray-400 self-center">
          / {totalPages} pages
        </span>
      )}
    </div>
  );
}
