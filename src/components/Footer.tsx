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
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="https://buymeacoffee.com/dsgoose"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-500 transition-colors dark:text-yellow-500 dark:hover:text-yellow-400"
            >
              <CoffeeIcon />
              <span>Buy me a coffee</span>
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfnAoBRUZF07fuTarq7f_LL0KxEdQer5wKCoWfElbM4X2VIdg/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400 transition-colors dark:text-red-400 dark:hover:text-red-300"
            >
              <BugIcon />
              <span>Report an issue</span>
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

function BugIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8h-2.81a5.985 5.985 0 00-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" />
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
