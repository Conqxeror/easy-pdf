import { getToolMetadata } from "@/lib/toolSeoHelper";
import TextDiffCheckerClient from "./components/TextDiffCheckerClient";

export const metadata = getToolMetadata("/text-diff-checker").metadata;

export default function TextDiffCheckerPage() {
  return <TextDiffCheckerClient />;
}
