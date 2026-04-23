"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdDelete, MdSave, MdAccessTime } from "react-icons/md";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Slot = { dayOfWeek: number; startTime: string; endTime: string };
type Service = { id: number; name: string; availableForBooking: boolean; duration: number; rateType: string | null; rateUnit: string | null };
type ServiceUI = Service & { durationValue: number; durationUnit: string };

const DEFAULT_SLOT: Omit<Slot, "dayOfWeek"> = { startTime: "09:00", endTime: "17:00" };

const RATE_TYPES = ["hourly", "fixed", "daily", "session"];
const DURATION_UNITS = [
  { label: "minutes", value: "minutes", factor: 1 },
  { label: "hours",   value: "hours",   factor: 60 },
  { label: "days",    value: "days",    factor: 1440 },
  { label: "weeks",   value: "weeks",   factor: 10080 },
  { label: "months",  value: "months",  factor: 43200 },
];

function toDisplay(minutes: number): { value: number; unit: string } {
  if (minutes >= 43200 && minutes % 43200 === 0) return { value: minutes / 43200, unit: "months" };
  if (minutes >= 10080 && minutes % 10080 === 0) return { value: minutes / 10080, unit: "weeks" };
  if (minutes >= 1440 && minutes % 1440 === 0)   return { value: minutes / 1440,  unit: "days" };
  if (minutes >= 60   && minutes % 60 === 0)     return { value: minutes / 60,    unit: "hours" };
  return { value: minutes, unit: "minutes" };
}

function toMinutes(value: number, unit: string): number {
  const u = DURATION_UNITS.find(d => d.value === unit);
  return Math.round(value * (u?.factor ?? 1));
}

export default function AvailabilityPage() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  const [allowBooking, setAllowBooking]               = useState(false);
  const [blockSlot, setBlockSlot]                     = useState(true);
  const [urgentBooking, setUrgentBooking]             = useState(false);
  const [urgentFeePercent, setUrgentFeePercent]       = useState(50);
  const [slots, setSlots]                             = useState<Slot[]>([]);
  const [services, setServices]                       = useState<ServiceUI[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/expert-availability");
      if (!r.ok) { setLoading(false); return; }
      const d = await r.json();
      setAllowBooking(d.allowBooking ?? false);
      setBlockSlot(d.blockSlotAfterBooking ?? true);
      setUrgentBooking(d.urgentBooking ?? false);
      setUrgentFeePercent(d.urgentFeePercent ?? 50);
      setSlots(d.availability ?? []);
      setServices((d.services ?? []).map((s: Service) => {
        const { value, unit } = toDisplay(s.duration || 60);
        return { ...s, durationValue: value, durationUnit: unit };
      }));
      setLoading(false);
    })();
  }, []);

  const addSlot = (day: number) => setSlots(prev => [...prev, { dayOfWeek: day, ...DEFAULT_SLOT }]);
  const removeSlot = (idx: number) => setSlots(prev => prev.filter((_, i) => i !== idx));
  const updateSlot = (idx: number, key: keyof Slot, val: string | number) =>
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));

  const updateService = (id: number, key: keyof ServiceUI, val: boolean | number | string) =>
    setServices(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s));

  const save = async () => {
    setSaving(true);
    setError("");
    const r = await fetch("/api/expert-availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowBooking, blockSlotAfterBooking: blockSlot, urgentBooking, urgentFeePercent, slots }),
    });

    // Save each service's booking settings (convert display unit → minutes)
    for (const svc of services) {
      const durationMins = toMinutes(svc.durationValue, svc.durationUnit);
      await fetch(`/api/expert/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableForBooking: svc.availableForBooking, duration: durationMins, rateType: svc.rateType }),
      });
    }

    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = await r.json(); setError(d.error || "Save failed"); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  const slotsByDay = DAYS.map((_, day) => ({ day, slots: slots.map((s, i) => ({ ...s, idx: i })).filter(s => s.dayOfWeek === day) }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Availability & Booking</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure your booking settings and weekly schedule</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm transition-colors"
        >
          {saving ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <MdSave />}
          Save Changes
        </button>
      </div>

      {error && <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>}
      {saved && <div className="bg-green-500/15 border border-green-500/25 text-green-300 text-sm rounded-xl px-4 py-3">Changes saved successfully.</div>}

      {/* Booking toggles */}
      <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-white">Booking Settings</h2>

        <Toggle
          label="Accept Bookings"
          description="Allow clients to book sessions with you"
          checked={allowBooking}
          onChange={setAllowBooking}
        />
        <Toggle
          label="Block Slot After Booking"
          description="Prevent double-bookings by blocking confirmed time slots"
          checked={blockSlot}
          onChange={setBlockSlot}
        />
        <Toggle
          label="Urgent Bookings"
          description="Allow clients to mark a booking as urgent for a higher fee"
          checked={urgentBooking}
          onChange={setUrgentBooking}
        />
        {urgentBooking && (
          <div className="flex items-center gap-3 pt-1">
            <label className="text-sm text-slate-300 shrink-0">Urgent fee surcharge</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={200}
                value={urgentFeePercent}
                onChange={e => setUrgentFeePercent(Number(e.target.value))}
                className="w-20 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-center outline-none focus:border-orange-500/40"
              />
              <span className="text-slate-400 text-sm">%</span>
            </div>
          </div>
        )}
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">Services</h2>
          <p className="text-xs text-slate-400">Enable booking for specific services and set session durations.</p>
          <div className="space-y-3">
            {services.map(svc => (
              <div key={svc.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => updateService(svc.id, "availableForBooking", !svc.availableForBooking)}
                    className={`w-10 h-5 rounded-full transition-colors shrink-0 ${svc.availableForBooking ? "bg-orange-500" : "bg-slate-600"}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full mx-0.5 transition-transform ${svc.availableForBooking ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <p className="text-sm font-medium text-white truncate">{svc.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MdAccessTime className="text-slate-500 text-sm" />
                    <input
                      type="number"
                      min={1}
                      value={svc.durationValue}
                      onChange={e => updateService(svc.id, "durationValue", Number(e.target.value))}
                      className="w-14 bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-orange-500/40"
                    />
                    <select
                      value={svc.durationUnit}
                      onChange={e => updateService(svc.id, "durationUnit", e.target.value)}
                      className="bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-orange-500/40"
                    >
                      {DURATION_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>
                  <select
                    value={svc.rateType || "hourly"}
                    onChange={e => updateService(svc.id, "rateType", e.target.value)}
                    className="bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-orange-500/40"
                  >
                    {RATE_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly schedule */}
      <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-bold text-white">Weekly Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">Set your available hours for each day. Minimum 30-minute slots.</p>
        </div>
        {slotsByDay.map(({ day, slots: daySlots }) => (
          <div key={day} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${daySlots.length > 0 ? "text-white" : "text-slate-500"}`}>{DAYS[day]}</p>
              <button
                onClick={() => addSlot(day)}
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
              >
                <MdAdd /> Add slot
              </button>
            </div>
            {daySlots.length === 0 && (
              <p className="text-xs text-slate-600 italic">No slots — day off</p>
            )}
            {daySlots.map(s => (
              <div key={s.idx} className="flex items-center gap-3 bg-slate-900/40 border border-white/5 rounded-xl px-4 py-2">
                <input
                  type="time"
                  value={s.startTime}
                  onChange={e => updateSlot(s.idx, "startTime", e.target.value)}
                  className="bg-transparent text-sm text-white outline-none"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="time"
                  value={s.endTime}
                  onChange={e => updateSlot(s.idx, "endTime", e.target.value)}
                  className="bg-transparent text-sm text-white outline-none"
                />
                <button
                  onClick={() => removeSlot(s.idx)}
                  className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
                >
                  <MdDelete />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-orange-500" : "bg-slate-600"}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
