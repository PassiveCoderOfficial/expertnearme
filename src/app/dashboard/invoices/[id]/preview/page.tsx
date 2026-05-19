import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import PrintButtons from './PrintButtons';

export default async function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const { id } = await params;
  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) redirect('/login');

  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(id), expertId: expert.id },
    include: { items: { orderBy: { sortOrder: 'asc' } }, payments: { orderBy: { paidAt: 'desc' } } },
  });

  if (!invoice) redirect('/dashboard/invoices');

  const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
  const discount = invoice.discount ?? 0;
  const taxRate = invoice.taxRate ?? 0;
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + tax;
  const paidAmount = invoice.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <PrintButtons />

        {/* Invoice Document */}
        <div className="bg-white text-slate-900 p-12 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              {invoice.logoUrl && (
                <img src={invoice.logoUrl} alt="Logo" className="h-16 object-contain mb-4" />
              )}
              <div>
                <h1 className="text-3xl font-bold">{invoice.fromName || 'Invoice'}</h1>
                <p className="text-slate-600 text-sm mt-2">{invoice.fromAddress}</p>
                {invoice.fromEmail && <p className="text-slate-600 text-sm">{invoice.fromEmail}</p>}
                {invoice.fromPhone && <p className="text-slate-600 text-sm">{invoice.fromPhone}</p>}
              </div>
            </div>

            <div className="text-right">
              <p className="text-5xl font-bold text-slate-400">INVOICE</p>
              <div className="mt-8 space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Invoice #</span>
                  <p className="font-bold text-lg">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-slate-600">Status</span>
                  <p className="font-bold">{invoice.status}</p>
                </div>
                <div>
                  <span className="text-slate-600">Issue Date</span>
                  <p className="font-bold">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</p>
                </div>
                {invoice.dueDate && (
                  <div>
                    <span className="text-slate-600">Due Date</span>
                    <p className="font-bold">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-b-2 border-slate-300 py-8 mb-8">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-sm font-bold text-slate-600 uppercase mb-3">Bill To</h3>
                <p className="font-bold text-lg mb-1">{invoice.clientName}</p>
                {invoice.clientAddress && <p className="text-sm text-slate-600 mb-1">{invoice.clientAddress}</p>}
                {invoice.clientEmail && <p className="text-sm text-slate-600 mb-1">{invoice.clientEmail}</p>}
                {invoice.clientPhone && <p className="text-sm text-slate-600">{invoice.clientPhone}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-4">
                  <span className="font-bold">Currency:</span> {invoice.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="text-left px-4 py-3 font-bold text-sm">Description</th>
                <th className="text-center px-4 py-3 font-bold text-sm">Quantity</th>
                <th className="text-right px-4 py-3 font-bold text-sm">Unit Price</th>
                <th className="text-right px-4 py-3 font-bold text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {invoice.currency} {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {invoice.currency} {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2 border-b border-slate-300">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">
                  {invoice.currency} {subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-300">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-semibold">
                    -{invoice.currency} {discount.toFixed(2)}
                  </span>
                </div>
              )}

              {taxRate > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-300">
                  <span className="text-slate-600">Tax ({taxRate}%)</span>
                  <span className="font-semibold">
                    {invoice.currency} {tax.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-3 bg-slate-100 px-4 mt-2 rounded-lg text-lg font-bold">
                <span>Total</span>
                <span>
                  {invoice.currency} {total.toFixed(2)}
                </span>
              </div>

              {paidAmount > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-slate-300">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Paid</span>
                    <span className="font-semibold text-green-600">
                      {invoice.currency} {paidAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>{total - paidAmount > 0 ? 'Amount Due' : 'Overpaid'}</span>
                    <span className={total - paidAmount > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {invoice.currency} {Math.abs(total - paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-12 pt-8 border-t-2 border-slate-300">
              <h3 className="text-sm font-bold text-slate-600 uppercase mb-3">Notes</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-slate-300">
              <h3 className="text-sm font-bold text-slate-600 uppercase mb-3">Payment History</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Method</th>
                    <th className="text-right px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map(p => (
                    <tr key={p.id} className="border-b border-slate-200">
                      <td className="px-4 py-2">{format(new Date(p.paidAt), 'MMM dd, yyyy')}</td>
                      <td className="px-4 py-2">{p.method || '-'}</td>
                      <td className="text-right px-4 py-2 font-semibold">
                        {invoice.currency} {p.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 text-center text-xs text-slate-500">
            <p>Thank you for your business</p>
            <p>This is a computer-generated document</p>
          </div>
        </div>
      </div>
    </div>
  );
}
