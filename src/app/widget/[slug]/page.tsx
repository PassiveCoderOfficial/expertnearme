'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, Loader2, AlertCircle, Calendar } from 'lucide-react';

type Service = { id: number; name: string; description: string | null; price: number; rateUnit: string | null; duration: number | null };
type Expert = { id: number; name: string; businessName: string | null; profilePicture: string | null; allowBooking: boolean; urgentBooking: boolean; urgentFeePercent: number; services: Service[] };

type Step = 'service' | 'details' | 'confirm' | 'done' | 'error';

export default function BookingWidget() {
  const { slug } = useParams<{ slug: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', notes: '', isUrgent: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/public/widget/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.expert) setExpert(d.expert);
        else setLoadError(d.error || 'Not available');
      })
      .catch(() => setLoadError('Failed to load'))
      .finally(() => setLoading(false));
  }, [slug]);

  const displayName = expert?.businessName || expert?.name || '';

  const submit = async () => {
    if (!form.name || !form.date || !form.time) { setSubmitError('Name, date and time are required'); return; }
    setSubmitting(true); setSubmitError('');
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertSlug: slug,
          serviceId: selectedService?.id || null,
          scheduledAt,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          notes: form.notes || null,
          isUrgent: form.isUrgent,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || 'Something went wrong'); return; }
      setBookingId(data.bookingId);
      setStep('done');
    } catch { setSubmitError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600 text-sm">{loadError}</p>
      </div>
    </div>
  );

  if (step === 'done') return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <Check className="h-7 w-7 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Booking Requested!</h2>
        <p className="text-slate-500 text-sm mb-1">{displayName} will confirm your appointment shortly.</p>
        {bookingId && <p className="text-xs text-slate-400">Ref: #{bookingId}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        {expert?.profilePicture ? (
          <img src={expert.profilePicture} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold leading-tight">{displayName}</p>
          <p className="text-xs text-slate-400 leading-tight">Book a session</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-sm mx-auto">
        {/* Step: service selection */}
        {step === 'service' && (
          <>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Select a service</p>
            {expert!.services.length === 0 ? (
              <p className="text-sm text-slate-500">No bookable services listed yet.</p>
            ) : (
              <div className="space-y-2">
                {expert!.services.map(s => (
                  <button key={s.id} onClick={() => { setSelectedService(s); setStep('details'); }}
                    className="w-full text-left border border-slate-200 rounded-xl p-3 hover:border-orange-400 hover:bg-orange-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium group-hover:text-orange-600">{s.name}</span>
                      <span className="text-sm font-bold text-orange-500">${s.price}</span>
                    </div>
                    {s.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{s.description}</p>}
                    {s.duration && <p className="text-xs text-slate-400 mt-0.5">{s.duration} min</p>}
                  </button>
                ))}
                <button onClick={() => { setSelectedService(null); setStep('details'); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors">
                  Skip — book general consultation
                </button>
              </div>
            )}
          </>
        )}

        {/* Step: contact details */}
        {step === 'details' && (
          <>
            {selectedService && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm">
                <span className="font-medium text-orange-700">{selectedService.name}</span>
                <span className="text-orange-500 ml-2">${selectedService.price}</span>
              </div>
            )}
            <p className="text-xs text-slate-400 uppercase tracking-widest">Your details</p>
            <div className="space-y-3">
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Phone / WhatsApp', key: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Date *</label>
                  <input type="date" min={minDate} value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Time *</label>
                  <input type="time" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                <textarea rows={3} placeholder="Anything the expert should know..." value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors resize-none" />
              </div>
              {expert!.urgentBooking && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isUrgent} onChange={e => setForm(f => ({ ...f, isUrgent: e.target.checked }))}
                    className="accent-orange-500" />
                  <span className="text-xs text-slate-600">Urgent (+{expert!.urgentFeePercent}% fee)</span>
                </label>
              )}
            </div>
            {submitError && <p className="text-xs text-red-500">{submitError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep('service')}
                className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                Back
              </button>
              <button onClick={submit} disabled={submitting}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                {submitting ? 'Booking…' : 'Request Booking'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="text-center pb-4">
        <a href="https://expertnear.me" target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-slate-300 hover:text-slate-400 transition-colors">
          Powered by ExpertNear.Me
        </a>
      </div>
    </div>
  );
}
