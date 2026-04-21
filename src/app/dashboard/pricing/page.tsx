// src/app/dashboard/pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PricingAnalytics {
  totalRevenue: number;
  activeSubscriptions: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  popularTiers: Array<{
    name: string;
    subscriptions: number;
    revenue: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>;
}

export default function PricingDashboard() {
  const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Mock data for demonstration
    const mockAnalytics: PricingAnalytics = {
      totalRevenue: 45720,
      activeSubscriptions: 124,
      conversionRate: 3.2,
      averageRevenuePerUser: 368.75,
      popularTiers: [
        { name: 'Professional', subscriptions: 78, revenue: 61620 },
        { name: 'Basic', subscriptions: 41, revenue: 11890 },
        { name: 'Enterprise', subscriptions: 5, revenue: 9950 },
      ],
      monthlyData: [
        { month: 'Jan', revenue: 34500, subscriptions: 98 },
        { month: 'Feb', revenue: 41200, subscriptions: 115 },
        { month: 'Mar', revenue: 45720, subscriptions: 124 },
      ]
    };
    
    setAnalytics(mockAnalytics);
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pricing Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor pricing performance and manage subscription tiers</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5% from last month
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(analytics?.activeSubscriptions || 0)}
                </p>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2% from last month
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {analytics?.conversionRate.toFixed(1)}%
                </p>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2.1% from last month
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue/User</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(analytics?.averageRevenuePerUser || 0)}
                </p>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5.3% from last month
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Tiers */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Popular Pricing Tiers</h2>
              <Link 
                href="/dashboard/pricing"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Manage All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {analytics?.popularTiers.map((tier, index) => (
                <div key={tier.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tier.name}</p>
                      <p className="text-sm text-gray-600">{formatNumber(tier.subscriptions)} subscriptions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(tier.revenue)}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance</h2>
            
            <div className="space-y-4">
              {analytics?.monthlyData.map((month, index) => (
                <div key={month.month} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900">{month.month}</p>
                    <p className="text-sm text-gray-600">{formatNumber(month.subscriptions)} subscriptions</p>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-medium text-gray-900">{formatCurrency(month.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(month.revenue / 50000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Create New Tier</span>
              </div>
              <p className="text-sm text-gray-600">Add a new pricing tier to your subscription plans</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Adjust Pricing</span>
              </div>
              <p className="text-sm text-gray-600">Update pricing for existing subscription tiers</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Manage Discounts</span>
              </div>
              <p className="text-sm text-gray-600">Configure promotional codes and discounts</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}