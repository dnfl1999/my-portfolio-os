import { emptyPortfolioData } from "../data/mockData";
import { PortfolioData } from "../types";
import { PersistedPortfolioData } from "../types/storage";
import { normalizePortfolioData } from "../utils/portfolioData";
import { PortfolioRepository } from "./portfolioRepository";

const STORAGE_KEY = "my-portfolio-os";
const STORAGE_VERSION = 2;

export class LocalPortfolioRepository implements PortfolioRepository {
  async load(): Promise<PortfolioData> {
    if (typeof window === "undefined") {
      return emptyPortfolioData;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyPortfolioData;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedPortfolioData;
      if (parsed.version > STORAGE_VERSION) {
        return emptyPortfolioData;
      }

      return normalizePortfolioData(parsed);
    } catch {
      return emptyPortfolioData;
    }
  }

  async save(data: PortfolioData): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    const payload: PersistedPortfolioData = {
      ...data,
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }
}
