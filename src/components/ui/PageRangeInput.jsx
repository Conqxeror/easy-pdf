import React from "react";

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
      <input
        type="number"
        min={1}
        max={totalPages || undefined}
        placeholder="Start Page"
        value={startPage}
        onChange={e => setStartPage(e.target.value)}
        className="w-28 px-2 py-1 rounded text-black"
        aria-label="Start Page"
      />
      <input
        type="number"
        min={1}
        max={totalPages || undefined}
        placeholder="End Page"
        value={endPage}
        onChange={e => setEndPage(e.target.value)}
        className="w-28 px-2 py-1 rounded text-black"
        aria-label="End Page"
      />
      {totalPages && (
        <span className="text-xs text-gray-400 self-center">/ {totalPages} pages</span>
      )}
    </div>
  );
}
