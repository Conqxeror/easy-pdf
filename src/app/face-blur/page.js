import { getToolMetadata } from "@/lib/toolSeoHelper";
import FaceBlurClient from "./components/FaceBlurClient.optimized";

export const metadata = getToolMetadata("/face-blur").metadata;

export default function FaceBlurPage() {
  return <FaceBlurClient />;
}
