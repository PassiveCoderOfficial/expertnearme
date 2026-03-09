// src/app/dashboard/pricing/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';

interface PricingTier {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
  active: boolean;
  featured: boolean;
}

interface EditPricingPageProps {
  params: {
    id: string;
  };
}

export default function EditPricingPage({ params }: EditPricingPageProps) {
  const router = useRouter();
  const [tier, setTier] = useState<PricingTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: '',
    active: true,
    featured: false
  });

  useEffect(() => {
    fetchTier();
  }, [params.id]);

  const fetchTier = async () => {
    try {
      // Mock data - in a real app, this would be an API call
      const mockTier: PricingTier = {
        id: parseInt(params.id),
        name: 'Professional',
        description: 'For growing businesses and teams',
        price: 79,
        currency: 'USD',
        duration: 30,
        features: ['All Basic features', 'Portfolio gallery', 'Priority listing', 'WhatsApp integration'],
        active: true,
        featured: true
      };
      
      setTier(mockTier);
      setFormData({
        name: mockTier.name,
        description: mockTier.description,
        price: mockTier.price.toString(),
        duration: mockTier.duration.toString(),
        features: mockTier.features.join('\n'),
        active: mockTier.active,
        featured: mockTier.featured
      });
    } catch (error) {
      console.error('Error fetching pricing tier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.duration || isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }
    
    const featuresArray = formData.features.split('\n').filter(f => f.trim());
    if (featuresArray.length === 0) {
      newErrors.features = 'At least one feature is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare updated tier data
      const updatedTier = {
        id: parseInt(params.id),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        currency: 'USD',
        duration: parseInt(formData.duration),
        features: formData.features.split('\n').filter(f => f.trim()),
        active: formData.active,
        featured: formData.featured
      };
      
      // In a real app, this would be an API call
      console.log('Updating pricing tier:', updatedTier);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to pricing list
      router.push('/dashboard/pricing');
    } catch (error) {
      console.error('Error updating pricing tier:', error);
      setErrors({ general: 'Failed to update pricing tier. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pricing Tier Not Found</h1>
            <p className="text-gray-600 mb-4">The pricing tier you're looking for doesn't exist.</p>
            <Link
              href="/dashboard/pricing"
              className="text-blue-500 hover:text-blue-600"
            >
              ← Back to Pricing List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/pricing"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            ← Back to Pricing List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Pricing Tier</h1>
          <p className="text-gray-600 mt-1">Update {tier.name} pricing tier details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Professional"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Brief description of the tier"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className={`pl-8 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="79.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
                
                <div className="flex items-end gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
              <p className="text-sm text-gray-600 mb-2">
                Enter each feature on a new line <span className="text-red-500">*</span>
              </p>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.features ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={6}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
              {errors.features && (
                <p className="text-red-500 text-sm mt-1">{errors.features}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link
                href="/dashboard/pricing"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="border border-gray-200 rounded-lg p-6 max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.name || 'Tier Name'}</h3>
            <p className="text-gray-600 mb-4">{formData.description || 'Description'}</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
                <span className="text-3xl font-bold text-gray-900">
                  {formData.price || '0.00'}
                </span>
                <span className="text-gray-600 ml-1">
                  /{formData.duration || '30'} days
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <ul className="space-y-1">
                {formData.features.split('\n').filter(f => f.trim()).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                formData.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.active ? 'Active' : 'Inactive'}
              </span>
              {formData.featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}