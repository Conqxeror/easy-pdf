import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageWatermarkClient from "./components/ImageWatermarkClient";

export const metadata = getToolMetadata("/image-watermark");

export default function ImageWatermarkPage() {
  return <ImageWatermarkClient />;
}
