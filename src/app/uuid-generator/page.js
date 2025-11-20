import { getToolMetadata } from "@/lib/toolSeoHelper";
import UuidGeneratorClient from "./components/UuidGeneratorClient";

export const metadata = getToolMetadata("/uuid-generator");

export default function UuidGeneratorPage() {
  return <UuidGeneratorClient />;
}
