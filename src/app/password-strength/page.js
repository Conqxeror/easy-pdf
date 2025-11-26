import { getToolMetadata } from "@/lib/toolSeoHelper";
import PasswordStrengthClient from "./components/PasswordStrengthClient";

export const metadata = getToolMetadata("/password-strength").metadata;

export default function PasswordStrengthPage() {
  return <PasswordStrengthClient />;
}
