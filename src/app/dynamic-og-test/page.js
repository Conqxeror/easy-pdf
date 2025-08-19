import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Dynamic OG Test - Merge PDF Tool",
  description: "Test page showcasing dynamic open-graph image generation for PDF tools. This demonstrates how each tool gets a unique, branded social media preview.",
  keywords: ["dynamic og", "open graph", "social media", "pdf tools", "meta tags"],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/merge",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Merger",
  toolCategory: "Organize & Edit",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Merger", url: "https://easy-pdf-murex.vercel.app/merge" }
  ]
});

export default function DynamicOGTest() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dynamic Open Graph Generation Test</h1>
        <p className="text-lg text-muted-foreground mb-6">
          This page demonstrates the new dynamic open-graph image generation feature. 
          Each tool now generates custom social media preview images based on the tool's 
          category, title, and description.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Test Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Organize & Edit (Blue Theme)</h3>
              <a 
                href="/api/og?title=Merge%20PDF&description=Combine%20multiple%20PDF%20files%20into%20one&tool=PDF%20Merger&category=Organize%20%26%20Edit"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-50 dark:bg-blue-900/20 p-3 rounded border hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Merge PDF Tool
              </a>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Convert & Create (Green Theme)</h3>
              <a 
                href="/api/og?title=JPG%20to%20PDF&description=Convert%20images%20to%20PDF%20format&tool=Image%20Converter&category=Convert%20%26%20Create"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-50 dark:bg-green-900/20 p-3 rounded border hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                JPG to PDF Tool
              </a>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Security & Privacy (Purple Theme)</h3>
              <a 
                href="/api/og?title=Protect%20PDF&description=Add%20password%20protection%20to%20PDF%20files&tool=PDF%20Protector&category=Security%20%26%20Privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-purple-50 dark:bg-purple-900/20 p-3 rounded border hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                Protect PDF Tool
              </a>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">AI & Analysis (Red Theme)</h3>
              <a 
                href="/api/og?title=Advanced%20OCR&description=Extract%20text%20from%20images%20and%20PDFs&tool=OCR%20Engine&category=AI%20%26%20Analysis"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-red-50 dark:bg-red-900/20 p-3 rounded border hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                OCR Tool
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Dynamic color schemes based on tool categories
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Customizable titles and descriptions
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Automatic text truncation for optimal display
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Consistent branding with easy-pdf logo
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Fallback to static images if generation fails
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Edge runtime for fast generation
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Implementation</h2>
          <div className="text-sm space-y-2">
            <p><strong>API Endpoint:</strong> <code>/api/og</code></p>
            <p><strong>Parameters:</strong> title, description, tool, category, theme</p>
            <p><strong>Output:</strong> 1200x630 PNG image optimized for social media</p>
            <p><strong>Integration:</strong> Automatic via metadata functions</p>
          </div>
        </div>
      </div>
    </div>
  );
}