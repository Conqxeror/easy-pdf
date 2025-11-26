import { getToolMetadata } from "@/lib/toolSeoHelper";
import TarExtractorClient from "./components/TarExtractorClient";

export const metadata = getToolMetadata("/tar-extractor").metadata;

export default function TarExtractorPage() {
  return <TarExtractorClient />;
}
