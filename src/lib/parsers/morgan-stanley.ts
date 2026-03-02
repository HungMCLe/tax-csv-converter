/**
 * Morgan Stanley 1099-B PDF Parser
 *
 * Parses Morgan Stanley "Stock Plan Account" 1099-B pages.
 * Format: Multi-line transactions:
 *   Line 1: Security description (e.g., "VIMEO INC")
 *   Line 2: CUSIP number (e.g., "92719V100")
 *   Line 3: Quantity, dates, dollar amounts (e.g., "317.000000 03/29/24 12/18/24 $2,171.58 $1,296.53")
 *
 * Sections: "Short Term – Covered Securities", "Long Term – Noncovered Securities*", etc.
 */

import { Transaction } from "./types";

/**
 * Filter pages that contain 1099-B transaction data.
 */
function extract1099bPages(pagesText: string[]): string[] {
  const pages: string[] = [];

  for (const text of pagesText) {
    // Must reference 1099-B
    if (!text.includes("1099-B") && !text.includes("1099-b")) continue;

    // Skip instruction pages and blank pages
    if (text.includes("Instructions for Recipient")) continue;
    if (/This page.*intentionally\s+blank/i.test(text)) continue;

    // Must have transaction-related content:
    // Either section headers or column headers or actual $ amounts
    const hasSection =
      /Short Term|Long Term/i.test(text) &&
      /Securities/i.test(text);
    const hasColumnHeaders =
      text.includes("Box 1d") || text.includes("Proceeds");
    const hasDollarAmounts = /\$[\d,]+\.\d{2}/.test(text);

    if (hasSection || hasColumnHeaders || hasDollarAmounts) {
      pages.push(text);
    }
  }

  return pages;
}

/**
 * Detect section type from a line.
 * Returns { term, basisReported } or null if not a section header.
 *
 * Examples:
 *   "Short Term – Noncovered Securities*..."  → { term: "Short-Term", basisReported: "No" }
 *   "Long Term – Covered Securities..."       → { term: "Long-Term", basisReported: "Yes" }
 *   "Long Term – Noncovered Securities* (continued)" → same, continuation
 */
function parseSectionHeader(
  line: string
): { term: string; basisReported: string } | null {
  // Match "Short Term" or "Long Term" followed by "Covered" or "Noncovered"
  const match = line.match(
    /^(Short|Long)\s+Term\s+.+?(Noncovered|Covered)\s+Securities/i
  );
  if (!match) return null;

  const term =
    match[1].toLowerCase() === "short" ? "Short-Term" : "Long-Term";
  const basisReported =
    match[2].toLowerCase() === "noncovered" ? "No" : "Yes";

  return { term, basisReported };
}

/**
 * Check if a line is a CUSIP number (alphanumeric, typically 9 characters).
 */
function isCusipLine(line: string): boolean {
  return /^[A-Z0-9]{6,9}$/.test(line.trim());
}

/**
 * Check if a line is a total line we should skip.
 * e.g., "Total Short Term – Noncovered Securities $2,171.58 $1,296.53"
 */
function isTotalLine(line: string): boolean {
  return /^Total\s+(Short|Long)\s+Term/i.test(line.trim());
}

/**
 * Check if a line is a column header row we should skip.
 */
function isColumnHeader(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("Description of property") ||
    trimmed.startsWith("Quantity") ||
    trimmed.startsWith("(Box 1a)") ||
    /^Date\s+(acquired|sold)/i.test(trimmed) ||
    /^\(Box \d/.test(trimmed) ||
    trimmed.startsWith("CUSIP Number") ||
    trimmed.startsWith("Proceeds") ||
    trimmed.startsWith("Cost or other") ||
    trimmed.startsWith("Wash") ||
    trimmed.startsWith("sale loss") ||
    trimmed.startsWith("disallowed") ||
    trimmed.startsWith("Federal") ||
    trimmed.startsWith("income") ||
    trimmed.startsWith("tax withheld") ||
    trimmed.startsWith("Check if") ||
    trimmed.startsWith("not allowed") ||
    trimmed.startsWith("based on") ||
    trimmed.startsWith("amount in") ||
    trimmed.startsWith("State Name") ||
    trimmed.startsWith("State ID") ||
    trimmed.startsWith("State tax") ||
    trimmed.startsWith("withheld") ||
    trimmed.startsWith("basis")
  );
}

/**
 * Try to parse a transaction data line.
 * Format: "317.000000 03/29/24 12/18/24 $2,171.58 $1,296.53"
 * Or:     "130.000000 VARIOUS 02/20/24 $18,589.85 $3,761.00"
 * Or with wash sale: "100.000000 01/15/24 03/20/24 $5,000.00 $4,500.00 $200.00"
 *
 * Returns parsed fields or null if not a data line.
 */
function parseTransactionData(
  line: string
): {
  quantity: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: string;
  costBasis: string;
  washSaleLoss: string;
  fedTaxWithheld: string;
} | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Must contain at least one $ amount
  if (!trimmed.includes("$")) return null;

  // Must start with a number (the quantity)
  if (!/^[\d,]/.test(trimmed)) return null;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 4) return null;

  // First token: quantity (e.g., "317.000000" or "1,002.000000")
  const quantity = tokens[0].replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(quantity)) return null;

  // Next tokens: date acquired and date sold
  let dateAcquired: string;
  let dateSold: string;
  let dollarStartIdx: number;

  if (tokens[1] === "VARIOUS") {
    dateAcquired = "VARIOUS";
    // tokens[2] should be date sold
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(tokens[2])) return null;
    dateSold = tokens[2];
    dollarStartIdx = 3;
  } else if (/^\d{2}\/\d{2}\/\d{2}$/.test(tokens[1])) {
    dateAcquired = tokens[1];
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(tokens[2])) return null;
    dateSold = tokens[2];
    dollarStartIdx = 3;
  } else {
    return null;
  }

  // Remaining tokens should be dollar amounts: $proceeds $costBasis [$washSale] [$fedTax]
  const dollarTokens = tokens.slice(dollarStartIdx);
  if (dollarTokens.length < 2) return null;

  // Strip $ and commas from dollar amounts
  const parseDollar = (s: string): string => {
    return s.replace(/^\$/, "").replace(/,/g, "");
  };

  // Verify first two are dollar amounts
  if (!dollarTokens[0].startsWith("$") || !dollarTokens[1].startsWith("$")) {
    return null;
  }

  const proceeds = parseDollar(dollarTokens[0]);
  const costBasis = parseDollar(dollarTokens[1]);

  let washSaleLoss = "";
  let fedTaxWithheld = "";

  if (dollarTokens.length >= 3 && dollarTokens[2].startsWith("$")) {
    washSaleLoss = parseDollar(dollarTokens[2]);
  }
  if (dollarTokens.length >= 4 && dollarTokens[3].startsWith("$")) {
    fedTaxWithheld = parseDollar(dollarTokens[3]);
  }

  return {
    quantity,
    dateAcquired,
    dateSold,
    proceeds,
    costBasis,
    washSaleLoss,
    fedTaxWithheld,
  };
}

/**
 * Check if a line looks like a security description (not a CUSIP, not data, not header).
 * Morgan Stanley descriptions are all caps: "VIMEO INC", "ALPHABET INC CL C"
 */
function isDescriptionLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length < 2) return false;

  // Skip known non-description lines
  if (trimmed.startsWith("$")) return false;
  if (trimmed.startsWith("Total")) return false;
  if (trimmed.startsWith("*")) return false;
  if (trimmed.startsWith("(")) return false;
  if (trimmed.includes("1099")) return false;
  if (trimmed.includes("STOCK PLAN")) return false;
  if (trimmed.includes("Morgan Stanley")) return false;
  if (trimmed.includes("MORGAN STANLEY")) return false;
  if (trimmed.includes("Copy B")) return false;
  if (trimmed.includes("Account number")) return false;
  if (trimmed.includes("SS #")) return false;
  if (trimmed.includes("TAX ID")) return false;
  if (trimmed.includes("Questions call")) return false;
  if (trimmed.includes("OMB No")) return false;
  if (trimmed.includes("tax information")) return false;
  if (trimmed.includes("negligence")) return false;
  if (trimmed.includes("imposed on")) return false;
  if (trimmed.includes("Payer")) return false;
  if (trimmed.includes("NEW YORK")) return false;
  if (trimmed.includes("Page:")) return false;
  if (trimmed.includes("Page ")) return false;
  if (trimmed.includes("Reported to IRS")) return false;
  if (trimmed.includes("gross proceeds")) return false;
  if (trimmed.includes("Box ")) return false;
  if (/^(Short|Long)\s+Term/i.test(trimmed)) return false;
  if (/Securities/i.test(trimmed) && /term/i.test(trimmed)) return false;
  if (/^\d/.test(trimmed)) return false; // starts with digit = data or CUSIP-like
  if (isColumnHeader(trimmed)) return false;
  if (trimmed.includes("Description of property")) return false;
  if (trimmed.includes("IMPORTANT TAX")) return false;
  if (trimmed.includes("Noncovered securities")) return false;
  if (trimmed.includes("disallowed loss")) return false;
  if (trimmed.includes("tax laws")) return false;
  if (trimmed.includes("tax advisor")) return false;
  if (trimmed.includes("taxpayer")) return false;
  if (trimmed.includes("(continued)")) return false;
  if (trimmed.includes("Form 1099")) return false;
  if (trimmed.includes("Broker and Barter")) return false;
  if (trimmed.includes("NOTE:")) return false;
  if (trimmed.includes("compensation")) return false;

  // Should be primarily uppercase letters and spaces (security names)
  // Allow: letters, spaces, commas, periods, hyphens, ampersands
  if (!/^[A-Z][A-Z\s,.\-&/']+$/.test(trimmed)) return false;

  // Must be at least 2 characters of actual letters
  const letterCount = (trimmed.match(/[A-Z]/g) || []).length;
  if (letterCount < 2) return false;

  return true;
}

/**
 * Parse all 1099-B pages and return transaction list.
 */
export function parseMorganStanleyTransactions(
  pagesText: string[]
): Transaction[] {
  const pages = extract1099bPages(pagesText);

  if (pages.length === 0) {
    throw new Error(
      "No 1099-B broker transactions found in this Morgan Stanley PDF."
    );
  }

  const transactions: Transaction[] = [];
  let currentTerm = "";
  let currentBasisReported = "";
  let currentDescription = "";
  let currentCusip = "";
  let expectCusip = false;

  for (const pageText of pages) {
    const lines = pageText.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for section header
      const section = parseSectionHeader(trimmed);
      if (section) {
        currentTerm = section.term;
        currentBasisReported = section.basisReported;
        continue;
      }

      // Skip total lines
      if (isTotalLine(trimmed)) continue;

      // Skip column headers
      if (isColumnHeader(trimmed)) continue;

      // If we're expecting a CUSIP after a description
      if (expectCusip) {
        if (isCusipLine(trimmed)) {
          currentCusip = trimmed;
          expectCusip = false;
          continue;
        }
        // Not a CUSIP — might be a data line if description had no CUSIP
        expectCusip = false;
      }

      // Check for description line
      if (isDescriptionLine(trimmed)) {
        currentDescription = trimmed;
        currentCusip = "";
        expectCusip = true;
        continue;
      }

      // Check for CUSIP line (standalone, after description was already set)
      if (isCusipLine(trimmed) && currentDescription) {
        currentCusip = trimmed;
        continue;
      }

      // Try to parse as transaction data
      const data = parseTransactionData(trimmed);
      if (data && currentDescription) {
        const gainLoss =
          data.proceeds && data.costBasis
            ? (
                parseFloat(data.proceeds) - parseFloat(data.costBasis)
              ).toFixed(2)
            : "";

        transactions.push({
          description: currentDescription,
          symbol: "",
          cusip: currentCusip,
          quantity: data.quantity,
          dateAcquired: data.dateAcquired,
          dateSold: data.dateSold,
          proceeds: data.proceeds,
          costBasis: data.costBasis,
          accruedMarketDiscount: "",
          washSaleLoss: data.washSaleLoss,
          gainLoss,
          fedTaxWithheld: data.fedTaxWithheld,
          stateTaxWithheld: "",
          term: currentTerm,
          basisReported: currentBasisReported,
          additionalInfo: "",
          grossNet: "G",
          gainLossCode: "",
        });
      }
    }
  }

  return transactions;
}
