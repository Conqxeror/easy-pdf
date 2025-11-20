import React from "react";
import { Input } from "@/components/ui/input";

export default function PageRangeInput({
  startPage,
  endPage,
  setStartPage,
  setEndPage,
  totalPages,
  className = "",
}) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-foreground text-sm">From</label>
        <Input
          type="number"
          min={1}
          max={totalPages || undefined}
          placeholder="Start"
          value={startPage}
          onChange={(e) => setStartPage(e.target.value)}
          aria-label="Start Page"
          className="w-24 text-center"
        />
      </div>
      
      <div className="text-foreground">-</div>
      
      <div className="flex items-center gap-2">
        <label className="text-foreground text-sm">To</label>
        <Input
          type="number"
          min={1}
          max={totalPages || undefined}
          placeholder="End"
          value={endPage}
          onChange={(e) => setEndPage(e.target.value)}
          aria-label="End Page"
          className="w-24 text-center"
        />
      </div>
      
      {totalPages && (
        <span className="text-sm text-foreground whitespace-nowrap">
          of {totalPages} pages
        </span>
      )}
    </div>
  );
}
