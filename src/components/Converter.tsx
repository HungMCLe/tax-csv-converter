"use client";

import { useState, useCallback, useRef } from "react";
import { extractPdfPageTexts } from "@/lib/pdf-extract";
import { detectBroker, getBrokerDisplayName } from "@/lib/detect-broker";
import { parseFidelityTransactions } from "@/lib/parsers/fidelity";
import { parseRobinhoodTransactions } from "@/lib/parsers/robinhood";
import { parseSchwabTransactions } from "@/lib/parsers/schwab";
import {
  Transaction,
  BrokerType,
  ParseSummary,
  computeSummary,
} from "@/lib/parsers/types";
import { transactionsToCSV, downloadCSV } from "@/lib/csv-generator";

type Status = "idle" | "loading" | "success" | "error";

export default function Converter() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [broker, setBroker] = useState<BrokerType>("unknown");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<ParseSummary | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setStatus("loading");
    setError("");
    setFileName(file.name);
    setTransactions([]);
    setSummary(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pagesText = await extractPdfPageTexts(arrayBuffer);

      if (pagesText.length === 0) {
        throw new Error("Could not extract any text from this PDF.");
      }

      const detectedBroker = detectBroker(pagesText);
      setBroker(detectedBroker);

      let txns: Transaction[];

      switch (detectedBroker) {
        case "fidelity":
          txns = parseFidelityTransactions(pagesText);
          break;
        case "robinhood":
          txns = parseRobinhoodTransactions(pagesText);
          break;
        case "schwab":
          txns = parseSchwabTransactions(pagesText);
          break;
        default:
          throw new Error(
            "Could not detect broker. Please make sure this is a 1099-B PDF from Fidelity, Robinhood, or Schwab."
          );
      }

      if (txns.length === 0) {
        throw new Error(
          "No transactions found in this PDF. The format may not be supported."
        );
      }

      setTransactions(txns);
      setSummary(computeSummary(txns));
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        processFile(file);
      } else {
        setError("Please upload a PDF file.");
        setStatus("error");
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDownload = useCallback(() => {
    if (transactions.length === 0) return;
    const csv = transactionsToCSV(transactions);
    const outputName = fileName.replace(/\.pdf$/i, "") + "_transactions.csv";
    downloadCSV(csv, outputName);
  }, [transactions, fileName]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setFileName("");
    setBroker("unknown");
    setTransactions([]);
    setSummary(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <section className="bg-white py-16 dark:bg-gray-950" id="converter">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          Convert Your 1099
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Drop your PDF below to get started
        </p>

        <div className="mt-8">
          {status === "idle" && (
            <DropZone
              dragOver={dragOver}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
            />
          )}

          {status === "loading" && <LoadingState fileName={fileName} />}

          {status === "error" && (
            <ErrorState error={error} onRetry={handleReset} />
          )}

          {status === "success" && summary && (
            <SuccessState
              fileName={fileName}
              broker={broker}
              summary={summary}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function DropZone({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileSelect,
}: {
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        dragOver
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-gray-900"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileSelect}
        className="hidden"
      />
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <svg
          className="h-6 w-6 text-blue-600 dark:text-blue-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
        Drop your 1099 PDF here
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        or click to browse
      </p>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
        Supports Fidelity, Robinhood, and Charles Schwab 1099-B forms
      </p>
    </div>
  );
}

function LoadingState({ fileName }: { fileName: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Processing {fileName}...
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Detecting broker and extracting transactions
      </p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
        <svg
          className="h-5 w-5 text-red-600 dark:text-red-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-800 dark:text-red-200">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
      >
        Try Another File
      </button>
    </div>
  );
}

function SuccessState({
  fileName,
  broker,
  summary,
  onDownload,
  onReset,
}: {
  fileName: string;
  broker: BrokerType;
  summary: ParseSummary;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            Successfully parsed!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            {getBrokerDisplayName(broker)} &middot; {fileName}
          </p>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Transactions"
          value={summary.totalTransactions.toString()}
        />
        <SummaryCard
          label="Securities"
          value={summary.uniqueSecurities.toString()}
        />
        <SummaryCard
          label="Proceeds"
          value={`$${summary.totalProceeds.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
        <SummaryCard
          label="Cost Basis"
          value={`$${summary.totalCostBasis.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
        <SummaryCard
          label="Gain/Loss"
          value={`$${summary.totalGainLoss.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          highlight={summary.totalGainLoss >= 0 ? "green" : "red"}
        />
        <SummaryCard
          label="Wash Sales"
          value={`$${summary.totalWashSales.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
      </div>

      {summary.shortTermCount > 0 || summary.longTermCount > 0 ? (
        <div className="mt-3 text-xs text-green-600 dark:text-green-400 text-center">
          {summary.shortTermCount > 0 && `${summary.shortTermCount} short-term`}
          {summary.shortTermCount > 0 && summary.longTermCount > 0 && " · "}
          {summary.longTermCount > 0 && `${summary.longTermCount} long-term`}
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download CSV
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center rounded-lg border border-green-300 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
        >
          Convert Another
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red";
}) {
  const valueColor =
    highlight === "green"
      ? "text-green-700 dark:text-green-300"
      : highlight === "red"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-900 dark:text-white";

  return (
    <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
