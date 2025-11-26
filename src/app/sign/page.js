import { getToolMetadata } from "@/lib/toolSeoHelper";
import SignClient from "./components/SignClient";

export const metadata = getToolMetadata("/sign").metadata;

export default function SignPage() {
  return <SignClient />;
}
