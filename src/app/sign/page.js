import { getToolMetadata } from "@/lib/toolSeoHelper";
import SignClient from "./components/SignClient";

export const metadata = getToolMetadata("/sign");

export default function SignPage() {
  return <SignClient />;
}
