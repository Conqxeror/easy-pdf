import { getToolMetadata } from "@/lib/toolSeoHelper";
import NumberBaseConverterClient from "./components/NumberBaseConverterClient";

export const metadata = getToolMetadata("/number-base-converter").metadata;

export default function NumberBaseConverterPage() {
  return <NumberBaseConverterClient />;
}
