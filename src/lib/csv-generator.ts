/**
 * CSV generation and download utility.
 * Converts parsed transactions to CSV format and triggers browser download.
 */

import { Transaction } from "./parsers/types";

const CSV_HEADERS = [
  "Description (1a)",
  "CUSIP",
  "Symbol",
  "Quantity",
  "Date Acquired (1b)",
  "Date Sold (1c)",
  "Proceeds (1d)",
  "Gross/Net (6)",
  "Cost or Other Basis (1e)",
  "Accrued Market Discount (1f)",
  "Wash Sale Loss Disallowed (1g)",
  "Gain or Loss",
  "Loss Code (7)",
  "Additional Information",
  "Federal Income Tax Withheld (4)",
  "State Tax Withheld",
  "Term",
  "Basis Reported to IRS (12)",
];

/**
 * Escape a CSV field value (handle commas, quotes, newlines).
 */
function escapeCSV(value: string): string {
  if (!value) return "";
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert transactions to a CSV string.
 */
export function transactionsToCSV(transactions: Transaction[]): string {
  const lines: string[] = [];

  // Header row
  lines.push(CSV_HEADERS.map(escapeCSV).join(","));

  // Data rows
  for (const txn of transactions) {
    const row = [
      txn.description,
      txn.cusip,
      txn.symbol,
      txn.quantity,
      txn.dateAcquired,
      txn.dateSold,
      txn.proceeds,
      txn.grossNet,
      txn.costBasis,
      txn.accruedMarketDiscount,
      txn.washSaleLoss,
      txn.gainLoss,
      txn.gainLossCode,
      txn.additionalInfo,
      txn.fedTaxWithheld,
      txn.stateTaxWithheld,
      txn.term,
      txn.basisReported,
    ];
    lines.push(row.map(escapeCSV).join(","));
  }

  return lines.join("\r\n") + "\r\n";
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(
  csvContent: string,
  filename: string = "1099_transactions.csv"
): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
