"use client";

export default function SupportedBrokers() {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900" id="supported-brokers">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          Supported Brokers for 1099-B to CSV Conversion
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          We parse the exact PDF format each broker uses — no manual data entry needed
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <BrokerCard
            name="Fidelity"
            href="/fidelity"
            formName="1099-B Tax Reporting Statement"
            description="Parses Fidelity's single-line sale transactions with comma-separated security headers, CUSIPs, wash sales, and accrued market discount."
            color="green"
          />
          <BrokerCard
            name="Robinhood"
            href="/robinhood"
            formName="Consolidated Form 1099"
            description="Handles Robinhood's date-first column format with W/D wash sale markers, covered and noncovered tax lots, and security CUSIP extraction."
            color="lime"
          />
          <BrokerCard
            name="Charles Schwab"
            href="/schwab"
            formName="1099 Composite"
            description="Handles Schwab's two-line transaction format, $-prefixed amounts, parenthesized negatives, and three-line matured Treasury bonds."
            color="sky"
          />
        </div>
      </div>
    </section>
  );
}

function BrokerCard({
  name,
  href,
  formName,
  description,
  color,
}: {
  name: string;
  href: string;
  formName: string;
  description: string;
  color: "green" | "lime" | "sky";
}) {
  const colors = {
    green: {
      border: "border-green-200 dark:border-green-800",
      badge: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
      hover: "hover:border-green-400 dark:hover:border-green-600",
    },
    lime: {
      border: "border-lime-200 dark:border-lime-800",
      badge: "bg-lime-50 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
      hover: "hover:border-lime-400 dark:hover:border-lime-600",
    },
    sky: {
      border: "border-sky-200 dark:border-sky-800",
      badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
      hover: "hover:border-sky-400 dark:hover:border-sky-600",
    },
  };

  const c = colors[color];

  return (
    <a
      href={href}
      className={`group block rounded-xl border bg-white p-6 transition-all ${c.border} ${c.hover} hover:shadow-md dark:bg-gray-800`}
    >
      <div className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${c.badge}`}>
        {formName}
      </div>
      <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
        {name} 1099 to CSV
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
        Learn more &rarr;
      </div>
    </a>
  );
}
