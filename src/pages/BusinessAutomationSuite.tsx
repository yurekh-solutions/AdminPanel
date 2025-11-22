import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  MessageSquare,
  Target,
  Package,
  TrendingUp,
  Settings,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BusinessAutomationSuite = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'automation' | 'analytics'>('overview');
  const [automationStats, setAutomationStats] = useState({
    autoReplies: 245,
    leadScores: 1240,
    ordersProcessed: 543,
    emailsSent: 8920,
    responseTime: '2.3hrs',
    conversionRate: '8.3%',
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const automationFeatures = [
    {
      id: 'auto-reply',
      title: 'Auto-Reply Manager',
      description: 'Intelligent automated responses for supplier inquiries',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      stats: '245 templates',
      status: 'active',
      impact: '+40% faster response',
    },
    {
      id: 'lead-scoring',
      title: 'Smart Lead Scoring',
      description: 'AI-powered lead qualification and prioritization',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      stats: '1,240 leads scored',
      status: 'active',
      impact: '+60% qualified leads',
    },
    {
      id: 'order-automation',
      title: 'Order Automation',
      description: 'Automatic order processing and fulfillment tracking',
      icon: Package,
      color: 'from-orange-500 to-red-500',
      stats: '543 orders processed',
      status: 'active',
      impact: '+35% faster fulfillment',
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Real-time metrics and automation effectiveness tracking',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-500',
      stats: '8,920 emails sent',
      status: 'active',
      impact: '↑ 78% engagement',
    },
  ];

  const recentAutomations = [
    {
      type: 'Auto-Reply Sent',
      description: 'Inquiry from XYZ Industries about Steel Plates',
      timestamp: '2 minutes ago',
      status: 'success',
      icon: CheckCircle,
    },
    {
      type: 'Lead Scored',
      description: 'High-priority lead: ABC Manufacturing (95/100)',
      timestamp: '5 minutes ago',
      status: 'success',
      icon: CheckCircle,
    },
    {
      type: 'Order Processed',
      description: 'Order #1245 automatically updated to fulfilled',
      timestamp: '12 minutes ago',
      status: 'success',
      icon: CheckCircle,
    },
    {
      type: 'Email Campaign',
      description: '245 emails sent to bulk purchasers (98% delivery)',
      timestamp: '1 hour ago',
      status: 'success',
      icon: CheckCircle,
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: 'Refreshed',
        description: 'Automation metrics updated successfully',
      });
      setLoading(false);
    }, 1000);
  };

  const handleNavigateToFeature = (featureId: string) => {
    navigate(`/dashboard/automation/${featureId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b3d] to-[#1a1625]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d1b3d] to-[#3d2554] border-b border-purple-500/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/60 via-orange-500/60 to-blue-500/60 rounded-xl backdrop-blur-xl border border-white/20 transform rotate-3"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-orange-500/80 via-purple-500/80 to-blue-500/80 rounded-xl backdrop-blur-xl border border-white/30 shadow-xl">
                  <div className="absolute inset-[2px] bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-slate-900/90 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black">
                  <span className="bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Business Automation Suite
                  </span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">AI-Powered Supplier Management</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none border-purple-400/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-all"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none bg-white/10 border border-purple-400/30 text-white hover:bg-white/20 transition-all"
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  navigate('/login');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Zap },
                  { id: 'automation', label: 'Automation Tools', icon: Settings },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 h-11 sm:h-12 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-transparent text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{tab.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[
                { label: 'Auto Replies', value: automationStats.autoReplies, icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
                { label: 'Leads Scored', value: automationStats.leadScores, icon: Target, color: 'from-purple-500 to-pink-500' },
                { label: 'Orders Processed', value: automationStats.ordersProcessed, icon: Package, color: 'from-orange-500 to-red-500' },
                { label: 'Emails Sent', value: automationStats.emailsSent, icon: Zap, color: 'from-emerald-500 to-teal-500' },
              ].map((metric, idx) => (
                <Card
                  key={idx}
                  className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-purple-300">
                        {metric.label}
                      </CardTitle>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                        <metric.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 sm:pt-3">
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">
                      {metric.value}
                    </p>
                    <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs text-purple-400/70">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium">Updated today</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Automation Features Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Automation Features</h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {automationFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.id}
                      className="border border-purple-500/20 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl group cursor-pointer"
                      onClick={() => handleNavigateToFeature(feature.id)}
                    >
                      <CardHeader className="pb-2 sm:pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[9px] sm:text-[10px]">
                            {feature.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm sm:text-base font-bold text-white">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 line-clamp-2">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-slate-400">Metric</p>
                          <p className="font-semibold text-sm text-purple-300">{feature.stats}</p>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                          <p className="text-[9px] sm:text-xs font-semibold text-orange-300">Impact: {feature.impact}</p>
                        </div>
                        <Button
                          className="w-full h-9 sm:h-10 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-xs sm:text-sm group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToFeature(feature.id);
                          }}
                        >
                          Configure
                          <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Automations */}
            <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
              <CardHeader className="border-b border-purple-500/20 pb-4 sm:pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-400">
                      Latest automated actions and events
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentAutomations.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                          <activity.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white">{activity.type}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[9px] sm:text-xs text-slate-400 font-medium">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Automation Tools Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {automationFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
                  >
                    <CardHeader className="border-b border-purple-500/20 pb-4 sm:pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base sm:text-lg text-white">
                              {feature.title}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-slate-400 mt-1">
                              {feature.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={`bg-gradient-to-r ${feature.color} text-white text-[9px] sm:text-[10px]`}>
                          {feature.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-purple-500/20">
                          <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Total Usage</p>
                          <p className="text-base sm:text-lg font-bold text-white mt-2">{feature.stats}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                          <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Impact</p>
                          <p className="text-xs sm:text-sm font-bold text-orange-300 mt-2">{feature.impact}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full h-10 sm:h-11 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-sm font-semibold"
                        onClick={() => handleNavigateToFeature(feature.id)}
                      >
                        Open {feature.title.split(' ')[0]}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-white">Automation Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Response Time Saved', value: '40%', color: 'from-blue-500 to-blue-600' },
                      { label: 'Lead Qualification Accuracy', value: '92%', color: 'from-purple-500 to-purple-600' },
                      { label: 'Order Processing Speed', value: '35%', color: 'from-orange-500 to-orange-600' },
                    ].map((stat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs sm:text-sm text-slate-300">{stat.label}</span>
                          <span className="font-bold text-sm text-white">{stat.value}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-700">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                            style={{ width: stat.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'API Uptime', value: '99.9%', status: 'healthy' },
                      { label: 'Email Delivery Rate', value: '98.5%', status: 'healthy' },
                      { label: 'Processing Queue', value: '95 pending', status: 'warning' },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-purple-500/20">
                        <span className="text-xs sm:text-sm text-slate-300">{stat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{stat.value}</span>
                          <div className={`w-2 h-2 rounded-full ${stat.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAutomationSuite;
