import { getToolMetadata } from "@/lib/toolSeoHelper";
import Mp4ToMp3Client from "./components/Mp4ToMp3Client";

export const metadata = getToolMetadata("/mp4-to-mp3");

export default function Mp4ToMp3Page() {
  return <Mp4ToMp3Client />;
}
