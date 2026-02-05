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
          <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
            <LockIcon />
            <span>All processing happens in your browser</span>
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
