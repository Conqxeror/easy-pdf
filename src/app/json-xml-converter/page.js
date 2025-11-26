import { getToolMetadata } from "@/lib/toolSeoHelper";
import JsonXmlConverterClient from "./components/JsonXmlConverterClient";

export const metadata = getToolMetadata("/json-xml-converter").metadata;

export default function JsonXmlConverterPage() {
  return <JsonXmlConverterClient />;
}
