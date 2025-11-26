import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveSilenceClient from "./components/RemoveSilenceClient";

export const metadata = getToolMetadata("/remove-silence").metadata;

export default function RemoveSilencePage() {
  return <RemoveSilenceClient />;
}
