<!-- Copilot Workspace Instructions for PDF Toolkit -->
<!-- Docs: https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 🧠 Workspace Context

This is a **Next.js (JavaScript)** project using:

- TailwindCSS (`globals.css`, `tailwind.config.js`)
- ShadCN UI (`@shadcn/ui`)
- `pdf-lib`, `canvas`, `pdfjs-dist` for client-side PDF processing
- ESLint (`next/core-web-vitals`)
- Optional API (`/api/compress`) for advanced compression

---

## 🚦 Status & Roadmap

### ✅ Fully Client-Side & Complete

- Merge PDFs
- Split PDF

### 🟡 Partial/Client-Side with Optional Server

- Compress PDF (client-side basic, advanced via optional API)
- JPG to PDF (check full implementation)
- PDF to JPG (check full implementation)

### 🔜 Planned / Not Yet Implemented

- Rotate PDF
- Watermark PDF
- Protect PDF (basic password)
- Unlock PDF (limited)
- PDF Form Filler (add text/forms)
- Reorder PDF Pages (drag-drop UI)
- Delete PDF Pages
- Organize PDF (UI + logic)
- Add Page Numbers, Header/Footer
- HTML to PDF (partial)
- OCR (Tesseract.js)
- Sign/Annotate PDF (canvas overlay)
- Advanced: Word/Excel to PDF, PDF to Word/Excel (server required, low priority)

### ⚠️ Known Limitations

- Some advanced features (compression, Word/Excel) require server-side processing
- Not all planned tools are fully implemented—some pages are placeholders
- Hindi/Marathi localization and low-bandwidth optimizations are not fully complete
- Ensure JSON-LD, OG, and Twitter meta tags on every route
- Analytics, ads, and pro unlock are not yet implemented

---

## 🎯 Mission

> Build a **100% client-side** (where feasible), blazing-fast, privacy-first web app that replicates and outperforms [iLovePDF.com](https://www.ilovepdf.com/) — with zero server cost, open-source readiness, and SEO-first Indian market optimization.

---

## ⚙️ Copilot Coding Guidelines

> When generating code, follow these enforced styles:

### 🔹 Pages & Layout

- Always use `use client` directive for interactive pages
- Follow `src/app/[tool]/page.js` structure for tools
- Use `<Head>` with SEO-rich meta, OG, and Twitter tags
- Wrap in layout from `src/app/layout.js`
- Ensure JSON-LD, OG, and Twitter meta tags on every route

### 🔹 UI

- Use TailwindCSS and ShadCN components (`Button`, `Input`, `Chip`, `Alert`)
- Mobile-first layout with flex/grid
- Use accessible components (`aria-label`, `aria-describedby`, etc.)

### 🔹 Logic & Utilities

- Use `pdf-lib` for PDF processing
- Convert outputs to `Blob` → `URL.createObjectURL` for downloads
- Avoid server calls unless compression or advanced features require it

---

## 🌐 SEO, PWA & Localization Goals

- Add meta tags on every route
- Include Open Graph, Twitter Card, JSON-LD schema
- Use Lighthouse-optimized practices for speed and accessibility
- Make PWA-ready (manifest, offline support)
- Target **Google India SEO** (localized content, low bandwidth, Hindi/Marathi-ready)
- Review every tool/page for SEO, PWA, and localization best practices

---

## 🧪 Hosting & Infra

| Layer        | Plan                                  |
| ------------ | ------------------------------------- |
| Hosting      | Vercel (Free)                         |
| Backend/API  | Avoid unless needed                   |
| Auth         | None or Local only                    |
| Analytics    | Umami / Plausible                     |
| Monetization | Ads / Pro Unlock (client-only gating) |

---

## 💡 Code Structure Summary

- 🗂️ Each tool in: `src/app/[tool]/page.js`
- 🎨 UI components: `src/components/ui/`
- 🧩 Utils: `src/lib/utils.js`
- 🎨 Styling: `globals.css`, `tailwind.config.js`
- 🚀 Navigation: `layout.js` provides nav for all tools
- 🔍 SEO: Head tags & JSON-LD in every page

---

## 📌 GitHub Summary (One-liner)

> A blazing-fast, privacy-first iLovePDF alternative built with Next.js, Tailwind & pdf-lib — 100% client-side (where feasible), open-source, and India-optimized.

---
