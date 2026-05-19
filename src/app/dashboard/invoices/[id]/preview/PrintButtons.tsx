'use client';

export default function PrintButtons() {
  return (
    <div className="mb-6 flex justify-end gap-2 print:hidden">
      <button
        onClick={() => window.print()}
        className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
      >
        Print / Save as PDF
      </button>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
      >
        Back
      </button>
    </div>
  );
}
