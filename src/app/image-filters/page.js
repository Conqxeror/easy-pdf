import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageFiltersClient from "./components/ImageFiltersClient";

export const metadata = getToolMetadata("/image-filters").metadata;

export default function ImageFiltersPage() {
  return <ImageFiltersClient />;
}
