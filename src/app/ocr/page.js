import { getToolMetadata } from "@/lib/toolSeoHelper";
import OcrClient from "./components/OcrClient";

export const metadata = getToolMetadata("/ocr");

export default function OcrPage() {
  return <OcrClient />;
}
