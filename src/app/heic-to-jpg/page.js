import { getToolMetadata } from "@/lib/toolSeoHelper";
import HeicToJpgClient from "./components/HeicToJpgClient";

export const metadata = getToolMetadata("/heic-to-jpg").metadata;

export default function HeicToJpgPage() {
  return <HeicToJpgClient />;
}
