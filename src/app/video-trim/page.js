import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoTrimClient from "./components/VideoTrimClient";

export const metadata = getToolMetadata("/video-trim").metadata;

export default function VideoTrimPage() {
  return <VideoTrimClient />;
}
