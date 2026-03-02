/**
 * Morgan Stanley 1099-B PDF Parser
 *
 * Handles TWO formats:
 *
 * 1. "Stock Plan Account" (Morgan Stanley AT WORK) — 3-line format:
 *    Line 1: Description (e.g., "VIMEO INC")
 *    Line 2: CUSIP (e.g., "92719V100")
 *    Line 3: Data (qty, dates, $proceeds, $costBasis, [$washSale], [$fedTax])
 *
 * 2. "E*TRADE from Morgan Stanley" consolidated — 2-line format:
 *    Line 1: "APPLE INC  CUSIP: 037833100  Symbol: AAPL"
 *    Line 2: Data (qty, dates, proceeds, costBasis, accruedDiscount, washSale, gainLoss, fedTax)
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

    // Must have transaction-related content
    const hasSection =
      /Short Term|Long Term/i.test(text) && /Securities/i.test(text);
    const hasColumnHeaders = text.includes("Box 1d");
    const hasDollarAmounts = /\$[\d,]+\.\d{2}/.test(text);

    if (hasSection || hasColumnHeaders) {
      pages.push(text);
    } else if (hasDollarAmounts) {
      // Dollar amounts alone aren't enough (could be 1099-DIV summary page).
      // Require additional evidence: quantity pattern AND date pattern.
      const hasTransactionData =
        /\d+\.\d{3,}/.test(text) && /\d{2}\/\d{2}\/\d{2}/.test(text);
      if (hasTransactionData) {
        pages.push(text);
      }
    }
  }

  return pages;
}

/**
 * Detect section type from a line.
 * Returns { term, basisReported } or null if not a section header.
 *
 * Stock Plan:  "Short Term – Noncovered Securities*..."
 * E*TRADE:     "Short Term - Covered Securities  (Consider Box 12..."
 */
function parseSectionHeader(
  line: string
): { term: string; basisReported: string } | null {
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
 * Try to parse an E*TRADE-style description line with inline CUSIP and Symbol.
 * Format: "APPLE INC  CUSIP: 037833100  Symbol: AAPL"
 */
function parseEtradeDescriptionLine(
  line: string
): { description: string; cusip: string; symbol: string } | null {
  const match = line.match(
    /^(.+?)\s+CUSIP:\s*(\S+)(?:\s+Symbol:\s*(\S+))?/
  );
  if (!match) return null;
  return {
    description: match[1].trim(),
    cusip: match[2].trim(),
    symbol: match[3]?.trim() || "",
  };
}

/**
 * Check if a line is a CUSIP number (alphanumeric, typically 9 characters).
 */
function isCusipLine(line: string): boolean {
  return /^[A-Z0-9]{6,9}$/.test(line.trim());
}

/**
 * Check if a token looks like a dollar amount.
 * Matches: $1,234.56, $0.00, 0.00, ($1,031.97)
 */
function isMoneyToken(s: string): boolean {
  if (/^\$[\d,]+\.\d{2}$/.test(s)) return true;
  if (/^\(\$[\d,]+\.\d{2}\)$/.test(s)) return true;
  // Bare decimal with exactly 2 decimal places (not quantity which has 3+)
  if (/^[\d,]+\.\d{2}$/.test(s)) return true;
  return false;
}

/**
 * Parse a money token to a plain numeric string.
 * ($1,031.97) → "-1031.97", $8,525.76 → "8525.76", 0.00 → "0.00"
 */
function parseMoneyToken(s: string): string {
  if (s.startsWith("(") && s.endsWith(")")) {
    const inner = s.slice(1, -1);
    return "-" + inner.replace(/^\$/, "").replace(/,/g, "");
  }
  return s.replace(/^\$/, "").replace(/,/g, "");
}

/**
 * Check if a line is a total line we should skip.
 */
function isTotalLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^Total\s+(Short|Long)/i.test(trimmed)) return true;
  if (/^Total\s+Covered/i.test(trimmed)) return true;
  if (/^Total\s+IRS/i.test(trimmed)) return true;
  if (/^Total\s+Fed/i.test(trimmed)) return true;
  if (/^Form\s+1099-B\s+Total/i.test(trimmed)) return true;
  return false;
}

/**
 * Check if a line is a column header row we should skip.
 */
function isColumnHeader(line: string): boolean {
  const lower = line.trim().toLowerCase();
  return (
    lower.startsWith("description of property") ||
    lower.startsWith("description (box") ||
    lower.startsWith("quantity") ||
    lower.startsWith("(box ") ||
    /^date\s+(acquired|sold)/i.test(lower) ||
    lower.startsWith("cusip number") ||
    lower.startsWith("proceeds") ||
    lower.startsWith("cost or") ||
    lower.startsWith("other basis") ||
    lower.startsWith("wash") ||
    lower.startsWith("sale loss") ||
    lower.startsWith("disallowed") ||
    lower.startsWith("federal") ||
    lower.startsWith("income") ||
    lower.startsWith("tax withheld") ||
    lower.startsWith("check if") ||
    lower.startsWith("not allowed") ||
    lower.startsWith("based on") ||
    lower.startsWith("amount in") ||
    lower.startsWith("state name") ||
    lower.startsWith("state id") ||
    lower.startsWith("state tax") ||
    lower.startsWith("withheld") ||
    lower.startsWith("basis") ||
    lower.startsWith("accrued market") ||
    lower.startsWith("accrued") ||
    lower.startsWith("discount") ||
    lower.startsWith("gain/(loss)") ||
    lower.startsWith("gain/loss") ||
    lower.startsWith("amount")
  );
}

/**
 * Check if a line is boilerplate that should be skipped entirely.
 */
function isSkippableLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.includes("CONTINUED ON NEXT PAGE")) return true;
  if (trimmed.includes("IMPORTANT TAX INFORMATION")) return true;
  if (trimmed.includes("Security Subtotal")) return true;
  if (trimmed.includes("Gross Proceeds less")) return true;
  if (trimmed.includes("Consider IRS box")) return true;
  if (trimmed.includes("Consider the Net Proceeds")) return true;
  if (trimmed.includes("REALIZED GAIN/LOSS")) return true;
  if (trimmed.includes("1099-B TOTALS SUMMARY")) return true;
  if (trimmed.includes("Form 1099-B Total Reportable")) return true;
  if (/Noncovered securities are not subject/i.test(trimmed)) return true;
  if (trimmed.includes("E*TRADE from Morgan Stanley")) return true;
  if (trimmed.includes("ETRADE from Morgan Stanley")) return true;
  if (trimmed.includes("1099 Consolidated Tax Statement")) return true;
  if (trimmed.includes("Morgan Stanley Capital")) return true;
  if (trimmed.includes("Morgan Stanley Smith")) return true;
  if (trimmed.includes("This is important tax information")) return true;
  if (trimmed.includes("or other sanction")) return true;
  if (trimmed.includes("negligence penalty")) return true;
  if (trimmed.includes("IRS determines")) return true;
  if (trimmed.includes("Customer Service")) return true;
  if (trimmed.includes("Taxpayer ID")) return true;
  if (trimmed.includes("Account Number")) return true;
  if (trimmed.includes("Identification Number")) return true;
  if (trimmed.includes("transactions should be reported on")) return true;
  if (trimmed.includes("Part I with box") || trimmed.includes("Part II with box")) return true;
  if (/^Page\s+\d/i.test(trimmed)) return true;
  if (/^\d+\s+of\s+\d+$/.test(trimmed)) return true;
  return false;
}

/**
 * Try to parse a transaction data line.
 *
 * Stock Plan:  "317.000000 03/29/24 12/18/24 $2,171.58 $1,296.53"
 * E*TRADE:     "40.000 01/31/24 06/28/24 $8,525.76 $6,269.60 $0.00 $0.00 $2,256.16 $0.00"
 *              "155.000 05/15/24 06/28/24 $32,999.36 $0.00 0.00 $0.00 $32,999.36 $0.00"
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
  accruedMarketDiscount: string;
  washSaleLoss: string;
  gainLoss: string;
  fedTaxWithheld: string;
} | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Must start with a number (the quantity)
  if (!/^[\d,]/.test(trimmed)) return null;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 4) return null;

  // First token: quantity (e.g., "317.000000" or "1,002.000000" or "40.000")
  const quantity = tokens[0].replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(quantity)) return null;

  // Next tokens: date acquired and date sold
  let dateAcquired: string;
  let dateSold: string;
  let dollarStartIdx: number;

  if (tokens[1] === "VARIOUS") {
    dateAcquired = "VARIOUS";
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

  // Collect money-like tokens after dates
  const moneyTokens: string[] = [];
  for (let i = dollarStartIdx; i < tokens.length; i++) {
    if (isMoneyToken(tokens[i])) {
      moneyTokens.push(tokens[i]);
    }
    // Skip non-money tokens (like checkbox □) but keep collecting
  }

  if (moneyTokens.length < 2) return null;

  let proceeds = "";
  let costBasis = "";
  let accruedMarketDiscount = "";
  let washSaleLoss = "";
  let gainLoss = "";
  let fedTaxWithheld = "";

  if (moneyTokens.length >= 6) {
    // E*TRADE format: proceeds, costBasis, accruedDiscount, washSale, gainLoss, fedTax
    proceeds = parseMoneyToken(moneyTokens[0]);
    costBasis = parseMoneyToken(moneyTokens[1]);
    accruedMarketDiscount = parseMoneyToken(moneyTokens[2]);
    washSaleLoss = parseMoneyToken(moneyTokens[3]);
    gainLoss = parseMoneyToken(moneyTokens[4]);
    fedTaxWithheld = parseMoneyToken(moneyTokens[5]);
  } else {
    // Stock Plan format: proceeds, costBasis, [washSale], [fedTax]
    proceeds = parseMoneyToken(moneyTokens[0]);
    costBasis = parseMoneyToken(moneyTokens[1]);
    if (moneyTokens.length >= 3) {
      washSaleLoss = parseMoneyToken(moneyTokens[2]);
    }
    if (moneyTokens.length >= 4) {
      fedTaxWithheld = parseMoneyToken(moneyTokens[3]);
    }
  }

  return {
    quantity,
    dateAcquired,
    dateSold,
    proceeds,
    costBasis,
    accruedMarketDiscount,
    washSaleLoss,
    gainLoss,
    fedTaxWithheld,
  };
}

/**
 * Try to parse a combined description + data line (Stock Plan Account format
 * where pdfjs-dist merges them into one line by Y coordinate).
 * e.g., "VIMEO INC 317.000000 03/29/24 12/18/24 $2,171.58 $1,296.53"
 *        "ALPHABET INC CL C 130.000000 VARIOUS 02/20/24 $18,589.85 $3,761.00"
 */
function parseCombinedDescriptionData(
  line: string
): {
  description: string;
  data: NonNullable<ReturnType<typeof parseTransactionData>>;
} | null {
  const trimmed = line.trim();
  // Must start with uppercase letter (description) and contain $ (data)
  if (!/^[A-Z]/.test(trimmed) || !trimmed.includes("$")) return null;

  // Find the transition point where quantity starts
  // Look for: uppercase text, then a quantity like "317.000000" or "130.000000"
  const match = trimmed.match(
    /^([A-Z][A-Z\s,.\-&/']+?)\s+(\d[\d,]*\.\d+\s+(?:VARIOUS|\d{2}\/\d{2}\/\d{2})\s+.+)$/
  );
  if (!match) return null;

  const description = match[1].trim();
  const dataStr = match[2].trim();

  // Description must be at least 2 chars of actual letters
  const letterCount = (description.match(/[A-Z]/g) || []).length;
  if (letterCount < 2) return null;

  // Try parsing the data portion
  const data = parseTransactionData(dataStr);
  if (!data) return null;

  return { description, data };
}

/**
 * Check if a line looks like a security description (Stock Plan Account format).
 * These are all caps: "VIMEO INC", "ALPHABET INC CL C"
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
  if (trimmed.includes("COPY B")) return false;
  if (trimmed.includes("Account number")) return false;
  if (trimmed.includes("SS #")) return false;
  if (trimmed.includes("TAX ID")) return false;
  if (trimmed.includes("Questions call")) return false;
  if (trimmed.includes("OMB No")) return false;
  if (trimmed.includes("OMB NO")) return false;
  if (trimmed.includes("tax information")) return false;
  if (trimmed.includes("TAX INFORMATION")) return false;
  if (trimmed.includes("negligence")) return false;
  if (trimmed.includes("imposed on")) return false;
  if (trimmed.includes("Payer")) return false;
  if (trimmed.includes("NEW YORK")) return false;
  if (trimmed.includes("Page:")) return false;
  if (trimmed.includes("Page ")) return false;
  if (trimmed.includes("Reported to IRS")) return false;
  if (trimmed.includes("gross proceeds")) return false;
  if (trimmed.includes("Gross Proceeds")) return false;
  if (trimmed.includes("Box ")) return false;
  if (trimmed.includes("BOX ")) return false;
  if (/^(Short|Long)\s+Term/i.test(trimmed)) return false;
  if (/Securities/i.test(trimmed) && /term/i.test(trimmed)) return false;
  if (/^\d/.test(trimmed)) return false;
  if (isColumnHeader(trimmed)) return false;
  if (trimmed.includes("Description of property")) return false;
  if (trimmed.includes("IMPORTANT TAX")) return false;
  if (trimmed.includes("Noncovered securities")) return false;
  if (trimmed.includes("disallowed loss")) return false;
  if (trimmed.includes("tax laws")) return false;
  if (trimmed.includes("tax advisor")) return false;
  if (trimmed.includes("taxpayer")) return false;
  if (trimmed.includes("(continued)")) return false;
  if (trimmed.includes("(Continued)")) return false;
  if (trimmed.includes("Form 1099")) return false;
  if (trimmed.includes("FORM 1099")) return false;
  if (trimmed.includes("Broker and Barter")) return false;
  if (trimmed.includes("BROKER AND BARTER")) return false;
  if (trimmed.includes("NOTE:")) return false;
  if (trimmed.includes("compensation")) return false;
  if (trimmed.includes("CUSIP:")) return false; // E*TRADE inline CUSIP
  if (trimmed.includes("Symbol:")) return false; // E*TRADE inline Symbol
  if (trimmed.includes("CONTINUED")) return false;
  if (trimmed.includes("BARTER")) return false;
  if (trimmed.includes("EXCHANGE TRANSACTION")) return false;
  if (trimmed.includes("PROCEEDS FROM")) return false;
  if (trimmed.includes("REALIZED")) return false;
  // E*TRADE column header keywords that are all-caps
  if (trimmed.includes("ACQUIRED") && trimmed.includes("SOLD")) return false;
  if (trimmed.includes("OTHER BASIS")) return false;
  if (trimmed.includes("TAX WITHHELD")) return false;
  if (trimmed.includes("DISALLOWED")) return false;
  if (trimmed.includes("GAIN/")) return false;
  if (trimmed.includes("FEDERAL")) return false;
  if (trimmed.includes("ACCRUED")) return false;

  // Should be primarily uppercase letters and spaces (security names)
  if (!/^[A-Z][A-Z\s,.\-&/']+$/.test(trimmed)) return false;

  // Must have at least 2 actual letters
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
  let currentSymbol = "";
  let expectCusip = false;
  let lastTransactionNeedsCusip = false;

  for (const pageText of pages) {
    const lines = pageText.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for section header BEFORE skipping boilerplate
      // (section headers may contain skippable phrases like "transactions should be reported on")
      const section = parseSectionHeader(trimmed);
      if (section) {
        currentTerm = section.term;
        currentBasisReported = section.basisReported;
        continue;
      }

      // Skip boilerplate
      if (isSkippableLine(trimmed)) continue;

      // Skip total lines
      if (isTotalLine(trimmed)) continue;

      // Skip column headers
      if (isColumnHeader(trimmed)) continue;

      // Try E*TRADE description line (with inline CUSIP: and Symbol:)
      const etrade = parseEtradeDescriptionLine(trimmed);
      if (etrade) {
        currentDescription = etrade.description;
        currentCusip = etrade.cusip;
        currentSymbol = etrade.symbol;
        expectCusip = false;
        lastTransactionNeedsCusip = false;
        continue;
      }

      // If we're expecting a CUSIP after a description or combined line
      if (expectCusip) {
        if (isCusipLine(trimmed)) {
          currentCusip = trimmed;
          expectCusip = false;
          // Update the last transaction if it was created without CUSIP
          if (
            lastTransactionNeedsCusip &&
            transactions.length > 0 &&
            transactions[transactions.length - 1].cusip === ""
          ) {
            transactions[transactions.length - 1].cusip = trimmed;
            lastTransactionNeedsCusip = false;
          }
          continue;
        }
        expectCusip = false;
      }

      // Try combined description + data line (Stock Plan format where
      // pdfjs-dist merges description and data on the same line)
      const combined = parseCombinedDescriptionData(trimmed);
      if (combined) {
        currentDescription = combined.description;
        currentCusip = "";
        currentSymbol = "";
        expectCusip = true;
        lastTransactionNeedsCusip = true;

        const cData = combined.data;
        const gainLoss =
          cData.gainLoss ||
          (cData.proceeds && cData.costBasis
            ? (
                parseFloat(cData.proceeds) - parseFloat(cData.costBasis)
              ).toFixed(2)
            : "");

        transactions.push({
          description: currentDescription,
          symbol: "",
          cusip: "", // will be updated when CUSIP line follows
          quantity: cData.quantity,
          dateAcquired: cData.dateAcquired,
          dateSold: cData.dateSold,
          proceeds: cData.proceeds,
          costBasis: cData.costBasis,
          accruedMarketDiscount: cData.accruedMarketDiscount,
          washSaleLoss: cData.washSaleLoss,
          gainLoss,
          fedTaxWithheld: cData.fedTaxWithheld,
          stateTaxWithheld: "",
          term: currentTerm,
          basisReported: currentBasisReported,
          additionalInfo: "",
          grossNet: "G",
          gainLossCode: "",
        });
        continue;
      }

      // Check for Stock Plan description line (standalone, no data)
      if (isDescriptionLine(trimmed)) {
        currentDescription = trimmed;
        currentCusip = "";
        currentSymbol = "";
        expectCusip = true;
        lastTransactionNeedsCusip = false;
        continue;
      }

      // Check for CUSIP line (standalone)
      if (isCusipLine(trimmed) && currentDescription) {
        currentCusip = trimmed;
        // Update the last transaction if it was created without CUSIP
        if (
          lastTransactionNeedsCusip &&
          transactions.length > 0 &&
          transactions[transactions.length - 1].cusip === ""
        ) {
          transactions[transactions.length - 1].cusip = trimmed;
          lastTransactionNeedsCusip = false;
        }
        continue;
      }

      // Try to parse as transaction data
      const data = parseTransactionData(trimmed);
      if (data && currentDescription) {
        lastTransactionNeedsCusip = false;
        const gainLoss =
          data.gainLoss ||
          (data.proceeds && data.costBasis
            ? (
                parseFloat(data.proceeds) - parseFloat(data.costBasis)
              ).toFixed(2)
            : "");

        transactions.push({
          description: currentDescription,
          symbol: currentSymbol,
          cusip: currentCusip,
          quantity: data.quantity,
          dateAcquired: data.dateAcquired,
          dateSold: data.dateSold,
          proceeds: data.proceeds,
          costBasis: data.costBasis,
          accruedMarketDiscount: data.accruedMarketDiscount,
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
