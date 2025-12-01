import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ArrowLeft,
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Filter,
  Search,
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

// Get API URL - use production URL if on Vercel, otherwise use env var or localhost
const getApiUrl = () => {
  // Check if running on Vercel production
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://backendmatrix.onrender.com/api';
  }
  // Check if env var is set (for local dev and preview)
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to localhost for local development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const LeadScoringAdmin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/automation/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Please login again',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Transform MongoDB data to component format
        const transformedLeads = data.data.map((lead: any) => ({
          id: lead._id,
          company: lead.company || 'Unknown',
          contact: lead.contact || 'N/A',
          email: lead.email || 'N/A',
          score: lead.score || 0,
          status: getStatusFromScore(lead.score || 0),
          engagement: lead.engagement || 'medium',
          inquiries: lead.inquiries || 0,
          lastContact: lead.lastContact || 'N/A',
          potential: `₹${(lead.potential || 0).toLocaleString()}`,
        }));
        setLeads(transformedLeads);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromScore = (score: number): string => {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warm':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cold':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || lead.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const totalPotential = filteredLeads.reduce(
    (sum, lead) => sum + parseInt(lead.potential.replace(/[^\d]/g, '')),
    0
  );

  const handleAssignToSales = (leadId: string) => {
    toast({
      title: 'Success',
      description: 'Lead assigned to sales team',
    });
  };

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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Lead Scoring</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Intelligent lead qualification</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: 'Total Leads',
              value: leads.length,
              icon: Target,
              color: 'from-purple-500 to-pink-500',
            },
            {
              label: 'Hot Leads',
              value: leads.filter((l) => l.status === 'hot').length,
              icon: Star,
              color: 'from-red-500 to-orange-500',
            },
            {
              label: 'Total Potential',
              value: `₹${(totalPotential / 100000).toFixed(1)}L`,
              icon: TrendingUp,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Avg Score',
              value: Math.round(
                leads.reduce((sum, l) => sum + l.score, 0) / leads.length
              ),
              icon: CheckCircle,
              color: 'from-blue-500 to-cyan-500',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm text-purple-300">
                      {stat.label}
                    </CardTitle>
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search leads by company or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-purple-500/50 focus:outline-none focus:border-purple-500 flex-1 sm:flex-none"
            >
              <option value="all" className="bg-slate-900 text-white">All Leads</option>
              <option value="hot" className="bg-slate-900 text-white">Hot Leads</option>
              <option value="warm" className="bg-slate-900 text-white">Warm Leads</option>
              <option value="cold" className="bg-slate-900 text-white">Cold Leads</option>
            </select>
          </div>
        </div>

        {/* Leads Table - Responsive */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-slate-400">Loading leads...</p>
            </div>
          </div>
        ) : filteredLeads.length > 0 ? (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1 space-y-3 sm:space-y-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {lead.company}
                      </h3>
                      <Badge className={`${getStatusColor(lead.status)} text-[9px] sm:text-[10px]`}>
                        {lead.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs text-slate-400">
                      <div>
                        <p className="text-slate-500">Contact</p>
                        <p className="text-slate-300">{lead.contact}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Email</p>
                        <p className="text-slate-300 truncate">{lead.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Inquiries</p>
                        <p className="text-slate-300">{lead.inquiries}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Contact</p>
                        <p className="text-slate-300">{lead.lastContact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Score and Potential */}
                  <div className="flex flex-col sm:flex-col items-start sm:items-end gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Lead Score</p>
                      <div
                        className={`w-24 sm:w-28 h-10 rounded-lg bg-gradient-to-r ${getScoreColor(
                          lead.score
                        )} flex items-center justify-center`}
                      >
                        <span className="text-xl sm:text-2xl font-bold text-white">
                          {lead.score}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400 mb-1">Revenue Potential</p>
                      <p className="text-lg sm:text-xl font-bold text-purple-300">
                        {lead.potential}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 sm:flex-col w-full sm:w-auto">
                    <Button
                      onClick={() => handleAssignToSales(lead.id)}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white h-9 sm:h-10"
                      size="sm"
                    >
                      <span className="hidden sm:inline">Assign</span>
                      <span className="sm:hidden">Action</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
          <Card className="border border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-purple-400/50 mb-4" />
              <p className="text-slate-400">No leads found</p>
            </CardContent>
          </Card>
        )
        }
      </div>
    </div>
  );
};

export default LeadScoringAdmin;
