import { getToolMetadata } from "@/lib/toolSeoHelper";
import ResizeImagesClient from "./components/ResizeImagesClient";

export const metadata = getToolMetadata("/resize-images");

export default function ResizeImagesPage() {
  return <ResizeImagesClient />;
}
