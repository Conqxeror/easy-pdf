import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageCropperClient from "./components/ImageCropperClient";

export const metadata = getToolMetadata("/image-cropper").metadata;

export default function ImageCropperPage() {
  return <ImageCropperClient />;
}
