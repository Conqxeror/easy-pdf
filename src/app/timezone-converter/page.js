import { getToolMetadata } from "@/lib/toolSeoHelper";
import TimezoneConverterClient from "./components/TimezoneConverterClient";

export const metadata = getToolMetadata("/timezone-converter");

export default function TimezoneConverterPage() {
  return <TimezoneConverterClient />;
}
