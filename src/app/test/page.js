import MetaHead from "@/components/ui/MetaHead";

export default function Test() {
  return (
    <>
      <MetaHead
        title="Test Page | PDF Toolkit"
        description="Test page for PDF Toolkit UI and TailwindCSS."
        url="https://yourdomain.com/test"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Test Page",
          description: "Test page for PDF Toolkit UI and TailwindCSS.",
          url: "https://yourdomain.com/test",
        }}
      />
      <div className="text-4xl text-red-500">Test Tailwind</div>
    </>
  );
}
