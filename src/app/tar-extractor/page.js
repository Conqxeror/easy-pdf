import { getToolMetadata } from "@/lib/toolSeoHelper";
import TarExtractorClient from "./components/TarExtractorClient";

export const metadata = getToolMetadata("/tar-extractor");

export default function TarExtractorPage() {
  return <TarExtractorClient />;
}
