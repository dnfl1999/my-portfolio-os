import { PortfolioData } from "../types";

export interface PortfolioRepository {
  load(): Promise<PortfolioData>;
  save(data: PortfolioData): Promise<void>;
  clear(): Promise<void>;
}
