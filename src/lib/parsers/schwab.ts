/**
 * Charles Schwab 1099-B PDF Parser
 * Port of schwab_pdf_to_csv.py to TypeScript.
 *
 * Parses Schwab 1099-B broker transaction pages.
 * Format: Two-line (sometimes three-line) transactions,
 * $ prefixed amounts, -- for empty, parentheses for negatives.
 */

import { Transaction } from "./types";

interface SchwabPage {
  text: string;
  term: string;
  basisReported: string;
}

/**
 * Filter and classify 1099-B transaction pages.
 */
function extract1099bPages(pagesText: string[]): SchwabPage[] {
  const pages: SchwabPage[] = [];
  let currentTerm = "Short-Term";
  let currentBasis = "Yes";

  for (const text of pagesText) {
    if (!text.includes("Proceeds from Broker Transactions")) continue;
    if (text.includes("INSTRUCTIONS FOR RECIPIENTS")) continue;
    if (
      text.includes("Notes for Your Form 1099-B") &&
      !text.includes("CUSIP Number")
    )
      continue;
    if (!text.includes("CUSIP Number")) continue;

    // Determine section type
    if (text.includes("SHORT-TERM TRANSACTIONS FOR WHICH BASIS IS REPORTED")) {
      currentTerm = "Short-Term";
      currentBasis = "Yes";
    } else if (
      text.includes("SHORT-TERM TRANSACTIONS FOR WHICH BASIS IS MISSING")
    ) {
      currentTerm = "Short-Term";
      currentBasis = "No";
    } else if (
      text.includes(
        "SHORT-TERM TRANSACTIONS FOR WHICH BASIS IS AVAILABLE BUT"
      )
    ) {
      currentTerm = "Short-Term";
      currentBasis = "Available but not reported";
    } else if (
      text.includes("LONG-TERM TRANSACTIONS FOR WHICH BASIS IS REPORTED")
    ) {
      currentTerm = "Long-Term";
      currentBasis = "Yes";
    } else if (
      text.includes("LONG-TERM TRANSACTIONS FOR WHICH BASIS IS MISSING")
    ) {
      currentTerm = "Long-Term";
      currentBasis = "No";
    } else if (
      text.includes(
        "LONG-TERM TRANSACTIONS FOR WHICH BASIS IS AVAILABLE BUT"
      )
    ) {
      currentTerm = "Long-Term";
      currentBasis = "Available but not reported";
    }

    pages.push({ text, term: currentTerm, basisReported: currentBasis });
  }

  return pages;
}

/**
 * Parse a dollar amount string, handling Schwab's format:
 * '$ 1,608.51' -> '1608.51'
 * '$(0.03)' or '$ (0.03)' -> '-0.03'
 * '--' -> ''
 * 'Not Provided' -> 'Not Provided'
 */
function parseDollarAmount(s: string): string {
  s = s.trim();
  if (s === "--" || s === "-" || !s) return "";
  if (s === "Not Provided") return "Not Provided";

  s = s.replace(/\$/g, "").trim();
  if (s === "--" || !s) return "";

  let neg = false;
  if (s.includes("(") && s.includes(")")) {
    neg = true;
    s = s.replace(/[()]/g, "");
  }

  s = s.replace(/,/g, "").trim();
  if (!s || s === "--") return "";

  try {
    let val = parseFloat(s);
    if (isNaN(val)) return s;
    if (neg) val = -val;
    return val.toFixed(2);
  } catch {
    return s;
  }
}

/**
 * Parse a two-line Schwab transaction.
 *
 * Line 1: [qty] [description] S [date_acquired] $ [proceeds] $ [cost_basis] [--] $ [gain_loss] $ [fed_tax]
 * Line 2: [cusip] / [symbol] [date_sold] [wash_sale | --]
 */
function parseTransactionPair(
  line1: string,
  line2: string,
  term: string,
  basisReported: string
): Transaction | null {
  line1 = line1.trim();
  line2 = line2.trim();

  // === Parse Line 1 ===
  const dollarParts = line1.split(/\$\s*/);
  const prefix = dollarParts[0]?.trim() || "";

  let quantity = "";
  let description = "";
  let dateAcquired = "";

  // Extract quantity from beginning
  const qtyMatch = prefix.match(/^([\d,]+\.?\d*)\s+(.+)/);
  let rest: string;
  if (qtyMatch) {
    quantity = qtyMatch[1].replace(/,/g, "");
    rest = qtyMatch[2].trim();
  } else {
    rest = prefix;
  }

  // Extract date_acquired or "VARIOUS" or "--" from end
  const dateMatch = rest.match(/\s+(VARIOUS|\d{2}\/\d{2}\/\d{2}|--)\s*$/);
  if (dateMatch) {
    dateAcquired = dateMatch[1];
    rest = rest.substring(0, dateMatch.index).trim();
  }

  // Remove trailing sale type indicator (S, I, P)
  rest = rest.replace(/\s+[SIP]\s*$/, "").trim();
  description = rest;

  // Build token list from dollar parts
  const tokens: string[] = [];
  for (let i = 1; i < dollarParts.length; i++) {
    const part = dollarParts[i].trim();
    if (!part) continue;
    const subTokens = part.split(/\s+/);
    for (const st of subTokens) {
      if (st.trim()) tokens.push(st.trim());
    }
  }

  let proceeds = "";
  let costBasis = "";
  let accruedMarketDiscount = "";
  let gainLoss = "";
  let fedTaxWithheld = "";

  // Handle "Not Provided" cost basis
  if (line1.includes("Not Provided")) {
    const npMatch = line1.match(/\$\s*([\d,]+\.?\d*)\s+Not Provided/);
    if (npMatch) {
      proceeds = parseDollarAmount(npMatch[1]);
    }
    costBasis = "Not Provided";
    const fedMatch = line1.match(/\$\s*([\d,]+\.?\d*)\s*$/);
    if (fedMatch) {
      fedTaxWithheld = parseDollarAmount(fedMatch[1]);
    }
  } else {
    // Normal parsing from tokens
    let idx = 0;
    if (idx < tokens.length) {
      proceeds = parseDollarAmount(tokens[idx]);
      idx++;
    }
    if (idx < tokens.length) {
      costBasis = parseDollarAmount(tokens[idx]);
      idx++;
    }
    if (idx < tokens.length) {
      if (tokens[idx] === "--") {
        idx++;
      } else {
        accruedMarketDiscount = parseDollarAmount(tokens[idx]);
        idx++;
      }
    }
    if (idx < tokens.length) {
      gainLoss = parseDollarAmount(tokens[idx]);
      idx++;
    }
    if (idx < tokens.length) {
      fedTaxWithheld = parseDollarAmount(tokens[idx]);
      idx++;
    }
  }

  // === Parse Line 2 ===
  let cusip = "";
  let symbol = "";
  let dateSold = "";
  let washSaleLoss = "";

  // Try full pattern: CUSIP / SYMBOL DATE [wash_sale | --]
  const l2Match = line2.match(
    /^([\w]+)\s*\/\s*(\w+)\s+(\d{2}\/\d{2}\/\d{2})\s*(.*)/
  );
  if (l2Match) {
    cusip = l2Match[1];
    symbol = l2Match[2];
    dateSold = l2Match[3];
    const washField = l2Match[4].trim();
    if (washField && washField !== "--") {
      washSaleLoss = parseDollarAmount(washField);
    }
  } else {
    // Try without symbol: CUSIP DATE [wash_sale | --]
    const l2Match2 = line2.match(
      /^([\w]+)\s+(\d{2}\/\d{2}\/\d{2})\s*(.*)/
    );
    if (l2Match2) {
      cusip = l2Match2[1];
      dateSold = l2Match2[2];
      const washField = l2Match2[3].trim();
      if (washField && washField !== "--") {
        washSaleLoss = parseDollarAmount(washField);
      }
    } else {
      // Just CUSIP (e.g., matured bonds)
      const cusipOnly = line2.match(/^([\w]+)\s*$/);
      if (cusipOnly) {
        cusip = cusipOnly[1];
      }
    }
  }

  return {
    description,
    cusip,
    symbol,
    quantity,
    dateAcquired,
    dateSold,
    proceeds,
    costBasis,
    accruedMarketDiscount,
    washSaleLoss,
    gainLoss,
    fedTaxWithheld,
    stateTaxWithheld: "",
    term,
    basisReported,
    additionalInfo: "",
    grossNet: "",
    gainLossCode: "",
  };
}

/**
 * Parse all 1099-B pages and return transaction list.
 */
export function parseSchwabTransactions(pagesText: string[]): Transaction[] {
  const pages = extract1099bPages(pagesText);

  if (pages.length === 0) {
    throw new Error(
      "No 1099-B transaction pages found. This PDF may not contain Schwab broker transactions."
    );
  }

  const transactions: Transaction[] = [];

  for (const { text: pageText, term, basisReported } of pages) {
    const lines = pageText.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }

      // Skip known non-transaction lines
      const skipPatterns = [
        "Schwab One",
        "FORM 1099",
        "DESIGNATED BENE",
        "Date Prepared",
        "Taxpayer ID",
        "Recipient's Name",
        "Payer's Name",
        "CHARLES SCHWAB",
        "Telephone",
        "Account Number",
        "Federal ID",
        "__",
        "Proceeds from Broker",
        "Department of the Treasury",
        "SHORT-TERM TRANSACTIONS",
        "LONG-TERM TRANSACTIONS",
        "1b-Date",
        "1a-Description",
        "1c-Date",
        "(Example 100",
        "CUSIP Number / Symbol",
        "Security Subtotal",
        "Total Short-Term",
        "Total Long-Term",
        "Total Sales Price",
        "Total Federal",
        "FATCA Filing",
        "Please see",
        "This is important",
        "on you if",
        "Copy B for Recipient",
        "6-Reported to IRS",
        "acquired",
        "disposed",
        "Page ",
        "Charles Schwab",
      ];

      const shouldSkip = skipPatterns.some(
        (p) => line.startsWith(p) || line.includes(p)
      );

      if (shouldSkip) {
        // But check if this might be a transaction line with $ in it
        const isActuallyTxn =
          line.includes("$") &&
          !["Security Subtotal", "Total Short", "Total Long", "Total Sales", "Total Federal", "FATCA", "Department of the Treasury", "Copy B", "Proceeds from Broker"].some((x) => line.includes(x));

        if (!isActuallyTxn) {
          i++;
          continue;
        }
      }

      // Check if this looks like a transaction line (has $ and next line has CUSIP)
      const hasDollar = line.includes("$");
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      const nextHasCusip =
        /^\w{5,12}\s*\/?\s*\//.test(nextLine) ||
        /^\d{5,9}\w?\s*\//.test(nextLine) ||
        /^\w+\s*\/\s*\w+\s+\d{2}\/\d{2}\/\d{2}/.test(nextLine);

      const nextIsCusipLine =
        /^[\w]+\s*\/?\s*\/?\s*\w*\s+\d{2}\/\d{2}\/\d{2}/.test(nextLine) ||
        /^[\w]+\s+\d{2}\/\d{2}\/\d{2}/.test(nextLine) ||
        nextLine.startsWith("--") ||
        /^\w{5,12}$/.test(nextLine);

      if (hasDollar && (nextHasCusip || nextIsCusipLine)) {
        const txn = parseTransactionPair(line, nextLine, term, basisReported);
        if (txn) {
          transactions.push(txn);
          i += 2;

          // Check for extra lines (3-line format)
          if (i < lines.length) {
            const extra = lines[i].trim();
            if (/^[\w]{5,12}$/.test(extra) && !txn.cusip) {
              txn.cusip = extra;
              i++;
            } else if (/^\$?\s*\d+\.\d{2}$/.test(extra)) {
              const val = extra.replace("$", "").trim();
              txn.accruedMarketDiscount = val;
              i++;
            }
          }
          continue;
        }
      }

      // Handle 3-line transactions (e.g., matured bonds)
      if (hasDollar && !(nextHasCusip || nextIsCusipLine)) {
        const dateInNext = nextLine.match(/(\d{2}\/\d{2}\/\d{2})/);
        const lineAfter = i + 2 < lines.length ? lines[i + 2].trim() : "";
        const lineAfterIsCusip = /^[\w]{5,12}$/.test(lineAfter);

        if (dateInNext && lineAfterIsCusip) {
          const txn = parseTransactionPair(line, nextLine, term, basisReported);
          if (txn) {
            txn.cusip = lineAfter;
            // Append extra description from line 2 (before the date)
            const descExtra = nextLine
              .substring(0, dateInNext.index)
              .trim();
            if (descExtra) {
              txn.description = txn.description + " " + descExtra;
            }
            transactions.push(txn);
            i += 3;
            continue;
          }
        }
      }

      i++;
    }
  }

  return transactions;
}
