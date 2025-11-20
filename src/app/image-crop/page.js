import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageCropClient from "./components/ImageCropClient";

export const metadata = getToolMetadata("/image-crop");

export default function ImageCropPage() {
  return <ImageCropClient />;
}
