import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoTrimClient from "./components/VideoTrimClient";

export const metadata = getToolMetadata("/video-trim");

export default function VideoTrimPage() {
  return <VideoTrimClient />;
}
