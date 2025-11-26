import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageConverterClient from "./components/ImageConverterClient";

export const metadata = getToolMetadata("/image-converter").metadata;

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
