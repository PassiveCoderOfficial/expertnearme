"use client";

import { useEffect, useState } from "react";
import { MdCalendarToday, MdAccessTime, MdClose, MdCheck, MdFlashOn, MdAdd, MdRemove } from "react-icons/md";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type AvailSlot  = { dayOfWeek: number; startTime: string; endTime: string };
type Service    = { id: number; name: string; duration: number; rateUnit: string | null; rateType: string | null; description: string | null };
type BookedSlot = { scheduledAt: string; endsAt: string | null };

function pad(n: number) { return String(n).padStart(2, "0"); }

function generateTimeSlots(avail: AvailSlot[], date: Date, booked: BookedSlot[], slotDuration: number): string[] {
  const dow = date.getDay();
  const daySlots = avail.filter(a => a.dayOfWeek === dow);
  if (!daySlots.length) return [];
  const now = new Date();
  const slots: string[] = [];
  for (const slot of daySlots) {
    const [sh, sm] = slot.startTime.split(":").map(Number);
    const [eh, em] = slot.endTime.split(":").map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur + slotDuration <= end) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(cur / 60), cur % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
      const isBooked = booked.some(b => {
        const bs = new Date(b.scheduledAt).getTime();
        const be = b.endsAt ? new Date(b.endsAt).getTime() : bs + slotDuration * 60000;
        return slotStart.getTime() < be && slotEnd.getTime() > bs;
      });
      if (!isBooked && slotStart > now) slots.push(`${pad(Math.floor(cur / 60))}:${pad(cur % 60)}`);
      cur += 30;
    }
  }
  return slots;
}

type Step = "slots" | "form" | "auth" | "done";

export default function BookingWidget({ expertSlug }: { expertSlug: string; countryCode: string }) {
  const [avail, setAvail]         = useState<AvailSlot[]>([]);
  const [booked, setBooked]       = useState<BookedSlot[]>([]);
  const [services, setServices]   = useState<Service[]>([]);
  const [urgentOk, setUrgentOk]   = useState(false);
  const [urgentFee, setUrgentFee] = useState(50);
  const [loading, setLoading]     = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const [selectedDate, setSelectedDate]   = useState<Date | null>(null);
  const [selectedTime, setSelectedTime]   = useState<string | null>(null);
  const [slotCount, setSlotCount]         = useState(1);
  const [selectedSvc, setSelectedSvc]     = useState<number | null>(null);
  const [isUrgent, setIsUrgent]           = useState(false);
  const [notes, setNotes]                 = useState("");
  const [step, setStep]                   = useState<Step>("slots");

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear]   = useState(now.getFullYear());

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/expert/${expertSlug}/availability?year=${calYear}&month=${calMonth + 1}`);
      if (!r.ok) { setUnavailable(true); setLoading(false); return; }
      const d = await r.json();
      setAvail(d.availability || []);
      setBooked(d.bookedSlots || []);
      setServices(d.services || []);
      setUrgentOk(d.urgentBooking || false);
      setUrgentFee(d.urgentFeePercent || 50);
      if (d.services?.length > 0) setSelectedSvc(d.services[0].id);
      setLoading(false);
    })();
  }, [expertSlug, calMonth, calYear]);

  const svc = services.find(s => s.id === selectedSvc);
  const baseDuration = svc?.duration || 60;
  const totalDuration = baseDuration * slotCount;
  const timeSlots = selectedDate ? generateTimeSlots(avail, selectedDate, booked, totalDuration) : [];

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow    = new Date(calYear, calMonth, 1).getDay();

  const hasSlots = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    return generateTimeSlots(avail, d, booked, baseDuration).length > 0;
  };

  const submit = async () => {
    if (!selectedDate || !selectedTime || !selectedSvc) return;
    const [h, m] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(h, m, 0, 0);
    const r = await fetch(`/api/expert/${expertSlug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: selectedSvc, scheduledAt, notes, isUrgent, slotCount }),
    });
    if (r.ok) setStep("done");
    else { const d = await r.json(); setAuthError(d.error || "Booking failed"); }
  };

  const handleAuth = async () => {
    setSubmitting(true);
    setAuthError("");
    const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const body = authMode === "signup" ? { name, email, password, role: "BUYER" } : { email, password };
    const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { await submit(); }
    else { const d = await r.json(); setAuthError(d.error || "Auth failed"); }
    setSubmitting(false);
  };

  const tryBook = async () => {
    setSubmitting(true);
    const test = await fetch("/api/auth/me");
    if (test.ok) { await submit(); }
    else { setStep("auth"); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-24"><div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" /></div>;
  if (unavailable) return null;

  if (step === "done") return (
    <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
        <MdCheck className="text-green-400 text-2xl" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">Booking Request Sent!</h3>
      <p className="text-slate-400 text-sm">The expert will confirm shortly. Check your notifications for updates.</p>
    </div>
  );

  if (step === "auth") return (
    <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Sign in to Book</h3>
        <button onClick={() => setStep("form")} className="text-slate-500 hover:text-slate-300"><MdClose /></button>
      </div>
      <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl">
        {(["signup", "login"] as const).map(m => (
          <button key={m} onClick={() => setAuthMode(m)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${authMode === m ? "bg-orange-500 text-slate-900" : "text-slate-400 hover:text-white"}`}>
            {m === "signup" ? "Create Account" : "Log In"}
          </button>
        ))}
      </div>
      {authMode === "signup" && <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40" />}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40" />
      {authError && <p className="text-red-400 text-xs">{authError}</p>}
      <button onClick={handleAuth} disabled={submitting} className="w-full py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm transition-colors">
        {submitting ? "Processing…" : authMode === "signup" ? "Create Account & Book" : "Log In & Book"}
      </button>
    </div>
  );

  if (step === "form") return (
    <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Confirm Booking</h3>
        <button onClick={() => setStep("slots")} className="text-slate-500 hover:text-slate-300"><MdClose /></button>
      </div>
      <div className="bg-slate-900/60 border border-white/8 rounded-xl px-3 py-2.5 text-xs">
        <p className="text-white font-medium">{selectedDate?.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })} at {selectedTime}</p>
        {svc && <p className="text-orange-300 mt-0.5">{svc.name} · {totalDuration >= 60 ? `${totalDuration / 60}h` : `${totalDuration}min`}{slotCount > 1 ? ` (${slotCount} sessions)` : ""}</p>}
      </div>
      {services.length > 1 && (
        <select value={selectedSvc || ""} onChange={e => setSelectedSvc(Number(e.target.value))} className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40">
          {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration}min)</option>)}
        </select>
      )}
      {/* Slot count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Number of sessions</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setSlotCount(c => Math.max(1, c - 1))} className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white text-xs transition-colors"><MdRemove /></button>
          <span className="text-sm font-bold text-white w-5 text-center">{slotCount}</span>
          <button onClick={() => setSlotCount(c => c + 1)} className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white text-xs transition-colors"><MdAdd /></button>
        </div>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)…" className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40 resize-none" />
      {urgentOk && (
        <button onClick={() => setIsUrgent(!isUrgent)} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-colors w-full ${isUrgent ? "bg-red-500/15 border-red-500/25 text-red-300" : "bg-slate-900/40 border-white/8 text-slate-400 hover:text-white"}`}>
          <MdFlashOn /> Urgent {isUrgent ? `(+${urgentFee}% fee)` : ""}
        </button>
      )}
      {authError && <p className="text-red-400 text-xs">{authError}</p>}
      <button onClick={tryBook} disabled={submitting} className="w-full py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm transition-colors">
        {submitting ? "Processing…" : "Send Booking Request"}
      </button>
    </div>
  );

  return (
    <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <MdCalendarToday className="text-orange-400 text-sm" />
        <h3 className="font-bold text-white text-sm">Book a Session</h3>
      </div>

      {/* Service selector */}
      {services.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {services.map(s => (
            <button key={s.id} onClick={() => { setSelectedSvc(s.id); setSelectedTime(null); }} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${selectedSvc === s.id ? "bg-orange-500/20 border-orange-500/40 text-orange-300" : "bg-slate-900/40 border-white/8 text-slate-400 hover:text-white"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Compact calendar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => { const d = new Date(calYear, calMonth - 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); setSelectedDate(null); setSelectedTime(null); }} className="text-slate-400 hover:text-white w-6 h-6 flex items-center justify-center rounded text-sm">‹</button>
          <p className="text-xs font-semibold text-white">{new Date(calYear, calMonth).toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
          <button onClick={() => { const d = new Date(calYear, calMonth + 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); setSelectedDate(null); setSelectedTime(null); }} className="text-slate-400 hover:text-white w-6 h-6 flex items-center justify-center rounded text-sm">›</button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {DAYS.map(d => <p key={d} className="text-[9px] text-slate-600 font-medium text-center py-0.5">{d}</p>)}
          {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(calYear, calMonth, day);
            const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const open   = !isPast && hasSlots(day);
            const sel    = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={day}
                onClick={() => { if (!open) return; setSelectedDate(date); setSelectedTime(null); }}
                disabled={!open}
                className={`aspect-square rounded text-[11px] font-medium transition-colors ${sel ? "bg-orange-500 text-slate-900" : open ? "bg-slate-700 hover:bg-slate-600 text-white" : isPast ? "text-slate-800 cursor-not-allowed" : "text-slate-700 cursor-not-allowed"}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-[10px] text-slate-500 mb-1.5 flex items-center gap-1"><MdAccessTime className="text-xs" /> Available times</p>
          {timeSlots.length === 0 ? (
            <p className="text-xs text-slate-600">No slots available for this day.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {timeSlots.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${selectedTime === t ? "bg-orange-500 border-orange-500 text-slate-900" : "bg-slate-900/40 border-white/8 text-slate-300 hover:border-orange-500/40"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedDate && selectedTime && (
        <button onClick={() => setStep("form")} className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold rounded-xl text-sm transition-colors">
          Continue →
        </button>
      )}
    </div>
  );
}
