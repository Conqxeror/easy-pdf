import { getToolMetadata } from "@/lib/toolSeoHelper";
import UrlShortenerClient from "./components/UrlShortenerClient";

export const metadata = getToolMetadata("/url-shortener").metadata;

export default function UrlShortenerPage() {
  return <UrlShortenerClient />;
}
