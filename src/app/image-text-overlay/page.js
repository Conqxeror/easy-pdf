import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageTextOverlayClient from "./components/ImageTextOverlayClient";

export const metadata = getToolMetadata("/image-text-overlay");

export default function ImageTextOverlayPage() {
  return <ImageTextOverlayClient />;
}
