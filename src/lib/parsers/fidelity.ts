/**
 * Fidelity 1099-B PDF Parser
 * Port of fidelity_pdf_to_csv.py to TypeScript.
 *
 * Parses Fidelity 1099-B broker transaction pages.
 * Format: Single-line transactions starting with "Sale", comma-separated description headers.
 */

import { Transaction } from "./types";

/**
 * Filter pages that contain 1099-B transaction data.
 */
export function extract1099bPages(pagesText: string[]): {
  pages: string[];
  otherForms: string[];
} {
  const pages: string[] = [];
  const otherForms = new Set<string>();
  const fullText = pagesText.join("\n");

  for (const text of pagesText) {
    if (
      (text.includes("FORM 1099-B") || text.includes("1099-B")) &&
      text.includes("1a Description of property")
    ) {
      pages.push(text);
    }
  }

  // Detect other forms (check both normal and reversed text for reversed-encoding PDFs)
  const checks = [fullText];
  const reversedFull = fullText
    .split("\n")
    .map((line) => line.split("").reverse().join(""))
    .join("\n");
  checks.push(reversedFull);

  for (const txt of checks) {
    if (txt.includes("1099-DIV")) otherForms.add("1099-DIV (Dividends)");
    if (txt.includes("1099-INT")) otherForms.add("1099-INT (Interest)");
    if (txt.includes("1099-MISC"))
      otherForms.add("1099-MISC (Miscellaneous)");
    if (txt.includes("1099-OID"))
      otherForms.add("1099-OID (Original Issue Discount)");
    if (txt.includes("1099-R")) otherForms.add("1099-R (Retirement)");
    if (txt.includes("Accrued Interest") || txt.includes("tseretnI deurccA"))
      otherForms.add("Accrued Interest on Purchases");
  }

  return { pages, otherForms: Array.from(otherForms).sort() };
}

/**
 * Parse a security description header line like:
 * 'ALIBABA GROUP HOLDING LTD SPON ADSEACH R,BABA,01609W102'
 * 'APPLIED DNA SCIENCESINC COM NEW,03815U508'
 */
function parseDescriptionLine(
  line: string
): { description: string; symbol: string; cusip: string } | null {
  line = line.trim();
  if (!line) return null;

  const skipPrefixes = [
    "Sale",
    "Subtotals",
    "TOTALS",
    "Box ",
    "- ",
    "* ",
    "0 0",
    "FORM",
    "2025",
    "2024",
    "Short-term",
    "Long-term",
    "Proceeds",
    "(IRS",
    "1a ",
    "Action",
    "Acquired",
    "Discount",
    "CLAYTON",
    "Recipient",
    "01/",
    "if this",
  ];
  for (const prefix of skipPrefixes) {
    if (line.startsWith(prefix)) return null;
  }

  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 2) return null;

  // Last part should look like a CUSIP (alphanumeric, 5-9 chars)
  const cusipCandidate = parts[parts.length - 1];
  if (!/^[A-Z0-9]{5,9}$/.test(cusipCandidate)) return null;

  let description: string;
  let symbol: string;
  let cusip: string;

  if (parts.length >= 3) {
    description = parts.slice(0, -2).join(",").trim();
    symbol = parts[parts.length - 2].trim();
    cusip = parts[parts.length - 1].trim();
  } else {
    description = parts[0].trim();
    if (/\d/.test(parts[1])) {
      symbol = "";
      cusip = parts[1].trim();
    } else {
      symbol = parts[1].trim();
      cusip = "";
    }
  }

  return { description, symbol, cusip };
}

/**
 * Parse a sale transaction line like:
 * 'Sale 1.000 03/14/25 03/21/25 135.55 140.35 1.79 -4.80'
 */
function parseSaleLine(
  line: string
): Omit<Transaction, "description" | "symbol" | "cusip" | "term" | "basisReported"> | null {
  line = line.trim();
  if (!line.startsWith("Sale ")) return null;

  const tokens = line.split(/\s+/);
  if (tokens.length < 7) return null;

  try {
    const quantity = tokens[1];
    const dateAcquired = tokens[2];
    const dateSold = tokens[3];
    const proceeds = tokens[4];
    const costBasis = tokens[5];

    if (
      !/^\d{2}\/\d{2}\/\d{2}/.test(dateAcquired) ||
      !/^\d{2}\/\d{2}\/\d{2}/.test(dateSold)
    ) {
      return null;
    }

    const remaining = tokens.slice(6);
    let accruedMarketDiscount = "";
    let washSaleLoss = "";
    let gainLoss = "";
    let fedTaxWithheld = "";
    let stateTaxWithheld = "";

    if (remaining.length === 1) {
      gainLoss = remaining[0];
    } else if (remaining.length === 2) {
      const val1 = parseFloat(remaining[0]);
      const val2 = parseFloat(remaining[1]);
      if (val1 > 0 && val2 < 0) {
        washSaleLoss = remaining[0];
        gainLoss = remaining[1];
      } else if (val1 > 0 && val2 > 0) {
        accruedMarketDiscount = remaining[0];
        gainLoss = remaining[1];
      } else {
        gainLoss = remaining[0];
      }
    } else if (remaining.length >= 3) {
      accruedMarketDiscount = remaining[0];
      washSaleLoss = remaining[1];
      gainLoss = remaining[2];
      if (remaining.length >= 4) fedTaxWithheld = remaining[3];
      if (remaining.length >= 5) stateTaxWithheld = remaining[4];
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
      stateTaxWithheld,
      additionalInfo: "Sale",
      grossNet: "",
      gainLossCode: "",
    };
  } catch {
    return null;
  }
}

/**
 * Determine term type from page headers.
 */
function determineTermType(pagesText: string[]): string {
  const fullText = pagesText.join(" ");
  if (
    fullText.includes("Short-term transactions") &&
    !fullText.includes("Long-term transactions")
  ) {
    return "Short-Term";
  } else if (
    fullText.includes("Long-term transactions") &&
    !fullText.includes("Short-term transactions")
  ) {
    return "Long-Term";
  }
  return "Mixed";
}

/**
 * Parse all 1099-B pages and return transaction list.
 */
export function parseFidelityTransactions(pagesText: string[]): Transaction[] {
  const { pages, otherForms } = extract1099bPages(pagesText);

  if (pages.length === 0) {
    const formsStr = otherForms.length > 0 ? otherForms.join(", ") : "unknown forms";
    throw new Error(`No 1099-B broker transactions, only ${formsStr}.`);
  }

  const termType = determineTermType(pages);
  const transactions: Transaction[] = [];
  let currentSecurity = { description: "", symbol: "", cusip: "" };

  const allLines: string[] = [];
  for (const pageText of pages) {
    for (const line of pageText.split("\n")) {
      allLines.push(line);
    }
  }

  for (const line of allLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("- ") || trimmed.startsWith("* "))
      continue;

    // Check for security description header
    const desc = parseDescriptionLine(trimmed);
    if (desc) {
      currentSecurity = desc;
      continue;
    }

    // Check for sale transaction
    const sale = parseSaleLine(trimmed);
    if (sale) {
      transactions.push({
        ...sale,
        description: currentSecurity.description,
        symbol: currentSecurity.symbol,
        cusip: currentSecurity.cusip,
        term: termType,
        basisReported: "Yes",
      });
      continue;
    }
  }

  return transactions;
}
