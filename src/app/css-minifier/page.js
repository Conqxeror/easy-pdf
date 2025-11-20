import { getToolMetadata } from "@/lib/toolSeoHelper";
import CssMinifierClient from "./components/CssMinifierClient";

export const metadata = getToolMetadata("/css-minifier");

export default function CssMinifierPage() {
  return <CssMinifierClient />;
}
