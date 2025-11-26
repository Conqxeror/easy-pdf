import { getToolMetadata } from "@/lib/toolSeoHelper";
import TxtToPdfClient from "./components/TxtToPdfClient";

export const metadata = getToolMetadata("/txt-to-pdf").metadata;

export default function TxtToPdfPage() {
  return <TxtToPdfClient />;
}
