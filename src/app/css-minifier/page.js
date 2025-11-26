import { getToolMetadata } from "@/lib/toolSeoHelper";
import CssMinifierClient from "./components/CssMinifierClient";

export const metadata = getToolMetadata("/css-minifier").metadata;

export default function CssMinifierPage() {
  return <CssMinifierClient />;
}
