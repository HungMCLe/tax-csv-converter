"use client";

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          How It Works
        </h2>
        <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
          Three simple steps. No account needed.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step
            number={1}
            title="Upload your PDF"
            description="Drag and drop your 1099-B PDF from Fidelity, Robinhood, or Schwab."
            icon={<UploadIcon />}
          />
          <Step
            number={2}
            title="Auto-detect & parse"
            description="We automatically detect your broker and extract every transaction."
            icon={<ScanIcon />}
          />
          <Step
            number={3}
            title="Download CSV"
            description="Get a clean, ready-to-use CSV with all your tax lot details."
            icon={<DownloadIcon />}
          />
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
        {icon}
      </div>
      <div className="mt-1 text-xs font-semibold text-blue-500">
        STEP {number}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
