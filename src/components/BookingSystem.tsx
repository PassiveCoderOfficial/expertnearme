'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  Star,
  DollarSign,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Minus,
  Navigation,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface TimeSlot {
  time: string;
  available: boolean;
  bookingId?: number;
}

interface DaySchedule {
  date: string;
  dayName: string;
  isToday: boolean;
  timeSlots: TimeSlot[];
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
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
  location?: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
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

export default function BookingSystem({ 
  provider, 
  onBookingComplete,
  onBookingCancelled 
}: BookingSystemProps) {
  const [step, setStep] = useState(1); // 1: Select Service, 2: Select Date/Time, 3: Details, 4: Confirm
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize calendar
  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, currentYear]);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const newDays: DaySchedule[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      newDays.push({
        date: '',
        dayName: '',
        isToday: false,
        timeSlots: []
      });
    }

    // Add days of the month
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = date.getTime() === today.getTime();
      
      // Generate time slots for this day
      const timeSlots = generateTimeSlots(date);
      
      newDays.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        isToday,
        timeSlots
      });
    }

    setDays(newDays);
  };

  // Generate time slots based on provider's working hours
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const timeSlots: TimeSlot[] = [];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours = provider.workingHours[dayOfWeek];
    
    if (!workingHours || !workingHours.available) {
      return timeSlots;
    }

    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1]);

    // Generate slots in 30-minute intervals
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour - 1 && minute >= endMinute) break;
        
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push({
          time: slotTime,
          available: Math.random() > 0.3 // Mock availability
        });
      }
    }

    return timeSlots;
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!selectedService) {
          newErrors.service = 'Please select a service';
        }
        break;
      case 2:
        if (!selectedDate) {
          newErrors.date = 'Please select a date';
        }
        if (!selectedTime) {
          newErrors.time = 'Please select a time';
        }
        break;
      case 3:
        if (!customerName.trim()) {
          newErrors.name = 'Name is required';
        }
        if (!customerEmail.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
          newErrors.email = 'Email is invalid';
        }
        if (!customerPhone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle booking submission
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
      totalAmount: selectedService!.price
    };

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onBookingComplete?.(booking);
      
      // Reset form
      setStep(1);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSpecialRequests('');
    }, 1500);
  };

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(currentYear, month).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book with {provider.name}</h1>
        <p className="text-gray-600 mt-2">
          Professional {provider.services[0]?.name} service
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step === stepNum
                  ? 'bg-blue-500 text-white'
                  : stepNum < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum < step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 4 && (
                <div className={`w-16 h-1 mx-2 rounded-full ${
                  stepNum < step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600">
          {step === 1 && 'Select a service'}
          {step === 2 && 'Choose your preferred date and time'}
          {step === 3 && 'Enter your details'}
          {step === 4 && 'Confirm your booking'}
        </p>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Select a Service</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.services.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedService(service)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedService?.id === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <span className="text-lg font-bold text-blue-600">¥{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Fixed price
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {errors.service && (
              <p className="text-red-500 text-sm">{errors.service}</p>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && selectedService && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Choose Date & Time
              <span className="text-sm font-normal text-gray-600 ml-2">
                Service: {selectedService.name} ({selectedService.duration} min)
              </span>
            </h2>

            {/* Calendar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {getMonthName(currentMonth)} {currentYear}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <button
                    key={index}
                    disabled={!day.date}
                    onClick={() => day.date && setSelectedDate(day.date)}
                    className={`aspect-square rounded-lg border transition-colors ${
                      !day.date
                        ? 'bg-transparent border-transparent cursor-default'
                        : day.date === selectedDate
                        ? 'border-blue-500 bg-blue-50'
                        : day.isToday
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.date && (
                      <div className="flex flex-col items-center h-full py-2">
                        <span className={`text-sm ${
                          day.date === selectedDate
                            ? 'font-bold text-blue-600'
                            : day.isToday
                            ? 'font-semibold text-blue-600'
                            : 'text-gray-700'
                        }`}>
                          {new Date(day.date).getDate()}
                        </span>
                        {day.timeSlots.some(slot => slot.available) && (
                          <div className="flex gap-1 mt-1">
                            {day.timeSlots.slice(0, 2).map((slot, slotIndex) => (
                              <div
                                key={slotIndex}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  slot.available ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                            {day.timeSlots.length > 2 && (
                              <div className="text-xs text-gray-500">+{day.timeSlots.length - 2}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Available Times</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {days.find(d => d.date === selectedDate)?.timeSlots
                    .filter(slot => slot.available)
                    .map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedTime === slot.time
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && selectedService && selectedDate && selectedTime && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && selectedService && selectedDate && selectedTime && customerName && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Your Booking</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {/* Service Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                    <p className="text-sm text-gray-600">{selectedService.description}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">¥{selectedService.price}</span>
                </div>

                {/* Date & Time */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{selectedTime}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{customerName}</p>
                    <p className="text-sm text-gray-600">{customerEmail}</p>
                    <p className="text-sm text-gray-600">{customerPhone}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">¥{selectedService.price}</span>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {provider.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(provider.rating)
                              ? 'text-yellow-400 fill-current'
                              : provider.rating > i && provider.rating < i + 1
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {provider.rating} ({provider.reviewCount} reviews)
                    </span>
                  </div>
                  {provider.verified && (
                    <span className="inline-flex items-center gap-1 mt-1 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Verified Provider
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {step} of 4
          </div>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleBooking}
              disabled={isLoading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-sm"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your booking...</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}