import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoToGifClient from "./components/VideoToGifClient";

export const metadata = getToolMetadata("/video-to-gif");

export default function VideoToGifPage() {
  return <VideoToGifClient />;
}
