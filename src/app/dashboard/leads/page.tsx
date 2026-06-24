'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, Plus, RefreshCw, Filter, Trash2, Edit2, ExternalLink,
  Globe, UserPlus, Zap, ChevronDown, X, Copy, Check, Eye, EyeOff,
  Key, Loader2,
} from 'lucide-react';

type LeadSource = 'ENM_DIRECT' | 'PC_WEBSITE' | 'MANUAL';
type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'BOOKED' | 'LOST';

type Lead = {
  id: number;
  source: LeadSource;
  sourceUrl: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  bookingId: number | null;
  createdAt: string;
};

type ApiKey = {
  id: number;
  keyPrefix: string;
  label: string | null;
  scopes: string;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified', BOOKED: 'Booked', LOST: 'Lost',
};
const STATUS_COLOR: Record<LeadStatus, string> = {
  NEW: 'bg-blue-500/15 text-blue-600 border-blue-500/25',
  CONTACTED: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25',
  QUALIFIED: 'bg-purple-500/15 text-purple-600 border-purple-500/25',
  BOOKED: 'bg-green-500/15 text-green-600 border-green-500/25',
  LOST: 'bg-slate-300/30 text-slate-500 border-slate-300/40',
};
const SOURCE_LABEL: Record<LeadSource, { label: string; icon: string }> = {
  ENM_DIRECT: { label: 'ENM Direct', icon: '🎯' },
  PC_WEBSITE: { label: 'PC Website', icon: '🌐' },
  MANUAL: { label: 'Manual', icon: '✍️' },
};
const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'BOOKED', 'LOST'];

export default function LeadsPage() {
  const [tab, setTab] = useState<'leads' | 'keys' | 'embed'>('leads');

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<LeadStatus>('NEW');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Add lead modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [addSaving, setAddSaving] = useState(false);

  // API keys state
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyCreating, setKeyCreating] = useState(false);

  // Embed slug (expert's profileLink)
  const [expertSlug, setExpertSlug] = useState('');

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (sourceFilter) params.set('source', sourceFilter);
    const r = await fetch(`/api/me/leads?${params}`);
    const d = await r.json();
    if (d.leads) setLeads(d.leads);
    setLeadsLoading(false);
  }, [statusFilter, sourceFilter]);

  const loadKeys = useCallback(async () => {
    setKeysLoading(true);
    const r = await fetch('/api/me/api-keys');
    const d = await r.json();
    if (d.keys) setKeys(d.keys);
    setKeysLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  useEffect(() => {
    if (tab === 'keys' || tab === 'embed') loadKeys();
  }, [tab, loadKeys]);

  // Load expert slug for embed code
  useEffect(() => {
    fetch('/api/me/expert').then(r => r.json()).then(d => {
      if (d.expert?.profileLink) setExpertSlug(d.expert.profileLink);
    }).catch(() => {});
  }, []);

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || '');
  };

  const saveLead = async () => {
    if (!editLead) return;
    setSaving(true);
    await fetch('/api/me/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editLead.id, status: editStatus, notes: editNotes }),
    });
    setSaving(false);
    setEditLead(null);
    loadLeads();
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/me/leads?id=${id}`, { method: 'DELETE' });
    loadLeads();
  };

  const addLead = async () => {
    if (!addForm.name) return;
    setAddSaving(true);
    await fetch('/api/me/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, source: 'MANUAL' }),
    });
    setAddSaving(false);
    setShowAdd(false);
    setAddForm({ name: '', email: '', phone: '', message: '' });
    loadLeads();
  };

  const createKey = async () => {
    setKeyCreating(true);
    const r = await fetch('/api/me/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newKeyLabel || null }),
    });
    const d = await r.json();
    if (d.key) { setCreatedKey(d.key); setNewKeyLabel(''); loadKeys(); }
    setKeyCreating(false);
  };

  const revokeKey = async (id: number) => {
    if (!confirm('Revoke this API key? PC sites using it will stop working.')) return;
    await fetch(`/api/me/api-keys?id=${id}`, { method: 'DELETE' });
    loadKeys();
  };

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = expertSlug
    ? `<iframe\n  src="https://expertnear.me/widget/${expertSlug}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border-radius:12px;max-width:400px"\n></iframe>`
    : '';

  const [embedCopied, setEmbedCopied] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-500" /> CRM & Leads
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Track inquiries, manage leads from PC websites, embed booking widget</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        {([['leads', 'Leads'], ['keys', 'API Keys'], ['embed', 'Embed Widget']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* === LEADS TAB === */}
      {tab === 'leads' && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none">
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as any)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none">
              <option value="">All sources</option>
              <option value="ENM_DIRECT">ENM Direct</option>
              <option value="PC_WEBSITE">PC Website</option>
              <option value="MANUAL">Manual</option>
            </select>
            <button onClick={loadLeads} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="h-4 w-4 text-slate-400" />
            </button>
            <button onClick={() => setShowAdd(true)}
              className="ml-auto flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <Plus className="h-4 w-4" /> Add Lead
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {STATUSES.map(s => {
              const count = leads.filter(l => l.status === s).length;
              return (
                <div key={s} className={`rounded-xl border px-3 py-2 text-center cursor-pointer transition-opacity ${STATUS_COLOR[s]} ${statusFilter && statusFilter !== s ? 'opacity-40' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs">{STATUS_LABELS[s]}</p>
                </div>
              );
            })}
          </div>

          {leadsLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 text-orange-500 animate-spin" /></div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No leads yet. Add one manually or wire up your PC website.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map(lead => (
                <div key={lead.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{lead.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLOR[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                      <span className="text-xs text-slate-400">{SOURCE_LABEL[lead.source].icon} {SOURCE_LABEL[lead.source].label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {lead.email && <span className="text-xs text-slate-500">{lead.email}</span>}
                      {lead.phone && <span className="text-xs text-slate-500">{lead.phone}</span>}
                      {lead.sourceUrl && (
                        <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate max-w-[180px]">
                          <ExternalLink className="h-3 w-3 shrink-0" />{lead.sourceUrl}
                        </a>
                      )}
                    </div>
                    {lead.message && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{lead.message}</p>}
                    {lead.notes && <p className="text-xs text-orange-500 mt-1 italic line-clamp-1">Note: {lead.notes}</p>}
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(lead)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => deleteLead(lead.id)} className="p-2 rounded-xl border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === API KEYS TAB === */}
      {tab === 'keys' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">How it works</p>
            <p>Generate an API key and add it to your Passive Coder Pro website. When visitors submit a contact form, the lead appears here automatically.</p>
          </div>

          {/* Create key */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Generate new key</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Label (e.g. My Portfolio Site)" value={newKeyLabel}
                onChange={e => setNewKeyLabel(e.target.value)}
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-orange-400" />
              <button onClick={createKey} disabled={keyCreating}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                {keyCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Generate
              </button>
            </div>

            {createdKey && (
              <div className="mt-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">Copy this key — it won't be shown again</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800/40 rounded-lg px-3 py-2 font-mono break-all">{createdKey}</code>
                  <button onClick={() => copyText(createdKey, setKeyCopied)} className="p-2 border border-green-200 dark:border-green-800/40 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    {keyCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-green-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing keys */}
          {keysLoading ? (
            <div className="flex items-center justify-center h-24"><Loader2 className="h-5 w-5 text-orange-500 animate-spin" /></div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No API keys yet.</p>
          ) : (
            <div className="space-y-2">
              {keys.map(k => (
                <div key={k.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 bg-white dark:bg-slate-800/50">
                  <Key className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{k.keyPrefix}…</code>
                      {k.label && <span className="text-xs text-slate-400">· {k.label}</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${k.active ? 'bg-green-500/15 text-green-600' : 'bg-slate-300/30 text-slate-500'}`}>
                        {k.active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Created {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsedAt && ` · Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {k.active && (
                    <button onClick={() => revokeKey(k.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PC integration snippet */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">PC Website integration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Add to your PC Pro site's contact form handler:</p>
            <pre className="text-xs bg-slate-900 text-green-300 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{`fetch('https://expertnear.me/api/leads/inbound', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    message: formData.message,
    sourceUrl: window.location.href,
  }),
})`}</pre>
          </div>
        </div>
      )}

      {/* === EMBED WIDGET TAB === */}
      {tab === 'embed' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 rounded-2xl p-4 text-sm text-orange-700 dark:text-orange-300">
            <p className="font-semibold mb-1">Booking widget for your PC website</p>
            <p>Paste this iframe into any Passive Coder Pro page. Visitors can book you directly without leaving your site. Bookings appear in your ENM dashboard.</p>
          </div>

          {expertSlug ? (
            <>
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Embed code</h3>
                  <button onClick={() => copyText(embedCode, setEmbedCopied)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 transition-colors">
                    {embedCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {embedCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs bg-slate-900 text-green-300 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{embedCode}</pre>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Preview</h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden" style={{ height: 600, maxWidth: 400 }}>
                  <iframe
                    src={`/widget/${expertSlug}`}
                    width="100%"
                    height="100%"
                    title="Booking Widget Preview"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">Your expert profile needs a profile link set before you can embed the widget.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Lead Modal */}
      {editLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setEditLead(null); }}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">{editLead.name}</h3>
              <button onClick={() => setEditLead(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setEditStatus(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${editStatus === s ? STATUS_COLOR[s] + ' ring-2 ring-offset-1 ring-orange-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                <textarea rows={4} value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  placeholder="Internal notes about this lead..."
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-orange-400 resize-none" />
              </div>
              {editLead.message && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Lead message</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{editLead.message}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditLead(null)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={saveLead} disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Add Lead Manually</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Name *', key: 'name', type: 'text', placeholder: 'Contact name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={(addForm as any)[key]}
                    onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-orange-400" />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Message / Notes</label>
                <textarea rows={3} value={addForm.message} onChange={e => setAddForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-orange-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={addLead} disabled={addSaving || !addForm.name}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {addSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
