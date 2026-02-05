/**
 * Robinhood 1099-B PDF Parser
 * Port of robinhood_pdf_to_csv.py to TypeScript.
 *
 * Parses Robinhood Consolidated Form 1099-B pages.
 * Format: Date-first columns, "..." for empty fields, W/D markers.
 */

import { Transaction } from "./types";

/**
 * Filter pages that contain 1099-B transaction data.
 */
function extract1099bPages(pagesText: string[]): string[] {
  const pages: string[] = [];
  for (const text of pagesText) {
    if (!text.includes("Proceeds from Broker and Barter Exchange Transactions"))
      continue;
    if (
      text.includes("SHORT TERM TRANSACTIONS") ||
      text.includes("LONG TERM TRANSACTIONS") ||
      text.includes("UNDETERMINED TERM") ||
      text.includes("Security total:") ||
      text.includes("Securitytotal:")
    ) {
      pages.push(text);
    }
  }
  return pages;
}

/**
 * Parse a security description line like:
 * 'DELTA AIR LINES, INC. / CUSIP: 247361702 / Symbol:'
 */
function parseDescriptionLine(
  line: string
): { description: string; cusip: string; symbol: string } | null {
  line = line.trim();
  if (!line) return null;

  const cusipMatch = line.match(/\/\s*CUSIP:\s*(\w+)/);
  if (!cusipMatch) return null;

  const cusip = cusipMatch[1];

  const descMatch = line.match(/^(.+?)\s*\/\s*CUSIP:/);
  const description = descMatch ? descMatch[1].trim() : "";

  const symbolMatch = line.match(/\/\s*Symbol:\s*(\w*)/);
  const symbol = symbolMatch ? symbolMatch[1].trim() : "";

  return { description, cusip, symbol };
}

/**
 * Parse a transaction line. Robinhood format:
 * '03/24/25 62.729 3,069.84 03/24/25 3,000.00 ... 69.84 Sale'
 * '11/25/25 1,332.406 45,368.16 Various 61,000.00 15,631.84 W 0.00 Sale'
 */
function parseTransactionLine(line: string): Partial<Transaction> | null {
  line = line.trim();
  if (!line) return null;

  // Must start with a date MM/DD/YY
  if (!/^\d{2}\/\d{2}\/\d{2}\s/.test(line)) return null;

  // Skip summary lines
  if (/ecurity/i.test(line) || /otals/i.test(line)) return null;

  const tokens = line.split(/\s+/);
  if (tokens.length < 7) return null;

  try {
    const dateSold = tokens[0];
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(dateSold)) return null;

    const quantity = tokens[1];
    const proceeds = tokens[2];
    const dateAcquired = tokens[3]; // "MM/DD/YY" or "Various"
    const costBasis = tokens[4];

    // Parse wash sale / accrued market discount column
    let idx = 5;
    let washSaleOrDiscount = "";
    let washSaleType = ""; // W or D

    if (tokens[idx] === "...") {
      idx++;
    } else {
      washSaleOrDiscount = tokens[idx];
      idx++;
      if (idx < tokens.length && (tokens[idx] === "W" || tokens[idx] === "D")) {
        washSaleType = tokens[idx];
        idx++;
      }
    }

    // Gain or loss
    let gainLoss = "";
    let gainLossCode = "";
    if (idx < tokens.length) {
      gainLoss = tokens[idx];
      idx++;
      if (idx < tokens.length && (tokens[idx] === "X" || tokens[idx] === "Z")) {
        gainLossCode = tokens[idx];
        idx++;
      }
    }

    // Additional information
    const additionalInfo = idx < tokens.length ? tokens.slice(idx).join(" ") : "";

    // Separate into accrued_market_discount and wash_sale_loss based on type
    let accruedMarketDiscount = "";
    let washSaleLoss = "";
    if (washSaleType === "W") {
      washSaleLoss = washSaleOrDiscount;
    } else if (washSaleType === "D") {
      accruedMarketDiscount = washSaleOrDiscount;
    } else if (washSaleOrDiscount) {
      washSaleLoss = washSaleOrDiscount;
    }

    return {
      dateSold,
      quantity,
      proceeds,
      dateAcquired,
      costBasis,
      accruedMarketDiscount,
      washSaleLoss,
      gainLoss,
      gainLossCode,
      additionalInfo,
    };
  } catch {
    return null;
  }
}

/**
 * Parse all 1099-B pages and return transaction list.
 */
export function parseRobinhoodTransactions(
  pagesText: string[]
): Transaction[] {
  const pages = extract1099bPages(pagesText);

  if (pages.length === 0) {
    throw new Error(
      "No 1099-B transaction pages found. This PDF may not contain Robinhood broker transactions."
    );
  }

  const transactions: Transaction[] = [];
  let currentSecurity = { description: "", cusip: "", symbol: "" };
  let currentTerm = "Short-Term";
  let currentBasisReported = "Yes";

  for (const pageText of pages) {
    // Determine term type and basis reporting from section headers
    if (pageText.includes("SHORT TERM TRANSACTIONS FOR COVERED TAX LOTS")) {
      currentTerm = "Short-Term";
      currentBasisReported = "Yes";
    } else if (
      pageText.includes("SHORT TERM TRANSACTIONS FOR NONCOVERED TAX LOTS")
    ) {
      currentTerm = "Short-Term";
      currentBasisReported = "No";
    } else if (
      pageText.includes("LONG TERM TRANSACTIONS FOR COVERED TAX LOTS")
    ) {
      currentTerm = "Long-Term";
      currentBasisReported = "Yes";
    } else if (
      pageText.includes("LONG TERM TRANSACTIONS FOR NONCOVERED TAX LOTS")
    ) {
      currentTerm = "Long-Term";
      currentBasisReported = "No";
    }

    for (const line of pageText.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for security description
      const desc = parseDescriptionLine(trimmed);
      if (desc) {
        currentSecurity = desc;
        continue;
      }

      // Check for transaction
      const txn = parseTransactionLine(trimmed);
      if (txn) {
        // Determine gross/net from proceeds
        let grossNet = "";
        let cleanProceeds = txn.proceeds || "";
        if (cleanProceeds.endsWith("G") || cleanProceeds.endsWith("N")) {
          grossNet = cleanProceeds.slice(-1);
          cleanProceeds = cleanProceeds.slice(0, -1).trim();
        }

        transactions.push({
          description: currentSecurity.description,
          cusip: currentSecurity.cusip,
          symbol: currentSecurity.symbol,
          quantity: txn.quantity || "",
          dateAcquired: txn.dateAcquired || "",
          dateSold: txn.dateSold || "",
          proceeds: cleanProceeds,
          costBasis: txn.costBasis || "",
          accruedMarketDiscount: txn.accruedMarketDiscount || "",
          washSaleLoss: txn.washSaleLoss || "",
          gainLoss: txn.gainLoss || "",
          gainLossCode: txn.gainLossCode || "",
          additionalInfo: txn.additionalInfo || "",
          grossNet,
          fedTaxWithheld: "",
          stateTaxWithheld: "",
          term: currentTerm,
          basisReported: currentBasisReported,
        });
        continue;
      }
    }
  }

  return transactions;
}
