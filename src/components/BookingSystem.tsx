'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Star,
  DollarSign,
  Zap,
} from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: string;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  timeSlots: TimeSlot[];
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  availableForBooking?: boolean;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  bio: string;
  services: Service[];
  location?: { address: string; city: string };
  workingHours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
}

interface Booking {
  id?: number;
  serviceId: number;
  selectedDate: string;
  selectedTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
}

interface BookingSystemProps {
  provider: Provider;
  onBookingComplete?: (booking: Booking) => void;
  onBookingCancelled?: (bookingId?: number) => void;
}

const STEPS = ['Service', 'Date & Time', 'Details', 'Confirm'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingSystem({ provider, onBookingComplete }: BookingSystemProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [days, setDays] = useState<DaySchedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { generateCalendarDays(); }, [currentMonth, currentYear]);

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const wh = provider.workingHours[dayKey];
    if (!wh?.available) return [];
    const slots: TimeSlot[] = [];
    const [sh, sm] = wh.start.split(':').map(Number);
    const [eh] = wh.end.split(':').map(Number);
    for (let h = sh; h < eh; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push({
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          available: Math.random() > 0.3,
        });
      }
    }
    return slots;
  };

  const generateCalendarDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const newDays: DaySchedule[] = [];

    for (let i = 0; i < firstDay; i++) {
      newDays.push({ date: '', dayName: '', isToday: false, isPast: false, timeSlots: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateStr = date.toISOString().split('T')[0];
      newDays.push({
        date: dateStr,
        dayName: DAY_NAMES[date.getDay()],
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        timeSlots: generateTimeSlots(date),
      });
    }
    setDays(newDays);
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
      if (currentMonth === 0) setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
      if (currentMonth === 11) setCurrentYear((y) => y + 1);
    }
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 1 && !selectedService) e.service = 'Select a service';
    if (step === 2) {
      if (!selectedDate) e.date = 'Select a date';
      if (!selectedTime) e.time = 'Select a time';
    }
    if (step === 3) {
      if (!customerName.trim()) e.name = 'Name required';
      if (!customerEmail.trim()) e.email = 'Email required';
      else if (!/\S+@\S+\.\S+/.test(customerEmail)) e.email = 'Invalid email';
      if (!customerPhone.trim()) e.phone = 'Phone required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep() && step < 4) setStep(step + 1); };
  const handlePrevious = () => { if (step > 1) setStep(step - 1); };

  const handleBooking = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    const booking: Booking = {
      serviceId: selectedService!.id,
      selectedDate,
      selectedTime,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      status: 'pending',
      totalAmount: selectedService!.price,
    };
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      onBookingComplete?.(booking);
    }, 1500);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long' });
  const selectedDaySlots = days.find((d) => d.date === selectedDate)?.timeSlots ?? [];
  const availableSlots = selectedDaySlots.filter((s) => s.available);

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking Requested!</h2>
        <p className="text-slate-400 mb-2">
          {selectedService?.name} on{' '}
          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
          at {selectedTime}
        </p>
        <p className="text-slate-500 text-sm">{provider.name} will confirm shortly.</p>
        <button
          onClick={() => { setIsSuccess(false); setStep(1); setSelectedService(null); setSelectedDate(''); setSelectedTime(''); }}
          className="mt-8 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Book Another
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((label, i) => {
            const num = i + 1;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    num < step ? 'bg-green-500 text-white' :
                    num === step ? 'bg-orange-500 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {num < step ? <CheckCircle className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${
                    num === step ? 'text-orange-400' : num < step ? 'text-green-400' : 'text-slate-500'
                  }`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${num < step ? 'bg-green-500' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Service */}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white mb-4">Select a Service</h2>
              {provider.services.length === 0 && (
                <p className="text-slate-400 text-sm">No services configured yet.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedService?.id === service.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-white text-sm">{service.name}</span>
                      <span className="text-orange-400 font-bold text-sm">${service.price}</span>
                    </div>
                    {service.description && (
                      <p className="text-slate-400 text-xs mb-2 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Fixed
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.service && <p className="text-red-400 text-sm">{errors.service}</p>}
            </div>
          )}

          {/* Step 2: Date & Time — 2-col on desktop */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Choose Date & Time
                {selectedService && (
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    — {selectedService.name} ({selectedService.duration} min)
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white font-semibold text-sm">
                      {monthName} {currentYear}
                    </span>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAY_NAMES.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        disabled={!day.date || day.isPast}
                        onClick={() => { if (day.date && !day.isPast) { setSelectedDate(day.date); setSelectedTime(''); } }}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-xs ${
                          !day.date
                            ? 'invisible'
                            : day.isPast
                            ? 'text-slate-700 cursor-not-allowed'
                            : day.date === selectedDate
                            ? 'bg-orange-500 text-white font-bold'
                            : day.isToday
                            ? 'border border-orange-500/50 text-orange-300 hover:bg-orange-500/10'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {day.date && (
                          <>
                            <span>{new Date(day.date + 'T12:00:00').getDate()}</span>
                            {!day.isPast && day.timeSlots.some((s) => s.available) && day.date !== selectedDate && (
                              <div className="w-1 h-1 rounded-full bg-green-400 mt-0.5" />
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots + summary */}
                <div className="flex flex-col gap-4">
                  {selectedDate ? (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-semibold text-sm">
                          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      {availableSlots.length === 0 ? (
                        <p className="text-slate-400 text-sm">No slots available this day.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                                selectedTime === slot.time
                                  ? 'border-orange-500 bg-orange-500 text-white'
                                  : 'border-slate-600 text-slate-300 hover:border-orange-500/50 hover:text-orange-300'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-6 flex items-center justify-center flex-1">
                      <p className="text-slate-500 text-sm text-center">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        Pick a date to see available times
                      </p>
                    </div>
                  )}

                  {/* Mini booking summary */}
                  {selectedService && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Service</span>
                          <span className="text-white font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration</span>
                          <span className="text-white">{selectedService.duration} min</span>
                        </div>
                        {selectedDate && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date</span>
                            <span className="text-white">
                              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        {selectedTime && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Time</span>
                            <span className="text-orange-400 font-semibold">{selectedTime}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-700 pt-2 flex justify-between">
                          <span className="text-slate-300 font-semibold">Total</span>
                          <span className="text-white font-bold">${selectedService.price}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(errors.date || errors.time) && (
                <p className="text-red-400 text-sm mt-3">{errors.date || errors.time}</p>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Anything the expert should know..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && selectedService && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Confirm Booking</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Booking details */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking Details</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service</span>
                      <span className="text-white font-semibold">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-white">{selectedService.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date</span>
                      <span className="text-white">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time</span>
                      <span className="text-orange-400 font-bold">{selectedTime}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2.5 flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-white font-bold text-lg">${selectedService.price}</span>
                    </div>
                  </div>
                </div>

                {/* Contact + provider */}
                <div className="space-y-3">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-sm">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Your Info</h3>
                    <p className="text-white font-medium">{customerName}</p>
                    <p className="text-slate-400">{customerEmail}</p>
                    <p className="text-slate-400">{customerPhone}</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{provider.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
                            ))}
                          </div>
                          <span className="text-slate-400 text-xs">{provider.rating} ({provider.reviewCount})</span>
                        </div>
                      </div>
                      {provider.verified && (
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-orange-300 text-xs">
                      Booking is pending until {provider.name} confirms. You&apos;ll get an email notification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
        <button
          onClick={handlePrevious}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <span className="text-xs text-slate-600">Step {step} of 4</span>

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl transition-colors text-sm font-semibold"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleBooking}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Confirm Booking</>
            )}
          </button>
        )}
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center"
            >
              <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Processing your booking...</p>
              <p className="text-slate-400 text-sm mt-1">Just a moment</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
