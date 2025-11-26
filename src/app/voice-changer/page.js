import { getToolMetadata } from "@/lib/toolSeoHelper";
import VoiceChangerClient from "./components/VoiceChangerClient";

export const metadata = getToolMetadata("/voice-changer").metadata;

export default function VoiceChangerPage() {
  return <VoiceChangerClient />;
}
