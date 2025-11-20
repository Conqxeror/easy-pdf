import { getToolMetadata } from "@/lib/toolSeoHelper";
import MetadataExtractorClient from "./components/MetadataExtractorClient";

export const metadata = getToolMetadata("/metadata-extractor");

export default function MetadataExtractorPage() {
  return <MetadataExtractorClient />;
}
