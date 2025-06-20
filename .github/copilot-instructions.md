Here is your copilot-instructions.md content, restructured as clean, organized Markdown:

---

# 🧠 Workspace Context

This is a Next.js (JavaScript) project using:

- **TailwindCSS** (`globals.css`, tailwind.config.js)
- **ShadCN UI** (`@shadcn/ui`)
- **pdf-lib**, **canvas**, **pdfjs-dist** for client-side PDF processing
- **ESLint** (`next/core-web-vitals`)
- **Optional API** (`/api/compress`) for advanced compression (currently unused, client-side compression implemented)

---

## 🚦 Status & Roadmap

### ✅ Fully Client-Side & Complete

- Merge PDFs
- Split PDF
- Compress PDF (fully client-side via image re-encoding)
- JPG to PDF
- PDF to JPG
- Protect PDF
- Unlock PDF
- Rotate PDF
- Watermark PDF (Text and basic image watermarking)
- Delete PDF Pages
- Reorder PDF Pages (drag-drop UI)
- Organize PDF (UI + logic)
- Add Page Numbers, Header/Footer
- HTML to PDF
- OCR (Tesseract.js)
- Sign/Annotate PDF (canvas overlay)
- PDF Form Filler (add text/forms)

### 🟡 Partial/Client-Side with Optional Server

- Advanced: Word/Excel to PDF, PDF to Word/Excel (server required, low priority)

### 🔜 Planned / Not Yet Implemented

- Hindi/Marathi localization and low-bandwidth optimizations (in progress)
- Analytics, ads, and pro unlock (planned)

### ⚠️ Known Limitations

- Hindi/Marathi localization and low-bandwidth optimizations are not fully complete.
- Analytics, ads, and pro unlock are not yet implemented.

---

## 🎯 Mission

Build a 100% client-side (where feasible), blazing-fast, privacy-first web app that replicates and outperforms other PDF tools — with zero server cost, open-source readiness, and SEO-first Indian market optimization.

---

## ⚙️ Copilot Coding Guidelines

### Pages & Layout

- Always use `use client` directive for interactive pages
- Follow page.js structure for tools
- Use `<MetaHead>` (our custom SEO component) with SEO-rich meta, OG, and Twitter tags
- Wrap in layout from layout.js
- Ensure JSON-LD, OG, and Twitter meta tags on every route

### UI

- Use TailwindCSS and ShadCN components (Button, Input, Chip, Alert, Card, Slider, RadioGroup, Select, Tabs, Loader, FileDropzone, PageRangeInput)
- Mobile-first layout with flex/grid
- Use accessible components (`aria-label`, `aria-describedby`, etc.)

### Logic & Utilities

- Use `pdf-lib` for PDF processing
- Use `pdfjs-dist` for PDF rendering/analysis (e.g., for PDF to JPG, page count)
- Convert outputs to Blob → `URL.createObjectURL` for downloads
- Avoid server calls unless compression or advanced features absolutely require it (current compression is client-side)

### SEO, PWA & Localization Goals

- Add meta tags on every route (using `<MetaHead>`)
- Include Open Graph, Twitter Card, JSON-LD schema
- Use Lighthouse-optimized practices for speed and accessibility
- Make PWA-ready (manifest, offline support)
- Target Google India SEO (localized content, low bandwidth, Hindi/Marathi-ready)
- Review every tool/page for SEO, PWA, and localization best practices

### Hosting & Infra

- **Hosting:** Vercel (Free)
- **Backend/API:** Avoid unless needed (currently unused)
- **Auth:** None or Local only
- **Analytics:** Umami / Plausible
- **Monetization:** Ads / Pro Unlock (client-only gating)

---

## 💡 Code Structure Summary

- 🗂️ Each tool in: page.js
- 🎨 UI components: ui
- 🧩 Utils: utils.js
- 🎨 Styling: `globals.css`, tailwind.config.js
- 🚀 Navigation: `layout.js` provides nav for all tools
- 🔍 SEO: Head tags & JSON-LD in every page (via `MetaHead`)

---

## 📌 GitHub Summary (One-liner)

A blazing-fast, privacy-first easy-pdf built with Next.js, Tailwind & pdf-lib — 100% client-side (where feasible), open-source, and India-optimized.

---

Let me know if you want this written back to your file or need further formatting!
