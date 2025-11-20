import { getToolMetadata } from "@/lib/toolSeoHelper";
import FaceBlurClient from "./components/FaceBlurClient";

export const metadata = getToolMetadata("/face-blur");

export default function FaceBlurPage() {
  return <FaceBlurClient />;
}
