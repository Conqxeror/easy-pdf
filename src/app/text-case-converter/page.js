import { getToolMetadata } from "@/lib/toolSeoHelper";
import TextCaseConverterClient from "./components/TextCaseConverterClient";

export const metadata = getToolMetadata("/text-case-converter");

export default function TextCaseConverterPage() {
  return <TextCaseConverterClient />;
}
