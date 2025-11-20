import { getToolMetadata } from "@/lib/toolSeoHelper";
import MergePageClient from "./components/MergePageClient";

export const metadata = getToolMetadata("/merge");

export default function MergePage() {
  return <MergePageClient />;
}
