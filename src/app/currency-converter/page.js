import { getToolMetadata } from "@/lib/toolSeoHelper";
import CurrencyConverterClient from "./components/CurrencyConverterClient";

export const metadata = getToolMetadata("/currency-converter");

export default function CurrencyConverterPage() {
  return <CurrencyConverterClient />;
}
