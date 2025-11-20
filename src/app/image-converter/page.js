import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageConverterClient from "./components/ImageConverterClient";

export const metadata = getToolMetadata("/image-converter");

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
