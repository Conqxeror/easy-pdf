import { getToolMetadata } from "@/lib/toolSeoHelper";
import SvgToPngClient from "./components/SvgToPngClient";

export const metadata = getToolMetadata("/svg-to-png").metadata;

export default function SvgToPngPage() {
  return <SvgToPngClient />;
}
