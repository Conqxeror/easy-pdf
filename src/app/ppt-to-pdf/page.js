import { getToolMetadata } from "@/lib/toolSeoHelper";
import PptToPdfClient from "./components/PptToPdfClient";

export const metadata = getToolMetadata("/ppt-to-pdf").metadata;

export default function PptToPdfPage() {
  return <PptToPdfClient />;
}
