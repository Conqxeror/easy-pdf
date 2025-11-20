import { getToolMetadata } from "@/lib/toolSeoHelper";
import JsMinifierClient from "./components/JsMinifierClient";

export const metadata = getToolMetadata("/js-minifier");

export default function JsMinifierPage() {
  return <JsMinifierClient />;
}
