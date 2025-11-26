import { getToolMetadata } from "@/lib/toolSeoHelper";
import PortfolioCreatorClient from "./components/PortfolioCreatorClient";

export const metadata = getToolMetadata("/portfolio-creator").metadata;

export default function PortfolioCreatorPage() {
  return <PortfolioCreatorClient />;
}
