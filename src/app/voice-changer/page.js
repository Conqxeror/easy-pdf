import { getToolMetadata } from "@/lib/toolSeoHelper";
import VoiceChangerClient from "./components/VoiceChangerClient";

export const metadata = getToolMetadata("/voice-changer");

export default function VoiceChangerPage() {
  return <VoiceChangerClient />;
}
