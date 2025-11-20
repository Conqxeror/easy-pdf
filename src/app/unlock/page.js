import { getToolMetadata } from "@/lib/toolSeoHelper";
import UnlockClient from "./components/UnlockClient";

export const metadata = getToolMetadata("/unlock");

export default function UnlockPage() {
  return <UnlockClient />;
}
