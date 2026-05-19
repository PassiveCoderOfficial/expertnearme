'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { MdAdd, MdDelete, MdDownload } from 'react-icons/md';

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Payment {
  id?: number;
  amount: number;
  method?: string;
  reference?: string;
  paidAt: string;
}

export default function InvoiceForm({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!invoiceId);
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Main form
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');

  // From section
  const [fromName, setFromName] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Payment modal
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (invoiceId) loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    try {
      const res = await fetch(`/api/me/invoices/${invoiceId}`);
      const data = await res.json();
      if (data) {
        setInvoiceNumber(data.invoiceNumber);
        setStatus(data.status);
        setClientName(data.clientName);
        setClientEmail(data.clientEmail || '');
        setClientAddress(data.clientAddress || '');
        setClientPhone(data.clientPhone || '');
        setIssueDate(format(new Date(data.issueDate), 'yyyy-MM-dd'));
        setDueDate(data.dueDate ? format(new Date(data.dueDate), 'yyyy-MM-dd') : '');
        setCurrency(data.currency || 'USD');
        setTaxRate((data.taxRate || 0).toString());
        setDiscount((data.discount || 0).toString());
        setNotes(data.notes || '');
        setFromName(data.fromName || '');
        setFromAddress(data.fromAddress || '');
        setFromEmail(data.fromEmail || '');
        setFromPhone(data.fromPhone || '');
        setLogoUrl(data.logoUrl || '');
        setLogoPreview(data.logoUrl || '');
        setItems(data.items?.map((i: any) => ({ ...i })) || [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
        setPayments(data.payments?.map((p: any) => ({ ...p, paidAt: format(new Date(p.paidAt), 'yyyy-MM-dd') })) || []);
      }
    } catch (err) {
      console.error('Failed to load invoice:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!clientName || items.some(i => !i.description || i.amount === 0)) {
      alert('Client name and all line items required');
      return;
    }

    try {
      setSaving(true);
      const method = invoiceId ? 'PATCH' : 'POST';
      const url = invoiceId ? `/api/me/invoices/${invoiceId}` : '/api/me/invoices';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientAddress,
          clientPhone,
          issueDate: new Date(issueDate).toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          currency,
          taxRate: parseFloat(taxRate),
          discount: parseFloat(discount),
          notes,
          status,
          fromName,
          fromAddress,
          fromEmail,
          fromPhone,
          logoUrl,
          items: items.map(({ id, ...rest }) => rest),
        }),
      });

      if (res.ok) {
        const newInvoice = await res.json();
        router.push(`/dashboard/invoices/${newInvoice.id}`);
      }
    } catch (err) {
      console.error('Failed to save invoice:', err);
      alert('Error saving invoice');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPayment() {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Payment amount required');
      return;
    }

    try {
      const res = await fetch(`/api/me/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          method: paymentMethod || null,
          reference: paymentReference || null,
          paidAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentMethod('');
        setPaymentReference('');
        loadInvoice();
      }
    } catch (err) {
      console.error('Failed to add payment:', err);
      alert('Error adding payment');
    }
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: any) {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = (subtotal - parseFloat(discount)) * (parseFloat(taxRate) / 100);
  const total = subtotal - parseFloat(discount) + taxAmount;
  const paidAmount = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = total - paidAmount;

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          {invoiceId ? 'Edit Invoice' : 'Create Invoice'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  >
                    <option>DRAFT</option>
                    <option>SENT</option>
                    <option>PAID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* FROM Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">From</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={e => setFromName(e.target.value)}
                    placeholder="Your business name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={e => setFromEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={fromPhone}
                      onChange={e => setFromPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                  <textarea
                    value={fromAddress}
                    onChange={e => setFromAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => {
                      setLogoUrl(e.target.value);
                      setLogoPreview(e.target.value);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain mt-2 rounded-lg" />
                  )}
                </div>
              </div>
            </div>

            {/* TO Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Bill To</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Client name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                  <textarea
                    value={clientAddress}
                    onChange={e => setClientAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Line Items</h3>
              <div className="space-y-3 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      placeholder="Description"
                      className="col-span-5 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      step="0.01"
                      className="col-span-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      step="0.01"
                      className="col-span-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                    />
                    <div className="col-span-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-semibold flex items-center">
                      ${item.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="col-span-1 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                <MdAdd size={16} />
                Add Item
              </button>
            </div>

            {/* Totals */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Discount</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    step="0.01"
                    className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white text-sm text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Tax</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={e => setTaxRate(e.target.value)}
                      step="0.01"
                      className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white text-sm text-right"
                    />
                    <span className="text-slate-500 dark:text-slate-400">%</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                  <span className="text-slate-900 dark:text-white font-bold">Total</span>
                  <span className="text-slate-900 dark:text-white font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes or payment terms"
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* Currency */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              >
                {['USD', 'BDT', 'SAR', 'AED', 'SGD', 'MYR', 'GBP', 'EUR'].map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 font-semibold transition-colors"
            >
              {saving ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Discount</span>
                  <span className="font-semibold text-slate-900 dark:text-white">-${parseFloat(discount).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                  <span className="text-slate-900 dark:text-white font-bold">Total</span>
                  <span className="text-slate-900 dark:text-white font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              {invoiceId && paidAmount > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Paid</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">${paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                    <span className={`font-semibold ${remaining > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment History */}
            {invoiceId && payments.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment History</h3>
                <div className="space-y-3">
                  {payments.map((p, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">${p.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{p.method || 'No method'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{p.paidAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {invoiceId && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                >
                  <MdAdd size={18} />
                  Record Payment
                </button>
                <a
                  href={`/dashboard/invoices/${invoiceId}/preview`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  <MdDownload size={18} />
                  Preview PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 border border-slate-100 dark:border-white/8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Record Payment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Method</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    placeholder="e.g. Bank Transfer"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    placeholder="Transaction ID"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                    setPaymentMethod('');
                    setPaymentReference('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
