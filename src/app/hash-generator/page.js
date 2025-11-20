import { getToolMetadata } from "@/lib/toolSeoHelper";
import HashGeneratorClient from "./components/HashGeneratorClient";

export const metadata = getToolMetadata("/hash-generator");

export default function HashGeneratorPage() {
  return <HashGeneratorClient />;
}
