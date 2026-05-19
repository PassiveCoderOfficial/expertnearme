'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MdAdd, MdEye, MdDelete, MdDownload } from 'react-icons/md';
import Link from 'next/link';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  status: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  items: { amount: number }[];
  createdAt: string;
}

type StatusFilter = 'all' | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, page]);

  async function loadInvoices() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      const res = await fetch(`/api/me/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteInvoice(id: number) {
    if (!confirm('Delete this invoice? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/me/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) loadInvoices();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'SENT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'PAID':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'OVERDUE':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  }

  if (loading && invoices.length === 0) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <Link
            href="/dashboard/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            <MdAdd size={20} />
            Create Invoice
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'] as const).map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white">Due Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map(invoice => {
                    const remaining = invoice.totalAmount - invoice.paidAmount;
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{invoice.clientName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                          ${invoice.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                          ${invoice.paidAmount.toFixed(2)} / ${invoice.totalAmount.toFixed(2)}
                          {remaining > 0 && (
                            <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                              ${remaining.toFixed(2)} remaining
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadgeColor(invoice.status)}`}>
                            {invoice.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/dashboard/invoices/${invoice.id}`}
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <MdEye size={18} />
                            </Link>
                            <Link
                              href={`/dashboard/invoices/${invoice.id}/preview`}
                              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <MdDownload size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete (Draft only)"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No invoices found. {statusFilter !== 'all' && 'Try a different filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
