import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveBackgroundClient from "./components/RemoveBackgroundClient";

export const metadata = getToolMetadata("/remove-background");

export default function RemoveBackgroundPage() {
  return <RemoveBackgroundClient />;
}
