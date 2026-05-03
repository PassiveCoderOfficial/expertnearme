'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star,
  Save,
  CheckCircle,
  Plus,
  X,
  DollarSign,
  Clock,
  Globe,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Tag,
  Building,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface Language {
  id: number;
  name: string;
  code: string;
}

interface ServiceProviderProfile {
  id?: number;
  // Personal Information
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  
  // Business Information
  businessName?: string;
  website?: string;
  businessDescription?: string;
  
  // Location Information
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Professional Information
  categories: number[];
  services: string[];
  experience: number;
  education: string;
  certifications: string[];
  languages: number[];
  
  // Pricing Information
  hourlyRate?: number;
  pricingModel: 'hourly' | 'fixed' | 'project';
  rateDescription?: string;
  
  // Availability
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  workingHours: {
    start: string;
    end: string;
  };
  
  // Social Information
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  
  // Documents
  documents?: {
    id: number;
    name: string;
    url: string;
    type: string;
  }[];
}

interface ProviderRegistrationProps {
  categories: Category[];
  languages: Language[];
  onSubmit: (profile: ServiceProviderProfile) => void;
  initialData?: Partial<ServiceProviderProfile>;
  country?: string;
}

export default function ProviderRegistration({ 
  categories, 
  languages, 
  onSubmit, 
  initialData,
  country = 'AE'
}: ProviderRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<ServiceProviderProfile>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    businessName: initialData?.businessName || '',
    website: initialData?.website || '',
    businessDescription: initialData?.businessDescription || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || country,
    postalCode: initialData?.postalCode || '',
    categories: initialData?.categories || [],
    services: initialData?.services || [],
    experience: initialData?.experience || 0,
    education: initialData?.education || '',
    certifications: initialData?.certifications || [],
    languages: initialData?.languages || [],
    hourlyRate: initialData?.hourlyRate,
    pricingModel: initialData?.pricingModel || 'hourly',
    rateDescription: initialData?.rateDescription || '',
    availability: initialData?.availability || {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    workingHours: initialData?.workingHours || {
      start: '09:00',
      end: '17:00'
    },
    socialLinks: initialData?.socialLinks || {},
    documents: initialData?.documents || []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [customCertification, setCustomCertification] = useState('');

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Business Details', icon: Building },
    { id: 3, title: 'Services & Pricing', icon: DollarSign },
    { id: 4, title: 'Location', icon: MapPin },
    { id: 5, title: 'Professional', icon: Briefcase },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!profile.name.trim()) newErrors.name = 'Name is required';
        if (!profile.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Email is invalid';
        if (!profile.phone.trim()) newErrors.phone = 'Phone is required';
        break;
      case 2:
        if (!(profile.businessName ?? '').trim()) {
          newErrors.businessName = 'Business name is required';
        }
        break;
      case 3:
        if (profile.categories.length === 0) newErrors.categories = 'Select at least one category';
        if (profile.services.length === 0) newErrors.services = 'Add at least one service';
        break;
      case 4:
        if (!(profile.address ?? '').trim()) newErrors.address = 'Address is required';
        if (!profile.city) newErrors.city = 'City is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const completeProfile = {
        ...profile,
        services: selectedServices,
        latitude: mapLocation?.lat || profile.latitude,
        longitude: mapLocation?.lng || profile.longitude
      };
      onSubmit(completeProfile);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setProfile(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleLanguage = (languageId: number) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(languageId)
        ? prev.languages.filter(id => id !== languageId)
        : [...prev.languages, languageId]
    }));
  };

  const addService = () => {
    if (newService.trim() && !selectedServices.includes(newService.trim())) {
      setSelectedServices([...selectedServices, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setSelectedServices(selectedServices.filter(s => s !== service));
  };

  const addCertification = () => {
    if (customCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, customCertification.trim()]
      }));
      setCustomCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setMapLocation(location);
    setProfile(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Business Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
              <textarea
                value={profile.businessDescription}
                onChange={(e) => setProfile(prev => ({ ...prev, businessDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your business and what makes you unique"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Services & Pricing</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Categories *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      profile.categories.includes(category.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      ></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Services *</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a service (e.g., Web Development)"
                />
                <button onClick={addService} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {selectedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{service}</span>
                    <button onClick={() => removeService(service)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
                <select
                  value={profile.pricingModel}
                  onChange={(e) => setProfile(prev => ({ ...prev, pricingModel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hourly">Hourly Rate</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="project">Project Based</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {profile.pricingModel === 'hourly' ? 'Hourly Rate (¥)' : 'Price'}
                </label>
                <input
                  type="number"
                  value={profile.hourlyRate || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Description</label>
              <textarea
                value={profile.rateDescription}
                onChange={(e) => setProfile(prev => ({ ...prev, rateDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your pricing structure..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  value={profile.state || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={profile.postalCode || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {mapLocation ? 'Location Selected' : 'Select Your Location on Map'}
              </label>
              <div className="h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Map integration would go here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {mapLocation ? `Lat: ${mapLocation.lat.toFixed(4)}, Lng: ${mapLocation.lng.toFixed(4)}` : 'Click on the map to set your location'}
                  </p>
                </div>
              </div>
              {mapLocation && (
                <button 
                  onClick={() => setMapLocation(null)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Clear Location
                </button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Professional Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                value={profile.experience}
                onChange={(e) => setProfile(prev => ({ ...prev, experience: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <textarea
                value={profile.education}
                onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Your educational background..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Certifications</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customCertification}
                  onChange={(e) => setCustomCertification(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a certification"
                />
                <button onClick={addCertification} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{cert}</span>
                    <button onClick={() => removeCertification(cert)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Languages</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {languages.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => toggleLanguage(language.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      profile.languages.includes(language.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{language.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Working Hours</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={profile.workingHours.start}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    value={profile.workingHours.end}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Profile Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Personal Information</h5>
                  <div className="space-y-1 text-gray-600">
                    <p><span className="font-medium">Name:</span> {profile.name}</p>
                    <p><span className="font-medium">Email:</span> {profile.email}</p>
                    <p><span className="font-medium">Phone:</span> {profile.phone}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Business Information</h5>
                  <div className="space-y-1 text-gray-600">
                    <p><span className="font-medium">Business:</span> {profile.businessName || 'Individual'}</p>
                    <p><span className="font-medium">Category:</span> {categories.find(c => profile.categories.includes(c.id))?.name || 'N/A'}</p>
                    <p><span className="font-medium">Services:</span> {selectedServices.slice(0, 2).join(', ')}{selectedServices.length > 2 ? '...' : ''}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Location</h5>
                  <div className="space-y-1 text-gray-600">
                    <p><span className="font-medium">Address:</span> {profile.address}</p>
                    <p><span className="font-medium">City:</span> {profile.city}</p>
                    <p><span className="font-medium">Country:</span> {profile.country}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Professional</h5>
                  <div className="space-y-1 text-gray-600">
                    <p><span className="font-medium">Experience:</span> {profile.experience} years</p>
                    <p><span className="font-medium">Languages:</span> {profile.languages.length} languages</p>
                    <p><span className="font-medium">Certifications:</span> {profile.certifications.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Ready to submit your profile?</p>
                  <p>Once submitted, our team will review your application and you'll be notified within 24-48 hours.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => validateStep(step.id) && setCurrentStep(step.id)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep === step.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : step.id < currentStep
                    ? 'bg-green-500 text-white border-green-500'
                    : 'border-gray-300 text-gray-400 hover:border-gray-400'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.button>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep === steps.length ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Submit Profile
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
}
