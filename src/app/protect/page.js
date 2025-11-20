import { getToolMetadata } from "@/lib/toolSeoHelper";
import ProtectClient from "./components/ProtectClient";

export const metadata = getToolMetadata("/protect");

export default function ProtectPage() {
  return <ProtectClient />;
}
