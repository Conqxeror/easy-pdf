import { getToolMetadata } from "@/lib/toolSeoHelper";
import RegexTesterClient from "./components/RegexTesterClient";

export const metadata = getToolMetadata("/regex-tester").metadata;

export default function RegexTesterPage() {
  return <RegexTesterClient />;
}
