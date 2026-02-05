/**
 * Robinhood 1099-B PDF Parser
 * Port of robinhood_pdf_to_csv.py to TypeScript.
 *
 * Parses Robinhood Consolidated Form 1099-B pages.
 * Format: Date-first columns, "..." for empty fields, W/D markers.
 *
 * Handles two transaction formats:
 * 1. Single transactions: date-first line with all fields
 * 2. Batch transactions: header line "N transactions for MM/DD/YY..." followed
 *    by individual lines WITHOUT a date sold, then a "Total of N transactions"
 *    summary line (which we skip to avoid double-counting).
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
 * 'DELTA AIR LINES, INC. / CUSIP: 247361702 / Symbol: DAL'
 * Also handles options with blank CUSIP/Symbol:
 * 'AAL 12/04/2020 CALL $15.00 / CUSIP: / Symbol:'
 */
function parseDescriptionLine(
  line: string
): { description: string; cusip: string; symbol: string } | null {
  line = line.trim();
  if (!line) return null;

  // Must contain "/ CUSIP:" to be a description line
  if (!/\/\s*CUSIP:/.test(line)) return null;

  // Extract CUSIP (may be blank for options)
  const cusipMatch = line.match(/\/\s*CUSIP:\s*(\w*)/);
  const cusip = cusipMatch ? cusipMatch[1].trim() : "";

  // Extract description (everything before "/ CUSIP:")
  const descMatch = line.match(/^(.+?)\s*\/\s*CUSIP:/);
  const description = descMatch ? descMatch[1].trim() : "";

  // Extract symbol (may be blank)
  const symbolMatch = line.match(/\/\s*Symbol:\s*(\w*)/);
  const symbol = symbolMatch ? symbolMatch[1].trim() : "";

  return { description, cusip, symbol };
}

/**
 * Parse a transaction line that starts with a date. Robinhood format:
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

  // Skip "Total of N transactions" aggregation lines — these duplicate individual entries
  if (/Total of \d+ transactions/i.test(line)) return null;

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
 * Parse a batch transaction line (no date sold at start). Format:
 * '1.000 85.99 12/01/20 26.00 ... 59.99 1 of 3 - Option sale to close-call'
 * These appear under a "N transactions for MM/DD/YY" header.
 */
function parseBatchTransactionLine(
  line: string,
  batchDateSold: string
): Partial<Transaction> | null {
  line = line.trim();
  if (!line) return null;

  // Should NOT start with a date (those are handled by parseTransactionLine)
  if (/^\d{2}\/\d{2}\/\d{2}\s/.test(line)) return null;

  // Must contain "X of Y" pattern to be a batch sub-transaction
  if (!/\d+ of \d+/.test(line)) return null;

  const tokens = line.split(/\s+/);
  if (tokens.length < 6) return null;

  try {
    const quantity = tokens[0];
    const proceeds = tokens[1];
    const dateAcquired = tokens[2]; // "MM/DD/YY"
    const costBasis = tokens[3];

    // Parse wash sale / accrued market discount column
    let idx = 4;
    let washSaleOrDiscount = "";
    let washSaleType = "";

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
      dateSold: batchDateSold,
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
  let batchDateSold = ""; // Date sold for batch transaction groups

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
        batchDateSold = ""; // Reset batch context on new security
        continue;
      }

      // Check for batch transaction header:
      // "3 transactions for 12/03/20. Total proceeds and cost reported to the IRS."
      const batchHeader = trimmed.match(
        /^\d+ transactions? for (\d{2}\/\d{2}\/\d{2})\./
      );
      if (batchHeader) {
        batchDateSold = batchHeader[1];
        continue;
      }

      // Check for regular transaction (starts with date)
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
        batchDateSold = ""; // Clear batch context after a dated line
        continue;
      }

      // Check for batch sub-transaction (no date, part of a batch group)
      if (batchDateSold) {
        const batchTxn = parseBatchTransactionLine(trimmed, batchDateSold);
        if (batchTxn) {
          let grossNet = "";
          let cleanProceeds = batchTxn.proceeds || "";
          if (cleanProceeds.endsWith("G") || cleanProceeds.endsWith("N")) {
            grossNet = cleanProceeds.slice(-1);
            cleanProceeds = cleanProceeds.slice(0, -1).trim();
          }

          transactions.push({
            description: currentSecurity.description,
            cusip: currentSecurity.cusip,
            symbol: currentSecurity.symbol,
            quantity: batchTxn.quantity || "",
            dateAcquired: batchTxn.dateAcquired || "",
            dateSold: batchTxn.dateSold || "",
            proceeds: cleanProceeds,
            costBasis: batchTxn.costBasis || "",
            accruedMarketDiscount: batchTxn.accruedMarketDiscount || "",
            washSaleLoss: batchTxn.washSaleLoss || "",
            gainLoss: batchTxn.gainLoss || "",
            gainLossCode: batchTxn.gainLossCode || "",
            additionalInfo: batchTxn.additionalInfo || "",
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
  }

  return transactions;
}
