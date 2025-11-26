import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveBackgroundClient from "./components/RemoveBackgroundClient";

export const metadata = getToolMetadata("/remove-background").metadata;

export default function RemoveBackgroundPage() {
  return <RemoveBackgroundClient />;
}
