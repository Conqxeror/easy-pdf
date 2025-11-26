import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageRotatorClient from "./components/ImageRotatorClient";

export const metadata = getToolMetadata("/image-rotator").metadata;

export default function ImageRotatorPage() {
  return <ImageRotatorClient />;
}
