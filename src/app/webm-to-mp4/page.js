import { getToolMetadata } from "@/lib/toolSeoHelper";
import WebmToMp4Client from "./components/WebmToMp4Client";

export const metadata = getToolMetadata("/webm-to-mp4").metadata;

export default function WebmToMp4Page() {
  return <WebmToMp4Client />;
}
