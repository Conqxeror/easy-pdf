import { getToolMetadata } from "@/lib/toolSeoHelper";
import UnitConverterClient from "./components/UnitConverterClient";

export const metadata = getToolMetadata("/unit-converter");

export default function UnitConverterPage() {
  return <UnitConverterClient />;
}
