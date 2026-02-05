/**
 * Shared types for all broker parsers.
 */

export interface Transaction {
  description: string;
  symbol: string;
  cusip: string;
  quantity: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: string;
  costBasis: string;
  accruedMarketDiscount: string;
  washSaleLoss: string;
  gainLoss: string;
  fedTaxWithheld: string;
  stateTaxWithheld: string;
  term: string;
  basisReported: string;
  additionalInfo: string;
  grossNet: string;
  gainLossCode: string;
}

export type BrokerType = "fidelity" | "robinhood" | "schwab" | "unknown";

export interface ParseResult {
  broker: BrokerType;
  transactions: Transaction[];
  summary: ParseSummary;
  error?: string;
}

export interface ParseSummary {
  totalTransactions: number;
  uniqueSecurities: number;
  totalProceeds: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalWashSales: number;
  shortTermCount: number;
  longTermCount: number;
}

export function createEmptyTransaction(): Transaction {
  return {
    description: "",
    symbol: "",
    cusip: "",
    quantity: "",
    dateAcquired: "",
    dateSold: "",
    proceeds: "",
    costBasis: "",
    accruedMarketDiscount: "",
    washSaleLoss: "",
    gainLoss: "",
    fedTaxWithheld: "",
    stateTaxWithheld: "",
    term: "",
    basisReported: "",
    additionalInfo: "",
    grossNet: "",
    gainLossCode: "",
  };
}

export function computeSummary(transactions: Transaction[]): ParseSummary {
  let totalProceeds = 0;
  let totalCostBasis = 0;
  let totalGainLoss = 0;
  let totalWashSales = 0;
  let shortTermCount = 0;
  let longTermCount = 0;
  const securities = new Set<string>();

  for (const txn of transactions) {
    const p = parseFloat((txn.proceeds || "0").replace(/,/g, "").replace(/[GN]$/, ""));
    if (!isNaN(p)) totalProceeds += p;

    const c = txn.costBasis === "Not Provided" ? 0 : parseFloat((txn.costBasis || "0").replace(/,/g, ""));
    if (!isNaN(c)) totalCostBasis += c;

    const g = parseFloat((txn.gainLoss || "0").replace(/,/g, ""));
    if (!isNaN(g)) totalGainLoss += g;

    if (txn.washSaleLoss) {
      const w = parseFloat(txn.washSaleLoss.replace(/,/g, ""));
      if (!isNaN(w)) totalWashSales += w;
    }

    if (txn.description) securities.add(txn.description);
    if (txn.term.toLowerCase().includes("short")) shortTermCount++;
    else if (txn.term.toLowerCase().includes("long")) longTermCount++;
  }

  return {
    totalTransactions: transactions.length,
    uniqueSecurities: securities.size,
    totalProceeds: Math.round(totalProceeds * 100) / 100,
    totalCostBasis: Math.round(totalCostBasis * 100) / 100,
    totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    totalWashSales: Math.round(totalWashSales * 100) / 100,
    shortTermCount,
    longTermCount,
  };
}
