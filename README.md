# 1099 to CSV Converter

Convert your 1099-B tax form PDFs to CSV — free, private, and instant.

**Live at [1099tocsv.com](https://1099tocsv.com)**

## Supported Brokers

- **Fidelity** — 1099-B Tax Reporting Statements
- **Robinhood** — Consolidated Form 1099
- **Charles Schwab** — 1099 Composite Forms

## How It Works

1. Upload your 1099-B PDF
2. The app auto-detects your broker and parses every transaction
3. Download a clean CSV with all fields needed for Schedule D / Form 8949

## Privacy

**Your data never leaves your browser.** All PDF parsing happens 100% client-side using JavaScript. No files are uploaded to any server. You can verify this yourself in your browser's Network tab — zero requests are made during processing.

## CSV Output

The output CSV includes all standard 1099-B fields:

| Column | IRS Form Reference |
|---|---|
| Description | Box 1a |
| CUSIP | — |
| Symbol | — |
| Date Acquired | Box 1b |
| Date Sold | Box 1c |
| Proceeds | Box 1d |
| Cost or Other Basis | Box 1e |
| Accrued Market Discount | Box 1f |
| Wash Sale Loss Disallowed | Box 1g |
| Gain or Loss | — |
| Federal Tax Withheld | Box 4 |
| Term (Short/Long) | — |
| Basis Reported to IRS | Box 12 |

## Tech Stack

- [Next.js](https://nextjs.org/) (static export)
- [pdfjs-dist](https://github.com/nicktomlin/pdfjs-dist) for client-side PDF text extraction
- [Tailwind CSS](https://tailwindcss.com/) for styling
- TypeScript
- Deployed on [Vercel](https://vercel.com/)

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Contributing

Pull requests are welcome! If you'd like to add support for another broker, check the existing parsers in `src/lib/parsers/` for the pattern to follow.

## Report Issues

Found a bug or your PDF didn't parse correctly? [Submit an issue report](https://docs.google.com/forms/d/e/1FAIpQLSfnAoBRUZF07fuTarq7f_LL0KxEdQer5wKCoWfElbM4X2VIdg/viewform).

## Support

If this tool saved you time, consider [buying me a coffee](https://buymeacoffee.com/dsgoose).

## License

MIT
