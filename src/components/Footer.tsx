"use client";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              1099 to CSV
            </span>{" "}
            &mdash; Free, private, open-source tax form converter
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://buymeacoffee.com/dsgoose"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-500 transition-colors dark:text-yellow-500 dark:hover:text-yellow-400"
            >
              <CoffeeIcon />
              <span>Buy me a coffee</span>
            </a>
            <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
              <LockIcon />
              <span>All processing happens in your browser</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600">
          This tool is for informational purposes only and does not constitute tax advice.
          Always verify your data and consult a tax professional.
        </div>
      </div>
    </footer>
  );
}

function CoffeeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21h18v-2H2v2zM20 8h-2V5h2v3zm0-5H4v10a4 4 0 004 4h6a4 4 0 004-4v-2h2a2 2 0 002-2V5a2 2 0 00-2-2zm-2 8h-2V5h2v6z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
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
