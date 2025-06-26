import ToolPageContent from "@/components/ui/ToolPageContent";

export default function Test() {
  return (
    <>
      <div className="text-4xl text-red-500">Test Tailwind</div>
      <ToolPageContent
        toolName="Test Page"
        toolDescription="This is a test page to verify the integration of ToolPageContent."
        steps={[
          "Step 1: Verify the content.",
          "Step 2: Check for proper rendering.",
        ]}
        faqs={[
          {
            question: "Is this page functional?",
            answer: "Yes, this page is for testing purposes.",
          },
        ]}
      />
    </>
  );
}
