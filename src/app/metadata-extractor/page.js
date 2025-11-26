import { getToolMetadata } from "@/lib/toolSeoHelper";
import MetadataExtractorClient from "./components/MetadataExtractorClient";

export const metadata = getToolMetadata("/metadata-extractor").metadata;

export default function MetadataExtractorPage() {
  return <MetadataExtractorClient />;
}
