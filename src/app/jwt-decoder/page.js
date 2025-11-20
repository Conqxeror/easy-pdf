import { getToolMetadata } from "@/lib/toolSeoHelper";
import JwtDecoderClient from "./components/JwtDecoderClient";

export const metadata = getToolMetadata("/jwt-decoder");

export default function JwtDecoderPage() {
  return <JwtDecoderClient />;
}
