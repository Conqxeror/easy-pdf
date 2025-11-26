import { getToolMetadata } from "@/lib/toolSeoHelper";
import JpgToPdfClient from "./components/JpgToPdfClient";

export const metadata = getToolMetadata("/jpg-to-pdf").metadata;

export default function JpgToPdfPage() {
  return <JpgToPdfClient />;
}
