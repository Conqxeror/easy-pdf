import { getToolMetadata } from "@/lib/toolSeoHelper";
import WavMp3ConverterClient from "./components/WavMp3ConverterClient";

export const metadata = getToolMetadata("/wav-mp3-converter").metadata;

export default function WavMp3ConverterPage() {
  return <WavMp3ConverterClient />;
}
