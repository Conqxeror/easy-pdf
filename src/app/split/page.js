import { getToolMetadata } from "@/lib/toolSeoHelper";
import SplitClient from "./components/SplitClient";

export const metadata = getToolMetadata("/split");

export default function SplitPage() {
  return <SplitClient />;
}
