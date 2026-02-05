"use client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pb-16 pt-20 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          100% Free &middot; 100% Private &middot; No sign-up
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
          Convert your{" "}
          <span className="text-blue-600 dark:text-blue-400">1099-B PDF</span>{" "}
          to CSV
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
          Free online 1099-B to CSV converter for{" "}
          <strong>Fidelity</strong>, <strong>Robinhood</strong>, and{" "}
          <strong>Charles Schwab</strong>.
          Upload your 1099 tax form PDF and get a clean CSV instantly
          — ready for <strong>TurboTax</strong>, Excel, Schedule D, or your CPA.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <BrokerBadge name="Fidelity" color="green" />
          <BrokerBadge name="Robinhood" color="lime" />
          <BrokerBadge name="Charles Schwab" color="sky" />
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
          <LockIcon />
          <span>
            Your data never leaves your browser. All processing happens locally.
          </span>
        </div>

        {/* Hidden SEO text for crawlers — keyword-rich but visually subtle */}
        <p className="mt-6 text-xs text-gray-300 dark:text-gray-700">
          Works with Fidelity 1099-B tax reporting statements, Robinhood consolidated Form 1099,
          and Charles Schwab 1099 composite forms. Extracts stock sales, capital gains, wash sales,
          cost basis, and all Form 8949 fields.
        </p>
      </div>
    </section>
  );
}

function BrokerBadge({
  name,
  color,
}: {
  name: string;
  color: "green" | "lime" | "sky";
}) {
  const colors = {
    green:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    lime: "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800",
    sky: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium ${colors[color]}`}
    >
      {name}
    </span>
  );
}

function LockIcon() {
  return (
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
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
