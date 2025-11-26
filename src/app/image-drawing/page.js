import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageDrawingClient from "./components/ImageDrawingClient";

export const metadata = getToolMetadata("/image-drawing").metadata;

export default function ImageDrawingPage() {
  return <ImageDrawingClient />;
}
