import { getToolMetadata } from "@/lib/toolSeoHelper";
import UrlEncoderClient from "./components/UrlEncoderClient";

export const metadata = getToolMetadata("/url-encoder");

export default function UrlEncoderPage() {
  return <UrlEncoderClient />;
}
