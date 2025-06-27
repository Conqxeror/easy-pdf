import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Add Watermark to PDF – Easy PDF Tool",
  description:
    "Add text or image watermark to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF watermarking. No uploads required.",
  keywords: [
    "Watermark PDF",
    "Add watermark",
    "PDF watermarking",
    "Text watermark",
    "Image watermark",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF watermark",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/watermark",
});

export default function WatermarkLayout({ children }) {
  return children;
}

