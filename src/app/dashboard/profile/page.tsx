'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Save, ExternalLink, Crown, Globe, Phone, MapPin,
  Image, Loader2, CheckCircle, AlertCircle, Building2, User
} from 'lucide-react';

interface Category { id: number; name: string; icon: string | null; slug: string; }
interface Expert {
  id: number;
  name: string;
  email: string;
  businessName: string | null;
  contactPerson: string | null;
  isBusiness: boolean;
  countryCode: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
  shortDesc: string | null;
  webAddress: string | null;
  officeAddress: string | null;
  profilePicture: string | null;
  coverPhoto: string | null;
  mapLocation: string | null;
  profileLink: string | null;
  foundingExpert: boolean;
  categories: { category: Category }[];
}

export default function MyProfilePage() {
  const [expert, setExpert]       = useState<Expert | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({
    name:          '',
    isBusiness:    false,
    businessName:  '',
    contactPerson: '',
    phone:         '',
    whatsapp:      '',
    shortDesc:     '',
    bio:           '',
    webAddress:    '',
    officeAddress: '',
    profilePicture: '',
    coverPhoto:    '',
    mapLocation:   '',
    categoryIds:   [] as number[],
  });

  useEffect(() => {
    fetch('/api/me/expert')
      .then(r => r.json())
      .then(d => {
        if (d.expert) {
          const e: Expert = d.expert;
          setExpert(e);
          setForm({
            name:          e.name          ?? '',
            isBusiness:    e.isBusiness    ?? false,
            businessName:  e.businessName  ?? '',
            contactPerson: e.contactPerson ?? '',
            phone:         e.phone         ?? '',
            whatsapp:      e.whatsapp      ?? '',
            shortDesc:     e.shortDesc     ?? '',
            bio:           e.bio           ?? '',
            webAddress:    e.webAddress    ?? '',
            officeAddress: e.officeAddress ?? '',
            profilePicture: e.profilePicture ?? '',
            coverPhoto:    e.coverPhoto    ?? '',
            mapLocation:   e.mapLocation   ?? '',
            categoryIds:   e.categories.map(c => c.category.id),
          });
          if (e.countryCode) {
            fetch(`/api/country/${e.countryCode}/categories`)
              .then(r => r.json())
              .then(d2 => setCategories(d2.categories ?? []))
              .catch(() => {});
          }
        }
      })
      .catch(() => setError('Failed to load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (id: number) => {
    setForm(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(x => x !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/me/expert', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed.'); return; }
      setExpert(prev => prev ? { ...prev, ...data.expert } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputCls  = 'w-full bg-gray-800 border border-gray-700 focus:border-orange-500 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 outline-none transition-colors text-sm';
  const labelCls  = 'block text-sm font-medium text-gray-300 mb-1';
  const sectionCls = 'bg-white rounded-xl shadow-sm p-6 mb-5';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
    </div>
  );

  if (!expert) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-gray-800">No expert profile found</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Your account doesn't have an expert profile yet.
        </p>
        <Link href="/create-expert-account" className="bg-orange-500 hover:bg-orange-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
          Create Expert Profile
        </Link>
      </div>
    </div>
  );

  const profileUrl = expert.countryCode && expert.profileLink
    ? `/${expert.countryCode}/expert/${expert.profileLink}`
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Changes save immediately and update your public profile.</p>
        </div>
        <div className="flex items-center gap-3">
          {profileUrl && (
            <Link href={profileUrl} target="_blank"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ExternalLink className="h-4 w-4" /> View Profile
            </Link>
          )}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Status banners */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
          <CheckCircle className="h-4 w-4" /> Profile saved successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Founding Expert badge */}
      {expert.foundingExpert && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-5 py-4 mb-5">
          <Crown className="h-5 w-5 text-orange-500 shrink-0" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">Founding Expert</p>
            <p className="text-xs text-gray-500 mt-0.5">You're permanently listed on the <Link href="/founding-experts" className="text-orange-500 hover:underline">Founding Experts</Link> page.</p>
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className={sectionCls} style={{ background: 'white' }}>
        <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <button onClick={() => set('isBusiness', false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors ${!form.isBusiness ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <User className="h-4 w-4" /> Individual
            </button>
            <button onClick={() => set('isBusiness', true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors ${form.isBusiness ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <Building2 className="h-4 w-4" /> Business
            </button>
          </div>
          <div>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          {form.isBusiness && (
            <>
              <div>
                <label className={labelCls}>Business name</label>
                <input className={inputCls} placeholder="Karim Interiors LLC" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Contact person</label>
                <input className={inputCls} placeholder="Ahmad Karim" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls + ' opacity-60 cursor-not-allowed'} value={expert.email} readOnly />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input className={inputCls + ' opacity-60 cursor-not-allowed'} value={expert.countryCode?.toUpperCase() ?? ''} readOnly />
            <p className="text-xs text-gray-400 mt-1">Contact support to change country.</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={sectionCls} style={{ background: 'white' }}>
        <h2 className="font-semibold text-gray-800 mb-4"><Phone className="inline h-4 w-4 mr-1.5 text-gray-400" />Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} placeholder="+65 9123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} placeholder="+65 9123 4567" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}><Globe className="inline h-3.5 w-3.5 mr-1" />Website</label>
          <input className={inputCls} placeholder="https://yourwebsite.com" value={form.webAddress} onChange={e => set('webAddress', e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelCls}><MapPin className="inline h-3.5 w-3.5 mr-1" />Office address</label>
          <input className={inputCls} placeholder="123 Main St, Singapore" value={form.officeAddress} onChange={e => set('officeAddress', e.target.value)} />
        </div>
      </div>

      {/* Profile content */}
      <div className={sectionCls} style={{ background: 'white' }}>
        <h2 className="font-semibold text-gray-800 mb-4">Profile Content</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Short description <span className="text-gray-400">({form.shortDesc.length}/160)</span></label>
            <textarea className={inputCls} rows={2} maxLength={160} placeholder="One or two sentences about what you do." value={form.shortDesc} onChange={e => set('shortDesc', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Full bio</label>
            <textarea className={inputCls} rows={4} placeholder="Your background, experience, specialisations..." value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className={sectionCls} style={{ background: 'white' }}>
        <h2 className="font-semibold text-gray-800 mb-4"><Image className="inline h-4 w-4 mr-1.5 text-gray-400" />Media (paste URLs)</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Profile picture URL</label>
            <input className={inputCls} placeholder="https://…/photo.jpg" value={form.profilePicture} onChange={e => set('profilePicture', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Cover photo URL</label>
            <input className={inputCls} placeholder="https://…/cover.jpg" value={form.coverPhoto} onChange={e => set('coverPhoto', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Google Maps link / coordinates</label>
            <input className={inputCls} placeholder="https://maps.google.com/… or 1.3521,103.8198" value={form.mapLocation} onChange={e => set('mapLocation', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className={sectionCls} style={{ background: 'white' }}>
          <h2 className="font-semibold text-gray-800 mb-1">Categories</h2>
          <p className="text-xs text-gray-500 mb-4">Pick up to 5 that describe your work. {form.categoryIds.length}/5 selected.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(cat => {
              const sel = form.categoryIds.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors text-left ${sel ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <span>{cat.icon ?? '📌'}</span>
                  <span className="text-xs font-medium truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save footer */}
      <div className="flex justify-end pb-10">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
