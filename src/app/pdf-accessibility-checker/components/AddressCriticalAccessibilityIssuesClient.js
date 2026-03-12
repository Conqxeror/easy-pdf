"use client";

import { AlertTriangle, CheckCircle2, FileWarning, Tags, Type } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

const remediationSections = [
  {
    title: "Tagging and Reading Order",
    icon: <Tags className="h-5 w-5" aria-hidden="true" />,
    points: [
      "Open the source document in Acrobat Pro, Word, or the authoring tool that created the PDF.",
      "Add or repair the tag tree so headings, paragraphs, lists, and tables follow the intended reading order.",
      "Re-run the accessibility checker after exporting a new PDF to confirm the fixes reduced critical issues.",
    ],
  },
  {
    title: "Titles, Headings, and Labels",
    icon: <Type className="h-5 w-5" aria-hidden="true" />,
    points: [
      "Set a meaningful document title in the PDF properties.",
      "Use real heading styles in the source document instead of manual font sizing.",
      "Check form fields for programmatic labels, tooltips, and a logical tab order.",
    ],
  },
  {
    title: "Images and Non-text Content",
    icon: <FileWarning className="h-5 w-5" aria-hidden="true" />,
    points: [
      "Add concise alt text to informative images and mark purely decorative images as artifacts.",
      "Confirm charts and diagrams have nearby explanatory text for screen reader users.",
      "Review scanned PDFs manually because OCR and tagging usually need separate cleanup steps.",
    ],
  },
];

export default function AddressCriticalAccessibilityIssuesClient() {
  return (
    <ToolPageLayout
      title="Address Critical Accessibility Issues"
      subtitle="Use this remediation checklist after running the accessibility audit to fix the highest-impact PDF access problems."
      toolName="Accessibility Remediation Guide"
      toolDescription="This page does not modify PDFs automatically. It gives you a practical follow-up checklist for repairing tagging, reading order, alt text, titles, headings, and form labels in the source document or a dedicated PDF editor."
      steps={[
        "Run the PDF Accessibility Checker to identify high-priority issues.",
        "Work through the remediation checklist for tagging, document structure, and non-text content.",
        "Make the fixes in your source file or PDF editor, then export an updated PDF.",
        "Analyze the updated PDF again to verify the critical issues are resolved.",
      ]}
      faqs={[
        {
          question: "Does this page repair the PDF automatically?",
          answer: "No. It is a guidance page that explains how to fix issues in the source document or a dedicated PDF editing tool.",
        },
        {
          question: "What should I fix first?",
          answer: "Start with missing titles, missing tags, broken reading order, unlabeled form fields, and missing alt text because those issues most directly block screen reader access.",
        },
        {
          question: "When should I re-run the audit?",
          answer: "Re-run the accessibility checker after each export so you can verify whether the updated PDF removed the issues you targeted.",
        },
      ]}
      currentTool="pdf-accessibility-checker"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF Accessibility Checker", href: "/pdf-accessibility-checker" },
      ]}
      features={[
        "Priority-ordered remediation checklist",
        "Tagging and reading-order guidance",
        "Alt text and form label reminders",
        "Clear re-test workflow after fixes",
      ]}
      useCases={[
        {
          title: "Fix audit failures",
          description: "Use the checklist to turn high-priority checker findings into concrete repair tasks for your source document or PDF editor.",
        },
        {
          title: "Prepare for manual review",
          description: "Clean up the most common blockers before sending the document to an accessibility specialist or compliance reviewer.",
        },
      ]}
    >
      <div className="space-y-6">
        <Alert>
          This is a guidance workflow, not an automatic fixer. You still need to update the original document or use a PDF editor that supports accessibility tagging and remediation.
        </Alert>

        <div className="grid gap-6 md:grid-cols-3">
          {remediationSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-foreground">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <span>What usually needs manual verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-foreground">
              <li>Color contrast, logical reading sequence, and heading meaning still need a manual review even after automated checks improve.</li>
              <li>Complex tables, charts, and multi-column layouts often need source-document fixes before the exported PDF becomes screen-reader friendly.</li>
              <li>Signed or flattened PDFs may need remediation from the original source file rather than patching the final PDF.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
