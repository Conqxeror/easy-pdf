import MetaHead from "@/components/ui/MetaHead";

export default function Test() {
  return (
    <>
      <MetaHead
        title="Test Page | easy-pdf"
        description="Test page for easy-pdf UI and TailwindCSS."
        url="https://easy-pdf.com/test"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Test Page",
          description: "Test page for easy-pdf UI and TailwindCSS.",
          url: "https://easy-pdf.com/test",
        }}
      />
      <div className="text-4xl text-red-500">Test Tailwind</div>
    </>
  );
}
