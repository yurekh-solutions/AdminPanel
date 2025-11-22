import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowLeft,
  LogOut,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PerformanceAnalytics = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [analytics, setAnalytics] = useState({
    responseTime: 2.3,
    conversionRate: 8.3,
    totalInquiries: 1240,
    automationEfficiency: 78,
    supplierCount: 245,
    productCount: 1543,
    ordersProcessed: 543,
    emailsSent: 8920,
  });

  const [chartData, setChartData] = useState([
    { date: 'Mon', responses: 120, conversions: 24 },
    { date: 'Tue', responses: 150, conversions: 32 },
    { date: 'Wed', responses: 180, conversions: 45 },
    { date: 'Thu', responses: 140, conversions: 38 },
    { date: 'Fri', responses: 210, conversions: 52 },
    { date: 'Sat', responses: 95, conversions: 18 },
    { date: 'Sun', responses: 110, conversions: 25 },
  ]);

  const [sourceData, setSourceData] = useState([
    { name: 'Search Engine', value: 4200, color: '#8b5cf6' },
    { name: 'Direct Visit', value: 3200, color: '#f97316' },
    { name: 'Social Media', value: 2500, color: '#3b82f6' },
    { name: 'Referral', value: 1800, color: '#10b981' },
  ]);

  const [automationMetrics, setAutomationMetrics] = useState([
    { tool: 'Auto-Reply', usage: 245, efficiency: 92 },
    { tool: 'Lead Scoring', usage: 340, efficiency: 88 },
    { tool: 'Order Automation', usage: 180, efficiency: 95 },
    { tool: 'Email Campaign', usage: 125, efficiency: 85 },
  ]);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const handleFetchAnalytics = async () => {
    setLoading(true);
    try {
      // Replace with real API call
      // const response = await fetch(`${API_URL}/admin/analytics/performance?period=${dateRange}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setAnalytics(data.data);

      // Mock API delay
      await new Promise(r => setTimeout(r, 800));
      toast({
        title: 'Analytics Updated',
        description: 'Latest performance metrics loaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Export Started',
      description: 'Your performance report is being generated',
    });
  };

  const kpiCards = [
    {
      label: 'Avg Response Time',
      value: `${analytics.responseTime}h`,
      change: '-12%',
      positive: true,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      change: '+3.2%',
      positive: true,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Total Inquiries',
      value: analytics.totalInquiries.toLocaleString(),
      change: '+18%',
      positive: true,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Automation Efficiency',
      value: `${analytics.automationEfficiency}%`,
      change: '+8.5%',
      positive: true,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b3d] to-[#1a1625]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d1b3d] to-[#3d2554] border-b border-purple-500/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                onClick={() => navigate('/dashboard/automation')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Performance Analytics</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Real-time business insights</p>
                </div>
              </div>
            </div>
            <Button
              className="bg-white/10 border border-purple-400/30 text-white hover:bg-white/20"
              onClick={() => {
                localStorage.removeItem('adminToken');
                navigate('/login');
              }}
              size="sm"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-purple-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-purple-500/50"
            >
              <option value="7days" className="bg-slate-900">Last 7 Days</option>
              <option value="30days" className="bg-slate-900">Last 30 Days</option>
              <option value="90days" className="bg-slate-900">Last 90 Days</option>
              <option value="1year" className="bg-slate-900">Last Year</option>
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleFetchAnalytics}
              disabled={loading}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 flex-1 sm:flex-none"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleExportReport}
              className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 flex-1 sm:flex-none"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {kpiCards.map((card, idx) => (
            <Card
              key={idx}
              className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm text-purple-300 font-medium">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{card.value}</p>
                  <Badge
                    className={`${
                      card.positive
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    } text-[9px] sm:text-[10px]`}
                  >
                    {card.positive ? <TrendingUp className="w-3 h-3 mr-1 inline" /> : <TrendingDown className="w-3 h-3 mr-1 inline" />}
                    {card.change}
                  </Badge>
                </div>
                <div
                  className={`h-1 rounded-full w-full bg-gradient-to-r ${card.color}`}
                  style={{ opacity: 0.6 }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response & Conversion Trend */}
          <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="border-b border-purple-500/20 pb-4">
              <CardTitle className="text-white">Response & Conversion Trend</CardTitle>
              <CardDescription className="text-slate-400">Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 51, 234, 0.2)" />
                  <XAxis dataKey="date" stroke="#a78bfa" />
                  <YAxis stroke="#a78bfa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1529',
                      border: '1px solid #7c3aed',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#a78bfa"
                    fillOpacity={1}
                    fill="url(#colorResponses)"
                    name="Responses"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stroke="#f97316"
                    fill="rgba(249, 115, 22, 0.1)"
                    name="Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="border-b border-purple-500/20 pb-4">
              <CardTitle className="text-white">Traffic Sources</CardTitle>
              <CardDescription className="text-slate-400">Visitor distribution</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1529',
                      border: '1px solid #7c3aed',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Automation Tools Performance */}
        <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl mb-8">
          <CardHeader className="border-b border-purple-500/20 pb-4">
            <CardTitle className="text-white">Automation Tools Performance</CardTitle>
            <CardDescription className="text-slate-400">Usage and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={automationMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 51, 234, 0.2)" />
                <XAxis dataKey="tool" stroke="#a78bfa" />
                <YAxis stroke="#a78bfa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f1529',
                    border: '1px solid #7c3aed',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="usage" fill="#a78bfa" name="Usage Count" radius={[8, 8, 0, 0]} />
                <Bar dataKey="efficiency" fill="#f97316" name="Efficiency %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Suppliers', value: analytics.supplierCount, icon: '👥' },
            { label: 'Total Products', value: analytics.productCount, icon: '📦' },
            { label: 'Orders Processed', value: analytics.ordersProcessed, icon: '✅' },
            { label: 'Emails Sent', value: analytics.emailsSent, icon: '📧' },
          ].map((metric, idx) => (
            <Card
              key={idx}
              className="border border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm font-medium">{metric.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
                      {metric.value.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-3xl">{metric.icon}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
