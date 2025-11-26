import { getToolMetadata } from "@/lib/toolSeoHelper";
import RotateClient from "./components/RotateClient";

export const metadata = getToolMetadata("/rotate").metadata;

export default function RotatePage() {
  return <RotateClient />;
}
