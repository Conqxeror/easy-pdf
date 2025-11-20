import { getToolMetadata } from "@/lib/toolSeoHelper";
import M4aMp3ConverterClient from "./components/M4aMp3ConverterClient";

export const metadata = getToolMetadata("/m4a-mp3-converter");

export default function M4aMp3ConverterPage() {
  return <M4aMp3ConverterClient />;
}
