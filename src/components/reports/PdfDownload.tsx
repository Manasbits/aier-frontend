"use client";

import { useState } from "react";

interface PdfDownloadProps {
  reportUrl: string;
  filename: string;
}

export default function PdfDownload({ reportUrl, filename }: PdfDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // html2pdf.js is a UMD module, dynamic import for client-side only
      const html2pdf = (await import("html2pdf.js")).default;

      const res = await fetch(reportUrl);
      const html = await res.text();

      const container = document.createElement("div");
      container.innerHTML = html;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "210mm";
      document.body.appendChild(container);

      const pdfFilename = filename.replace(/\.html$/, ".pdf") || "report.pdf";

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: pdfFilename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400 disabled:opacity-50"
    >
      {generating ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Generating PDF...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}
