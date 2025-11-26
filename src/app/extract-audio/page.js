import { getToolMetadata } from "@/lib/toolSeoHelper";
import ExtractAudioClient from "./components/ExtractAudioClient";

export const metadata = getToolMetadata("/extract-audio").metadata;

export default function ExtractAudioPage() {
  return <ExtractAudioClient />;
}
