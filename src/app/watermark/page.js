import { getToolMetadata } from "@/lib/toolSeoHelper";
import WatermarkClient from "./components/WatermarkClient";

export const metadata = getToolMetadata("/watermark").metadata;

export default function WatermarkPage() {
  return <WatermarkClient />;
}
