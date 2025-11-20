import { getToolMetadata } from "@/lib/toolSeoHelper";
import UrlShortenerClient from "./components/UrlShortenerClient";

export const metadata = getToolMetadata("/url-shortener");

export default function UrlShortenerPage() {
  return <UrlShortenerClient />;
}
