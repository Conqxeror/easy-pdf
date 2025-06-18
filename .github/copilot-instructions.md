<!-- Copilot Workspace Instructions for PDF Toolkit -->
<!-- Docs: https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 🧠 Workspace Context

This is a **Next.js (JavaScript)** project using:

- TailwindCSS (`globals.css`, `tailwind.config.js`)
- ShadCN UI (`@shadcn/ui`)
- `pdf-lib`, `canvas`, `pdfjs-dist` for client-side PDF processing
- ESLint (`next/core-web-vitals`)
- Optional API (`/api/compress`) for advanced compression

## 🎯 Mission

> Build a **100% client-side**, blazing-fast, privacy-first web app that replicates and outperforms [iLovePDF.com](https://www.ilovepdf.com/) — with zero server cost, open-source readiness, and SEO-first Indian market optimization.

---

## 🛠️ Active PDF Tools (Core Implemented)

| Tool            | Status      | Client-Side Feasible  | Libraries Used                 |
| --------------- | ----------- | --------------------- | ------------------------------ |
| ✅ Merge PDFs   | Implemented | Yes                   | `pdf-lib`                      |
| ✅ Split PDF    | Implemented | Yes                   | `pdf-lib`                      |
| ✅ Compress PDF | Partial     | Yes + optional server | `pdf-lib`, `canvas`, `pikepdf` |
| ✅ Rotate PDF   | Planned     | Yes                   | `pdf-lib`                      |
| ✅ Watermark    | Planned     | Yes                   | `pdf-lib`                      |
| ✅ Protect PDF  | Planned     | Yes (basic password)  | `pdf-lib`                      |
| ✅ Unlock PDF   | Planned     | Partial (limited)     | `pdf-lib`                      |
| ✅ JPG to PDF   | Planned     | Yes                   | `canvas`, `pdf-lib`            |
| ✅ PDF to JPG   | Planned     | Yes                   | `pdfjs-dist`, `canvas`         |

---

## 🔮 Additional iLovePDF Feature Parity (Planned / Optional)

| Feature                             | Feasibility                | Priority | Notes                                |
| ----------------------------------- | -------------------------- | -------- | ------------------------------------ |
| ❌ Word to PDF                      | Server required            | Later    | Needs MS API                         |
| ❌ PDF to Word                      | Server required            | Later    | Needs Google Cloud / MS              |
| ❌ Excel to PDF                     | Server required            | Later    | Complex formatting                   |
| ❌ PDF to Excel                     | Server required            | Later    |                                      |
| 🧠 OCR (PDF to Text)                | Client-side (Tesseract.js) | Medium   | Use `tesseract.js`                   |
| ✅ PDF Form Filler (Add text/forms) | Planned                    | Medium   | Add editable text inputs             |
| ✅ Reorder PDF Pages                | Planned                    | Medium   | Drag-drop UI with `react-dnd`        |
| ✅ Delete PDF Pages                 | Planned                    | Medium   | Combine with reorder                 |
| ✅ Organize PDF                     | Planned                    | Medium   | UI + `pdf-lib` logic                 |
| ✅ Sign PDF                         | Client-only                | Later    | Allow drawing or uploading signature |
| ✅ Annotate PDF                     | Partial                    | Later    | Needs canvas + text overlay          |
| ✅ Add Page Numbers                 | Planned                    | Medium   | Footer text overlay                  |
| ✅ Add Header/Footer                | Planned                    | Medium   | Text placement                       |
| ✅ HTML to PDF                      | Partial                    | Medium   | `html2canvas`, `jsPDF`               |

---

## ⚙️ Copilot Coding Guidelines

> When generating code, follow these enforced styles:

### 🔹 Pages & Layout

- Always use `use client` directive for interactive pages
- Follow `src/app/[tool]/page.js` structure for tools
- Use `<Head>` with SEO-rich meta, OG, and Twitter tags
- Wrap in layout from `src/app/layout.js`

### 🔹 UI

- Use TailwindCSS and ShadCN components (`Button`, `Input`, `Chip`, `Alert`)
- Mobile-first layout with flex/grid
- Use accessible components (`aria-label`, `aria-describedby`, etc.)

### 🔹 Logic & Utilities

- Use `pdf-lib` for PDF processing
- Convert outputs to `Blob` → `URL.createObjectURL` for downloads
- Avoid server calls unless compression requires it

---

## 🌐 SEO & PWA Goals

- Add meta tags on every route
- Include Open Graph, Twitter Card, JSON-LD schema
- Use Lighthouse-optimized practices for speed and accessibility
- Make PWA-ready (manifest, offline support)
- Target **Google India SEO** (localized content, low bandwidth, Hindi/Marathi-ready)

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

> A blazing-fast, privacy-first iLovePDF alternative built with Next.js, Tailwind & pdf-lib — 100% client-side, open-source, and India-optimized.

---
