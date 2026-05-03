'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, ArrowLeft, Eye, Globe, Tag, Calendar, Image as ImageIcon,
  Search, Link as LinkIcon, CheckCircle, Clock, FileText, Loader2,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false, loading: () => (
  <div className="rounded-xl border border-slate-700 bg-slate-900 min-h-[400px] flex items-center justify-center">
    <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
  </div>
) });

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  altText: string;
  authorName: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string;
  scheduledAt: string;
  countryCode: string;
  categoryTag: string;
  tags: string;
  metaTitle: string;
  metaDesc: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogImage: string;
  ogTitle: string;
  ogDesc: string;
  noIndex: boolean;
  readingTimeMins: number;
}

const EMPTY: BlogPostData = {
  title: '', slug: '', excerpt: '', content: '', coverImage: '', altText: '',
  authorName: 'ExpertNear.Me Team', status: 'DRAFT', publishedAt: '', scheduledAt: '',
  countryCode: '', categoryTag: '', tags: '', metaTitle: '', metaDesc: '',
  focusKeyword: '', canonicalUrl: '', ogImage: '', ogTitle: '', ogDesc: '',
  noIndex: false, readingTimeMins: 5,
};

const COUNTRIES = ['sg', 'ae', 'sa', 'bd', 'my', 'qa', 'om'];
const CATEGORY_TAGS = [
  'interior-design', 'renovation', 'cleaning', 'it-technology', 'healthcare',
  'education', 'photography', 'events-weddings', 'beauty-wellness', 'legal',
  'automotive', 'food-catering', 'engineering', 'furniture',
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function estimateReadingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface Tab { id: string; label: string; icon: React.ReactNode }
const TABS: Tab[] = [
  { id: 'content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
  { id: 'seo',     label: 'SEO',     icon: <Search className="w-4 h-4" /> },
  { id: 'og',      label: 'Social',  icon: <Globe className="w-4 h-4" /> },
  { id: 'schedule',label: 'Publish', icon: <Calendar className="w-4 h-4" /> },
];

export default function BlogPostEditor({ postId }: { postId?: number }) {
  const router = useRouter();
  const [data, setData] = useState<BlogPostData>(EMPTY);
  const [tab, setTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const [autoSlug, setAutoSlug] = useState(!postId);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/blog/${postId}`)
      .then((r) => r.json())
      .then((post) => {
        setData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          coverImage: post.coverImage || '',
          altText: post.altText || '',
          authorName: post.authorName || 'ExpertNear.Me Team',
          status: post.status || 'DRAFT',
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
          countryCode: post.countryCode || '',
          categoryTag: post.categoryTag || '',
          tags: post.tags || '',
          metaTitle: post.metaTitle || '',
          metaDesc: post.metaDesc || '',
          focusKeyword: post.focusKeyword || '',
          canonicalUrl: post.canonicalUrl || '',
          ogImage: post.ogImage || '',
          ogTitle: post.ogTitle || '',
          ogDesc: post.ogDesc || '',
          noIndex: post.noIndex || false,
          readingTimeMins: post.readingTimeMins || 5,
        });
        setAutoSlug(false);
        setLoading(false);
      });
  }, [postId]);

  const set = (field: keyof BlogPostData, value: any) => {
    setData((d) => {
      const next = { ...d, [field]: value };
      if (field === 'title' && autoSlug) next.slug = slugify(value);
      if (field === 'content') next.readingTimeMins = estimateReadingTime(value);
      return next;
    });
  };

  const handleSave = async (statusOverride?: string) => {
    setSaving(true);
    setSavingAction(statusOverride ?? 'save');
    const payload = {
      ...data,
      status: statusOverride || data.status,
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
      countryCode: data.countryCode || null,
      categoryTag: data.categoryTag || null,
    };

    const res = postId
      ? await fetch(`/api/admin/blog/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

    setSaving(false);
    setSavingAction(null);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (!postId) {
        const created = await res.json();
        router.replace(`/dashboard/blog/edit/${created.id}`);
      }
    }
  };

  const metaDescLen = data.metaDesc.length;
  const metaTitleLen = (data.metaTitle || data.title).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/blog')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">
            {postId ? 'Edit Post' : 'New Blog Post'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={data.status}
            onChange={(e) => set('status', e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
        <input
          type="text"
          value={data.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Post title..."
          className="w-full text-2xl font-bold bg-transparent text-white placeholder-slate-500 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm shrink-0">Slug:</span>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => { setAutoSlug(false); set('slug', e.target.value); }}
            className="flex-1 text-sm bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>
        <input
          type="text"
          value={data.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          placeholder="Short excerpt (shows in listing and meta description fallback)..."
          className="w-full text-sm bg-transparent text-slate-400 placeholder-slate-600 focus:outline-none border-t border-slate-700/50 pt-3"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.icon} <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Content */}
      {tab === 'content' && (
        <div className="space-y-4">
          {/* Cover image */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" /> Cover Image
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="url"
                value={data.coverImage}
                onChange={(e) => set('coverImage', e.target.value)}
                placeholder="https://... cover image URL"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <input
                type="text"
                value={data.altText}
                onChange={(e) => set('altText', e.target.value)}
                placeholder="Alt text for accessibility & SEO"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            {data.coverImage && (
              <img src={data.coverImage} alt={data.altText} className="mt-3 h-32 w-full object-cover rounded-xl" />
            )}
          </div>

          {/* Content */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Content</label>
              <span className="text-xs text-slate-500">{data.readingTimeMins} min read</span>
            </div>
            <RichTextEditor
              value={data.content}
              onChange={(html) => set('content', html)}
              placeholder="Write your blog post content here…"
            />
          </div>

          {/* Author & Classification */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Classification & Author
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Author Name</label>
                <input
                  type="text"
                  value={data.authorName}
                  onChange={(e) => set('authorName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Country (optional)</label>
                <select
                  value={data.countryCode}
                  onChange={(e) => set('countryCode', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Global (all countries)</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Category Tag</label>
                <select
                  value={data.categoryTag}
                  onChange={(e) => set('categoryTag', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">None</option>
                  {CATEGORY_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-slate-500 mb-1 block">Tags (comma-separated)</label>
              <input
                type="text"
                value={data.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="interior design, Singapore, home renovation"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: SEO */}
      {tab === 'seo' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-orange-400" /> SEO Settings
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-500">Meta Title</label>
              <span className={`text-xs ${metaTitleLen > 60 ? 'text-red-400' : metaTitleLen > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                {metaTitleLen}/60
              </span>
            </div>
            <input
              type="text"
              value={data.metaTitle}
              onChange={(e) => set('metaTitle', e.target.value)}
              placeholder={data.title || 'Meta title (leave blank to use post title)'}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-500">Meta Description</label>
              <span className={`text-xs ${metaDescLen > 160 ? 'text-red-400' : metaDescLen > 120 ? 'text-yellow-400' : 'text-green-400'}`}>
                {metaDescLen}/160
              </span>
            </div>
            <textarea
              value={data.metaDesc}
              onChange={(e) => set('metaDesc', e.target.value)}
              placeholder={data.excerpt || 'Meta description for search engines...'}
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Focus Keyword</label>
            <input
              type="text"
              value={data.focusKeyword}
              onChange={(e) => set('focusKeyword', e.target.value)}
              placeholder="e.g. interior designer Singapore"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Canonical URL (optional)</label>
            <input
              type="url"
              value={data.canonicalUrl}
              onChange={(e) => set('canonicalUrl', e.target.value)}
              placeholder="https://expertnear.me/blog/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
            <input
              type="checkbox"
              id="noIndex"
              checked={data.noIndex}
              onChange={(e) => set('noIndex', e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="noIndex" className="text-sm text-slate-300">
              noindex — exclude from search engines (useful for draft/test posts)
            </label>
          </div>

          {/* Live SERP preview */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Google Preview</p>
            <p className="text-blue-400 text-sm font-medium truncate">{data.metaTitle || data.title || 'Post Title'}</p>
            <p className="text-green-600 text-xs mt-0.5">https://expertnear.me/blog/{data.slug || 'post-slug'}</p>
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{data.metaDesc || data.excerpt || 'Meta description will appear here...'}</p>
          </div>
        </div>
      )}

      {/* Tab: Social / OG */}
      {tab === 'og' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" /> Open Graph / Social Share
          </h3>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">OG Image URL</label>
            <input
              type="url"
              value={data.ogImage}
              onChange={(e) => set('ogImage', e.target.value)}
              placeholder={data.coverImage || 'https://... og:image (1200×630px recommended)'}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">OG Title</label>
            <input
              type="text"
              value={data.ogTitle}
              onChange={(e) => set('ogTitle', e.target.value)}
              placeholder={data.metaTitle || data.title || 'Social share title'}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">OG Description</label>
            <textarea
              value={data.ogDesc}
              onChange={(e) => set('ogDesc', e.target.value)}
              placeholder={data.metaDesc || data.excerpt || 'Social share description'}
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Social preview */}
          {(data.ogImage || data.coverImage) && (
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
              <img
                src={data.ogImage || data.coverImage}
                alt=""
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <p className="text-xs text-slate-500 uppercase">expertnear.me</p>
                <p className="text-white text-sm font-semibold mt-1">{data.ogTitle || data.metaTitle || data.title}</p>
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{data.ogDesc || data.metaDesc || data.excerpt}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Publish/Schedule */}
      {tab === 'schedule' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" /> Publishing Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => set('status', s)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      data.status === s
                        ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Scheduled Publish Date/Time</label>
                <input
                  type="datetime-local"
                  value={data.scheduledAt}
                  onChange={(e) => set('scheduledAt', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
                <p className="text-xs text-slate-600 mt-1">Set status to &quot;SCHEDULED&quot; to auto-publish at this time.</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Publish Date (manual)</label>
                <input
                  type="datetime-local"
                  value={data.publishedAt}
                  onChange={(e) => set('publishedAt', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Quick publish actions */}
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSave('PUBLISHED')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {saving && savingAction === 'PUBLISHED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving && savingAction === 'PUBLISHED' ? 'Publishing…' : 'Publish Now'}
              </button>
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {saving && savingAction === 'DRAFT' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {saving && savingAction === 'DRAFT' ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSave('SCHEDULED')}
                disabled={!data.scheduledAt || saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving && savingAction === 'SCHEDULED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                {saving && savingAction === 'SCHEDULED' ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
