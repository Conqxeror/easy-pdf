import { getToolMetadata } from "@/lib/toolSeoHelper";
import CompressClient from "./components/CompressClient";

export const metadata = getToolMetadata("/compress");

export default function CompressPage() {
  return <CompressClient />;
}
