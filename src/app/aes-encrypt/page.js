import { getToolMetadata } from "@/lib/toolSeoHelper";
import AesEncryptClient from "./components/AesEncryptClient";

export const metadata = getToolMetadata("/aes-encrypt").metadata;

export default function AesEncryptPage() {
  return <AesEncryptClient />;
}
