import { getToolMetadata } from "@/lib/toolSeoHelper";
import FileChecksumClient from "./components/FileChecksumClient";

export const metadata = getToolMetadata("/file-checksum");

export default function FileChecksumPage() {
  return <FileChecksumClient />;
}
