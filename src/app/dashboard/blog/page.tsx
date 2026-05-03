'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PenLine, Plus, Search, Filter, Calendar, Eye, Globe,
  Trash2, Edit, CheckCircle, Clock, Archive, FileText, RefreshCw,
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
  DRAFT:     { label: 'Draft',     color: 'bg-slate-700 text-slate-300',   icon: <FileText className="w-3 h-3" /> },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-300',  icon: <Clock className="w-3 h-3" /> },
  PUBLISHED: { label: 'Published', color: 'bg-green-500/20 text-green-300', icon: <CheckCircle className="w-3 h-3" /> },
  ARCHIVED:  { label: 'Archived',  color: 'bg-slate-800 text-slate-500',   icon: <Archive className="w-3 h-3" /> },
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
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

  const filteredPosts = search
    ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search))
    : posts;

  const statusCounts = posts.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
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
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
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

      {/* Filters */}
      <div className="flex items-center gap-3">
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
      </div>

      {/* Posts table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
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
              return (
                <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors">
                  {/* Cover */}
                  <div className="w-14 h-14 rounded-xl bg-slate-700 shrink-0 overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-500" />
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

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-1 text-slate-400 text-xs shrink-0">
                    <Eye className="w-3.5 h-3.5" /> {post.viewCount.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
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
