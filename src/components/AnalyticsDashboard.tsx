'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star,
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  MapPin,
  Clock
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'provider' | 'client';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  reviewCount: number;
  earnings: number;
  appointmentCount: number;
  createdAt: string;
  lastActive?: string;
}

interface Booking {
  id: number;
  clientName: string;
  providerName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  newProviders: number;
  newClients: number;
}

interface AnalyticsDashboardProps {
  role?: 'admin' | 'provider';
  providerId?: number;
}

export default function AnalyticsDashboard({ 
  role = 'admin', 
  providerId 
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('30days');
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    todayBookings: 0,
    avgRating: 0,
    activeUsers: 0
  });

  // Mock data initialization
  useEffect(() => {
    const mockData = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'client' as const, status: 'active' as const, createdAt: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'provider' as const, status: 'pending' as const, createdAt: '2024-01-20' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'provider' as const, status: 'active' as const, createdAt: '2024-01-10' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'client' as const, status: 'inactive' as const, createdAt: '2024-01-05' },
      ],
      providers: [
        { id: 1, name: 'Tech Solutions', email: 'tech@example.com', verified: true, status: 'active' as const, rating: 4.8, reviewCount: 45, earnings: 12500, appointmentCount: 120, createdAt: '2024-01-10' },
        { id: 2, name: 'Legal Experts', email: 'legal@example.com', verified: true, status: 'active' as const, rating: 4.9, reviewCount: 32, earnings: 9800, appointmentCount: 95, createdAt: '2024-01-15' },
        { id: 3, name: 'Health Care Pro', email: 'health@example.com', verified: false, status: 'pending' as const, rating: 0, reviewCount: 0, earnings: 0, appointmentCount: 0, createdAt: '2024-01-20' },
      ],
      bookings: [
        { id: 1, clientName: 'John Doe', providerName: 'Tech Solutions', service: 'Web Development', date: '2024-01-25', time: '14:00', status: 'confirmed' as const, amount: 150, paymentStatus: 'paid' as const },
        { id: 2, clientName: 'Jane Smith', providerName: 'Legal Experts', service: 'Consultation', date: '2024-01-26', time: '10:00', status: 'pending' as const, amount: 200, paymentStatus: 'paid' as const },
        { id: 3, clientName: 'Bob Johnson', providerName: 'Tech Solutions', service: 'SEO Services', date: '2024-01-24', time: '16:00', status: 'completed' as const, amount: 300, paymentStatus: 'paid' as const },
      ],
      revenueData: [
        { month: 'Jan', revenue: 25000, bookings: 120, newProviders: 8, newClients: 25 },
        { month: 'Feb', revenue: 32000, bookings: 156, newProviders: 12, newClients: 35 },
        { month: 'Mar', revenue: 41000, bookings: 189, newProviders: 15, newClients: 42 },
        { month: 'Apr', revenue: 38000, bookings: 175, newProviders: 10, newClients: 38 },
        { month: 'May', revenue: 47000, bookings: 210, newProviders: 18, newClients: 55 },
        { month: 'Jun', revenue: 52000, bookings: 245, newProviders: 22, newClients: 68 },
      ]
    };

    setUsers(mockData.users);
    setProviders(mockData.providers);
    setBookings(mockData.bookings);
    setRevenueData(mockData.revenueData);

    setStats({
      totalUsers: mockData.users.length,
      totalProviders: mockData.providers.filter(p => p.status === 'active').length,
      totalBookings: mockData.bookings.length,
      totalRevenue: mockData.revenueData.reduce((sum, data) => sum + data.revenue, 0),
      pendingApprovals: mockData.providers.filter(p => p.status === 'pending').length,
      todayBookings: mockData.bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
      avgRating: (mockData.providers.reduce((sum, p) => sum + p.rating, 0) / mockData.providers.filter(p => p.rating > 0).length).toFixed(1),
      activeUsers: mockData.users.filter(u => u.status === 'active').length
    });

    setIsLoading(false);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'providers', label: 'Providers', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const StatsCard = ({ title, value, change, icon: Icon, trend = 'up' }: {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${
          trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {change}
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          change="+12.5%"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Providers"
          value={stats.totalProviders}
          change="+8.2%"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Revenue"
          value={`¥${stats.totalRevenue.toLocaleString()}`}
          change="+15.3%"
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Avg Rating"
          value={stats.avgRating}
          change="+0.2"
          icon={Star}
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Month</button>
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg">Quarter</button>
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Year</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-between p-4">
            {revenueData.slice(-6).map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${(data.revenue / 60000) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <button className="text-blue-500 hover:text-blue-600 text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.clientName}</p>
                  <p className="text-sm text-gray-600">{booking.service}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium px-2 py-1 rounded ${
                    statusColors[booking.status]
                  }`}>
                    {booking.status}
                  </p>
                  <p className="text-xs text-gray-600">{booking.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {stats.pendingApprovals > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Pending Approvals ({stats.pendingApprovals})
          </h3>
          <div className="space-y-3">
            {providers.filter(p => p.status === 'pending').map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-900">{provider.name}</p>
                  <p className="text-sm text-gray-600">{provider.email}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Provider</option>
            <option>Client</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </select>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'provider' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProviders = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Categories</option>
            <option>IT Services</option>
            <option>Legal</option>
            <option>Healthcare</option>
          </select>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {provider.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.email}</p>
                  </div>
                </div>
                {provider.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{provider.rating}</span>
                    <span className="text-gray-500">({provider.reviewCount})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Earnings:</span>
                  <span className="font-medium text-green-600">¥{provider.earnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Appointments:</span>
                  <span className="font-medium">{provider.appointmentCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs rounded-full ${statusColors[provider.status]}`}>
                  {provider.status}
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    View
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Completed</option>
            <label>Cancelled</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>Custom Range</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Booking ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Provider</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">#{booking.id}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.clientName}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.providerName}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.service}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="text-sm">
                      <div>{booking.date}</div>
                      <div className="text-gray-500">{booking.time}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">¥{booking.amount}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Revenue Analytics</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              This Month
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Last Month
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Custom Range
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">¥127K</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-sm text-green-600 mt-1">+12.5% vs last month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">842</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-sm text-green-600 mt-1">+8.2% vs last month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">¥151</p>
            <p className="text-sm text-gray-600">Average Booking</p>
            <p className="text-sm text-green-600 mt-1">+5.4% vs last month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">94.2%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-sm text-red-600 mt-1">-2.1% vs last month</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Revenue by Month</h4>
            <div className="h-64 flex items-end justify-between">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${(data.revenue / 60000) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600">{data.month}</span>
                  <span className="text-xs text-gray-500">¥{data.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Bookings by Category</h4>
            <div className="space-y-3">
              {[
                { category: 'IT Services', bookings: 245, revenue: 36750 },
                { category: 'Legal', bookings: 189, revenue: 28350 },
                { category: 'Healthcare', bookings: 142, revenue: 21300 },
                { category: 'Education', bookings: 98, revenue: 14700 },
                { category: 'Other', bookings: 168, revenue: 25200 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.bookings}</p>
                    <p className="text-xs text-gray-600">¥{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{booking.id} - {booking.service}</p>
                  <p className="text-sm text-gray-600">{booking.clientName} → {booking.providerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">¥{booking.amount}</p>
                  <p className={`text-xs ${statusColors[booking.status]}`}>{booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Settings</h3>
        
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">General</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Site Title</p>
                  <p className="text-sm text-gray-600">The name of your platform</p>
                </div>
                <input
                  type="text"
                  defaultValue="ExpertNear.Me"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Currency</p>
                  <p className="text-sm text-gray-600">Default currency for transactions</p>
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option selected>JPY (¥)</option>
                  <option>AED (د.إ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via SMS</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Security</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Require 2FA for all users</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Password Policy</p>
                  <p className="text-sm text-gray-600">Minimum 8 characters, require special characters</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {role === 'admin' ? 'Manage your platform and monitor performance' : 'Track your provider performance'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'providers' && renderProviders()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'revenue' && renderRevenue()}
          {activeTab === 'settings' && renderSettings()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}