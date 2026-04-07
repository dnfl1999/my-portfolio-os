import { PortfolioData } from "./index";

export interface PersistedPortfolioData extends PortfolioData {
  version: number;
  updatedAt: string;
}
