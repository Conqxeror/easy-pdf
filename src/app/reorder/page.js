import { getToolMetadata } from "@/lib/toolSeoHelper";
import ReorderClient from "./components/ReorderClient";

export const metadata = getToolMetadata("/reorder");

export default function ReorderPage() {
  return <ReorderClient />;
}
