import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageWatermarkClient from "./components/ImageWatermarkClient";

export const metadata = getToolMetadata("/image-watermark").metadata;

export default function ImageWatermarkPage() {
  return <ImageWatermarkClient />;
}
