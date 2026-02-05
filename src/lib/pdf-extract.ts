/**
 * PDF text extraction using pdfjs-dist.
 * Extracts text lines from PDF pages, reconstructing layout from text item positions.
 * Uses dynamic import to avoid SSR issues (DOMMatrix not available in Node.js).
 */

export interface PageText {
  pageNumber: number;
  text: string;
  lines: string[];
}

/**
 * Lazily load pdfjs-dist (client-side only).
 */
async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

/**
 * Extract text from all pages of a PDF file.
 * Reconstructs lines by grouping text items by Y coordinate.
 */
export async function extractPdfText(
  data: ArrayBuffer
): Promise<PageText[]> {
  const pdfjsLib = await getPdfjs();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: PageText[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items by Y coordinate (with tolerance)
    const lineMap = new Map<number, { x: number; str: string }[]>();
    const Y_TOLERANCE = 3;

    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textItem = item as any;
      const x = textItem.transform[4] as number;
      const y = Math.round(textItem.transform[5] as number);

      // Find existing Y bucket within tolerance
      let bucketY = y;
      for (const existingY of lineMap.keys()) {
        if (Math.abs(existingY - y) <= Y_TOLERANCE) {
          bucketY = existingY;
          break;
        }
      }

      if (!lineMap.has(bucketY)) {
        lineMap.set(bucketY, []);
      }
      lineMap.get(bucketY)!.push({ x, str: textItem.str });
    }

    // Sort lines by Y (descending since PDF Y goes bottom-to-top)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

    const lines: string[] = [];
    for (const y of sortedYs) {
      const items = lineMap.get(y)!;
      // Sort items within line by X coordinate
      items.sort((a, b) => a.x - b.x);

      // Join items with spaces where there are gaps
      let lineStr = "";
      let lastX = -Infinity;
      for (const item of items) {
        if (lastX !== -Infinity && item.x - lastX > 5) {
          lineStr += " ";
        }
        lineStr += item.str;
        // Estimate end position (rough, based on character count)
        lastX = item.x + item.str.length * 5;
      }
      lines.push(lineStr.trim());
    }

    const text = lines.join("\n");
    pages.push({ pageNumber: i, text, lines });
  }

  return pages;
}

/**
 * Get just the text strings from all pages (simpler interface).
 */
export async function extractPdfPageTexts(
  data: ArrayBuffer
): Promise<string[]> {
  const pages = await extractPdfText(data);
  return pages.map((p) => p.text);
}
