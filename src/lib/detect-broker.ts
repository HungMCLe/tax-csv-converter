/**
 * Auto-detect broker type from extracted PDF text.
 */

import { BrokerType } from "./parsers/types";

/**
 * Scan extracted text pages for broker-specific signatures.
 * Returns the detected broker type or "unknown".
 */
export function detectBroker(pagesText: string[]): BrokerType {
  // Check first few pages plus all pages for signatures
  const textToCheck = pagesText.slice(0, 5).join("\n");
  const allText = pagesText.join("\n");

  // Fidelity signatures
  if (
    textToCheck.includes("FIDELITY BROKERAGE") ||
    textToCheck.includes("Fidelity Brokerage") ||
    (textToCheck.includes("Fidelity") &&
      textToCheck.includes("TAX REPORTING STATEMENT")) ||
    textToCheck.includes("FORM 1099-B") && textToCheck.includes("Fidelity") ||
    allText.includes("FIDELITY BROKERAGE")
  ) {
    return "fidelity";
  }

  // Robinhood signatures
  if (
    textToCheck.includes("Robinhood Markets") ||
    textToCheck.includes("Robinhood Securities") ||
    textToCheck.includes("ROBINHOOD SECURITIES") ||
    allText.includes("Robinhood Markets")
  ) {
    return "robinhood";
  }

  // Schwab signatures
  if (
    textToCheck.includes("Schwab One") ||
    textToCheck.includes("Charles Schwab") ||
    textToCheck.includes("CHARLES SCHWAB") ||
    allText.includes("Charles Schwab") ||
    allText.includes("CHARLES SCHWAB")
  ) {
    return "schwab";
  }

  // Morgan Stanley signatures
  if (
    textToCheck.includes("Morgan Stanley") ||
    textToCheck.includes("MORGAN STANLEY") ||
    textToCheck.includes("STOCK PLAN ACCOUNT") ||
    allText.includes("Morgan Stanley") ||
    allText.includes("MORGAN STANLEY")
  ) {
    return "morgan-stanley";
  }

  return "unknown";
}

/**
 * Get display name for a broker type.
 */
export function getBrokerDisplayName(broker: BrokerType): string {
  switch (broker) {
    case "fidelity":
      return "Fidelity";
    case "robinhood":
      return "Robinhood";
    case "schwab":
      return "Charles Schwab";
    case "morgan-stanley":
      return "Morgan Stanley";
    default:
      return "Unknown Broker";
  }
}
