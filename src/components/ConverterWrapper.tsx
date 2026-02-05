"use client";

import dynamic from "next/dynamic";

const Converter = dynamic(() => import("@/components/Converter"), {
  ssr: false,
  loading: () => (
    <section className="bg-white py-16 dark:bg-gray-950" id="converter">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          Convert Your 1099
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Loading converter...
        </p>
      </div>
    </section>
  ),
});

export default function ConverterWrapper() {
  return <Converter />;
}
