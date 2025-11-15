# 📄 All-in-One PDF & Document Toolkit

![Project Banner](public/og-image.jpg)

Welcome to the **All-in-One PDF & Document Toolkit**! This is a comprehensive web application built with Next.js, designed to simplify your document management tasks. From merging and splitting PDFs to converting formats and performing OCR, this tool provides a seamless experience for all your document needs.

## ✨ Features

Our toolkit offers a wide range of functionalities to empower your document workflows:

-   **Compress PDF**: 📉 Reduce PDF file size for easier sharing and storage.
-   **Merge PDF**: 🔗 Combine multiple PDF files into a single document.
-   **Split PDF**: ✂️ Extract specific pages or ranges from a PDF.
-   **Organize PDF**: 🗂️ Rearrange, add, or delete pages within your PDF.
-   **PDF to JPG**: 🖼️ Convert PDF pages into high-quality JPG images.
-   **JPG to PDF**: 📸 Transform your JPG images back into a single PDF.
-   **HTML to PDF**: 🌐 Convert web pages or HTML content into PDF documents.


-   **OCR (Optical Character Recognition)**: 🔍 Extract text from scanned documents and images.
-   **Protect PDF**: 🔒 Add password protection to your PDF files.
-   **Unlock PDF**: 🔓 Remove password protection from secured PDFs.
-   **Rotate PDF**: 🔄 Rotate pages in your PDF to the correct orientation.
-   **Add Page Numbers**: #️⃣ Insert customizable page numbers into your PDF.
-   **Add Watermark**: 💧 Apply text or image watermarks to your PDF.
-   **Sign PDF**: ✍️ Electronically sign your PDF documents.
-   **Form Filler**: 📝 Fill out PDF forms with text, checkboxes, and signatures.
-   **Legal Analyzer**: ⚖️ Analyze legal documents with AI-powered insights.
-   **Medical Analyzer**: ⚕️ Analyze medical documents with AI-powered review.
-   **PDF Metadata Editor**: 🏷️ Edit PDF metadata including title, author, and keywords.
-   **PDF Bookmark Manager**: 📑 Add and organize PDF bookmarks and navigation.
-   **PDF Table Extractor**: 📊 Extract tables from PDFs to CSV, Excel, or JSON.
-   **PDF Batch Processor**: 🔄 Process multiple PDFs with batch operations.
-   **PDF Form Creator**: 📋 Create interactive PDF forms with various field types.
-   **Advanced OCR with AI**: 🤖 AI-enhanced text extraction with formatting.
-   **PDF Accessibility Checker**: ♿ Check PDF compliance with WCAG standards.
-   **PDF Digital Signature**: 🔐 Add legally binding digital signatures.
-   **PDF Redaction Tool**: 🚫 Permanently remove sensitive information.
-   **PDF Version Comparison**: 🔍 Compare different versions with visual diff.
-   **PDF Annotation Collaboration**: 👥 Collaborate on PDF annotations.
-   **Invoice Generator**: 💰 Create professional invoices with GST support.
-   **QR Code Generator**: 📱 Generate QR codes for URLs, WiFi, and more.
-   **Certificate Generator**: 🏆 Create professional certificates and awards.
-   **Portfolio Creator**: 💼 Build professional PDF portfolios.
-   **Report Generator**: 📈 Create business reports with metrics and charts.

## 🚀 Technologies Used

This project leverages modern web technologies to deliver a robust and efficient application:


## Open Graph & Analytics

- Dynamic Open Graph (OG) images are generated at runtime by the App Router at `/og/tool/:slug` for tool pages and `/og/homepage` for the homepage. These images are 1200x630 (recommended)
- Local fonts for OG rendering can be added to `public/fonts/` (see `public/fonts/README.md`). The generator falls back to Google Fonts if local fonts are not available.
- The server logs OG hits via `/api/og/log`; to forward OG hits to Google Analytics (Measurement Protocol), set `GA_MEASUREMENT_ID` and `GA_API_SECRET` in environment variables (see `.env.example`).
 - You can also pre-generate OG images at build-time for high-traffic pages using `npm run generate-og-static` — this stores images in `public/og-static/{slug}.png` and `public/og-static/homepage.png` and is used automatically by the metadata helpers when present.
 - The `prebuild` script runs the static OG generation step automatically (so `npm run build` will also create these static OG images prior to building the Next.js site).

## 💻 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js (v18 or higher) and npm/yarn/pnpm/bun installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 💡 Usage

1.  **Select a Tool**: Choose the desired document manipulation tool from the homepage.
2.  **Upload Files**: Drag and drop your PDF or image files into the designated area.
3.  **Configure Options**: Adjust settings specific to the chosen tool (e.g., page range for splitting, compression level).
4.  **Process & Download**: Click the process button and download your modified document.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## � Documentation

- **[Quick Reference Guide](QUICK_REFERENCE.md)** - Best practices, common issues, and development checklist
- **[Recent Improvements](IMPROVEMENTS_2025-10.md)** - October 2025 code quality and consistency improvements
- **[Copilot Instructions](.github/copilot-instructions.md)** - AI-assisted development guidelines

## �📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Your Name - [kadriwalimohammad@gmail.com](mailto:kadriwalimohammad@gmail.com)

Project Link: [https://github.com/Conqxeror/easy-pdf](https://github.com/Conqxeror/easy-pdf)