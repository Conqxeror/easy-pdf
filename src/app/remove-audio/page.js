import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveAudioClient from "./components/RemoveAudioClient";

export const metadata = getToolMetadata("/remove-audio");

export default function RemoveAudioPage() {
  return <RemoveAudioClient />;
}
