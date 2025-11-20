import { getToolMetadata } from "@/lib/toolSeoHelper";
import PortfolioCreatorClient from "./components/PortfolioCreatorClient";

export const metadata = getToolMetadata("/portfolio-creator");

export default function PortfolioCreatorPage() {
  return <PortfolioCreatorClient />;
}
