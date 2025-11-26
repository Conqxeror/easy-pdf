import { getToolMetadata } from "@/lib/toolSeoHelper";
import RsaGeneratorClient from "./components/RsaGeneratorClient";

export const metadata = getToolMetadata("/rsa-generator").metadata;

export default function RsaGeneratorPage() {
  return <RsaGeneratorClient />;
}
