'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PenLine, Plus, Search, Eye, Globe,
  Trash2, Edit, CheckCircle, Clock, Archive, FileText, RefreshCw,
  ExternalLink, Square, CheckSquare, ChevronDown,
} from 'lucide-react';

type BlogStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: BlogStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  countryCode: string | null;
  categoryTag: string | null;
  viewCount: number;
  readingTimeMins: number;
  coverImage: string | null;
  excerpt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<BlogStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT:     { label: 'Draft',     color: 'bg-slate-700 text-slate-300',    icon: <FileText className="w-3 h-3" /> },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-300',   icon: <Clock className="w-3 h-3" /> },
  PUBLISHED: { label: 'Published', color: 'bg-green-500/20 text-green-300', icon: <CheckCircle className="w-3 h-3" /> },
  ARCHIVED:  { label: 'Archived',  color: 'bg-slate-800 text-slate-500',    icon: <Archive className="w-3 h-3" /> },
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Bulk selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/admin/blog?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, filterStatus]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  const handlePublishScheduled = async () => {
    setPublishing(true);
    const res = await fetch('/api/admin/blog/publish-scheduled', { method: 'POST' });
    const data = await res.json();
    alert(`Published ${data.published} scheduled posts.`);
    setPublishing(false);
    fetchPosts();
  };

  // Bulk helpers
  const filteredPosts = search
    ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search))
    : posts;

  const allSelected = filteredPosts.length > 0 && filteredPosts.every((p) => selected.has(p.id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredPosts.map((p) => p.id)));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkSetStatus = async (status: BlogStatus) => {
    if (!selected.size) return;
    setBulkLoading(true);
    setBulkMenuOpen(false);
    await Promise.all(
      [...selected].map((id) =>
        fetch(`/api/admin/blog/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      )
    );
    setBulkLoading(false);
    fetchPosts();
  };

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} post${selected.size > 1 ? 's' : ''}? Cannot be undone.`)) return;
    setBulkLoading(true);
    setBulkMenuOpen(false);
    await Promise.all([...selected].map((id) => fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })));
    setBulkLoading(false);
    fetchPosts();
  };

  const statusCounts = posts.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const frontendUrl = (post: BlogPost) => `/blog/${post.slug}`;

  return (
    <div className="space-y-6" onClick={() => setBulkMenuOpen(false)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PenLine className="w-6 h-6 text-orange-400" /> Blog Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">{total} posts total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePublishScheduled}
            disabled={publishing}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 rounded-xl text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${publishing ? 'animate-spin' : ''}`} />
            Publish Scheduled
          </button>
          <Link
            href="/dashboard/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(STATUS_CONFIG) as BlogStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? '' : s); setPage(1); }}
              className={`p-4 rounded-2xl border transition-all text-left ${
                filterStatus === s
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{statusCounts[s] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* Filters + Bulk actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
        >
          <option value="">All statuses</option>
          {(Object.keys(STATUS_CONFIG) as BlogStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        {/* Bulk actions — show when items selected */}
        {someSelected && (
          <div className="flex items-center gap-2 ml-auto relative" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-slate-400">{selected.size} selected</span>
            <div className="relative">
              <button
                onClick={() => setBulkMenuOpen((v) => !v)}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-xl text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {bulkLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Bulk Actions <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <p className="text-xs text-slate-500 px-3 pt-2.5 pb-1 uppercase tracking-wider">Set status</p>
                  {(Object.keys(STATUS_CONFIG) as BlogStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => bulkSetStatus(s)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${STATUS_CONFIG[s].color}`}>
                        {STATUS_CONFIG[s].icon}
                      </span>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                  <div className="border-t border-slate-700 mt-1">
                    <button
                      onClick={bulkDelete}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete selected
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Posts table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Select-all header */}
        {!loading && filteredPosts.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/30">
            <button onClick={toggleAll} className="text-slate-400 hover:text-white transition-colors">
              {allSelected ? <CheckSquare className="w-4 h-4 text-orange-400" /> : <Square className="w-4 h-4" />}
            </button>
            <span className="text-xs text-slate-500">
              {allSelected ? 'Deselect all' : `Select all ${filteredPosts.length} on this page`}
            </span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <PenLine className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No posts found.</p>
            <Link href="/dashboard/blog/new" className="inline-block mt-3 text-orange-400 hover:text-orange-300 text-sm">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredPosts.map((post) => {
              const cfg = STATUS_CONFIG[post.status];
              const isSelected = selected.has(post.id);
              return (
                <div
                  key={post.id}
                  className={`flex items-center gap-3 p-4 transition-colors ${isSelected ? 'bg-orange-500/5' : 'hover:bg-white/2'}`}
                >
                  {/* Checkbox */}
                  <button onClick={() => toggleOne(post.id)} className="text-slate-400 hover:text-white transition-colors shrink-0">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-orange-400" /> : <Square className="w-4 h-4" />}
                  </button>

                  {/* Cover */}
                  <div className="w-12 h-12 rounded-xl bg-slate-700 shrink-0 overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {post.countryCode && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {post.countryCode.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{post.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {post.scheduledAt
                        ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        : post.publishedAt
                        ? `Published: ${new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : `Created: ${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      {' · '}{post.readingTimeMins} min read
                    </p>
                  </div>

                  {/* Views */}
                  <div className="hidden sm:flex items-center gap-1 text-slate-400 text-xs shrink-0">
                    <Eye className="w-3.5 h-3.5" /> {post.viewCount.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {post.status === 'PUBLISHED' && (
                      <a
                        href={frontendUrl(post)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on site"
                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Link
                      href={`/dashboard/blog/edit/${post.id}`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing {Math.min((page - 1) * 25 + 1, total)}–{Math.min(page * 25, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-40 hover:border-slate-500 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 25 >= total}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-40 hover:border-slate-500 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
