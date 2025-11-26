import { getToolMetadata } from "@/lib/toolSeoHelper";
import ZipCreatorClient from "./components/ZipCreatorClient";

export const metadata = getToolMetadata("/zip-creator").metadata;

export default function ZipCreatorPage() {
  return <ZipCreatorClient />;
}
