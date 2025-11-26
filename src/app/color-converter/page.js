import { getToolMetadata } from "@/lib/toolSeoHelper";
import ColorConverterClient from "./components/ColorConverterClient";

export const metadata = getToolMetadata("/color-converter").metadata;

export default function ColorConverterPage() {
  return <ColorConverterClient />;
}
