import { getToolMetadata } from "@/lib/toolSeoHelper";
import SteganographyClient from "./components/SteganographyClient";

export const metadata = getToolMetadata("/steganography");

export default function SteganographyPage() {
  return <SteganographyClient />;
}
