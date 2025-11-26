import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoCompressClient from "./components/VideoCompressClient";

export const metadata = getToolMetadata("/video-compress").metadata;

export default function VideoCompressPage() {
  return <VideoCompressClient />;
}
