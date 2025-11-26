import { getToolMetadata } from "@/lib/toolSeoHelper";
import ZipExtractorClient from "./components/ZipExtractorClient";

export const metadata = getToolMetadata("/zip-extractor").metadata;

export default function ZipExtractorPage() {
  return <ZipExtractorClient />;
}
