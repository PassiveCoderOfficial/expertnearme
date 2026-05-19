'use client';

import { useEffect, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { MdAdd, MdEdit, MdDelete, MdDownload } from 'react-icons/md';
import { Calendar, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface AccountEntry {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  category?: string;
  description: string;
  reference?: string;
  entryDate: string;
  attachmentUrl?: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  byCategory: { name: string; amount: number }[];
  monthlyData: { month: string; income: number; expense: number }[];
}

export default function AccountingPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [entries, setEntries] = useState<AccountEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'income' | 'expenses' | 'reports'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    type: 'DEBIT',
    amount: '',
    category: '',
    description: '',
    reference: '',
    entryDate: format(new Date(), 'yyyy-MM-dd'),
    attachmentUrl: '',
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [tab, page, filterType, filterCategory, filterFrom, filterTo]);

  async function loadData() {
    try {
      setLoading(true);
      const [summaryRes, entriesRes] = await Promise.all([
        fetch('/api/me/accounting/summary'),
        fetch(
          `/api/me/accounting/entries?${new URLSearchParams({
            page: String(page),
            ...(filterType && { type: filterType }),
            ...(filterCategory && { category: filterCategory }),
            ...(filterFrom && { from: filterFrom }),
            ...(filterTo && { to: filterTo }),
          })}`
        ),
      ]);

      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const entriesData = await entriesRes.json();
      setEntries(entriesData.entries || []);
      setTotalPages(entriesData.pages || 1);

      // Extract unique categories for autocomplete
      if (entriesData.entries) {
        const cats = [...new Set(entriesData.entries.map((e: AccountEntry) => e.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to load accounting data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEntry() {
    if (!formData.description || !formData.amount) {
      alert('Description and amount required');
      return;
    }

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/me/accounting/entries/${editingId}` : '/api/me/accounting/entries';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category || null,
          description: formData.description,
          reference: formData.reference || null,
          entryDate: new Date(formData.entryDate).toISOString(),
          attachmentUrl: formData.attachmentUrl || null,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingId(null);
        resetForm();
        loadData();
      }
    } catch (err) {
      console.error('Failed to save entry:', err);
      alert('Error saving entry');
    }
  }

  async function handleDeleteEntry(id: number) {
    if (!confirm('Delete this entry?')) return;
    try {
      const res = await fetch(`/api/me/accounting/entries/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }

  function resetForm() {
    setFormData({
      type: 'DEBIT',
      amount: '',
      category: '',
      description: '',
      reference: '',
      entryDate: format(new Date(), 'yyyy-MM-dd'),
      attachmentUrl: '',
    });
  }

  function handleEditEntry(entry: AccountEntry) {
    setFormData({
      type: entry.type,
      amount: entry.amount.toString(),
      category: entry.category || '',
      description: entry.description,
      reference: entry.reference || '',
      entryDate: format(new Date(entry.entryDate), 'yyyy-MM-dd'),
      attachmentUrl: entry.attachmentUrl || '',
    });
    setEditingId(entry.id);
    setShowAddModal(true);
  }

  function exportToCSV() {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Reference', 'Amount'];
    const rows = entries.map(e => [
      format(new Date(e.entryDate), 'yyyy-MM-dd'),
      e.type,
      e.category || '',
      e.description,
      e.reference || '',
      e.amount,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  }

  if (loading && !summary) return <div className="p-8">Loading...</div>;

  const displayTab = tab === 'all' ? filterType || 'all' : tab;
  const filteredEntries =
    displayTab === 'all'
      ? entries
      : entries.filter(e => (displayTab === 'income' ? e.type === 'CREDIT' : e.type === 'DEBIT'));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Accounting</h1>
          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <MdAdd size={20} />
            Add Entry
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ${summary.totalIncome.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ${summary.totalExpense.toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Net Balance</p>
                  <p className={`text-2xl font-bold mt-1 ${summary.netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${summary.netBalance.toFixed(2)}
                  </p>
                </div>
                <Wallet className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    $
                    {(
                      (summary.monthlyData[summary.monthlyData.length - 1]?.income || 0) -
                      (summary.monthlyData[summary.monthlyData.length - 1]?.expense || 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <Calendar className="text-purple-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-white/8">
          {(['all', 'income', 'expenses', 'reports'] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {tab === 'reports' && summary ? (
          <div className="space-y-8">
            {/* Monthly Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Monthly Overview (Last 12 Months)</h3>
              <div className="space-y-4">
                {summary.monthlyData.map(m => {
                  const maxAmount = Math.max(
                    ...summary.monthlyData.map(x => Math.max(x.income, x.expense))
                  );
                  const incomeWidth = (m.income / maxAmount) * 100;
                  const expenseWidth = (m.expense / maxAmount) * 100;
                  return (
                    <div key={m.month}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.month}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          ${(m.income - m.expense).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        {incomeWidth > 0 && (
                          <div style={{ width: `${incomeWidth}%` }} className="bg-green-500 flex items-center justify-center text-xs text-white font-semibold">
                            {incomeWidth > 15 && `$${m.income.toFixed(0)}`}
                          </div>
                        )}
                        {expenseWidth > 0 && (
                          <div style={{ width: `${expenseWidth}%` }} className="bg-red-500 flex items-center justify-center text-xs text-white font-semibold">
                            {expenseWidth > 15 && `$${m.expense.toFixed(0)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Category Breakdown</h3>
              <div className="space-y-3">
                {summary.byCategory.length > 0 ? (
                  summary.byCategory.map(cat => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{cat.name}</span>
                      <span className={`font-semibold ${cat.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${cat.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No entries yet</p>
                )}
              </div>
              <button
                onClick={exportToCSV}
                disabled={entries.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MdDownload size={18} />
                Export to CSV
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-white/8 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="date"
                  value={filterFrom}
                  onChange={e => {
                    setFilterFrom(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  placeholder="From date"
                />
                <input
                  type="date"
                  value={filterTo}
                  onChange={e => {
                    setFilterTo(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  placeholder="To date"
                />
                <select
                  value={filterCategory}
                  onChange={e => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                >
                  <option value="">All categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setFilterFrom('');
                    setFilterTo('');
                    setFilterCategory('');
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Entries Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Reference</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map(entry => (
                        <tr key={entry.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {format(new Date(entry.entryDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                                entry.type === 'CREDIT'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.category || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.description}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.reference || '-'}</td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right ${entry.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {entry.type === 'CREDIT' ? '+' : '-'}${entry.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          No entries found
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
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-100 dark:border-white/8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {editingId ? 'Edit Entry' : 'Add Entry'}
              </h2>

              <div className="space-y-4">
                {/* Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <div className="flex gap-2">
                    {['CREDIT', 'DEBIT'].map(t => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, type: t as 'CREDIT' | 'DEBIT' })}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          formData.type === t
                            ? t === 'CREDIT'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        {t === 'CREDIT' ? 'Income' : 'Expense'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={e => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Client payment, Office supplies"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Software, Equipment"
                    list="categories-list"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                  <datalist id="categories-list">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g. INV-2024-001"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
