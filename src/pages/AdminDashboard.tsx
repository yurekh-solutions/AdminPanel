import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, Search, Filter, TrendingUp, Users, Clock, CheckCircle, XCircle, LogOut, Zap, Package, ImageIcon, FileText, Download, BarChart3, PieChart as PieChartIcon, Activity, RefreshCw, Mail, Phone, Building2, Calendar, Award, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Supplier {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  contactPerson: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  documents: {
    gst?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: string;
    };
    cin?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: string;
    };
    pan: {
      fileUrl: string;
      fileName: string;
      uploadedAt: string;
    };
    bankProof?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: string;
    };
    businessLicense?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: string;
    };
    aadhaar?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: string;
    };
  };
  businessDescription: string;
  productsOffered: string[];
  yearsInBusiness: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rejectionReason?: string;
}

interface Product {
  _id: string;
  supplierId: {
    _id: string;
    companyName: string;
    email: string;
  };
  name: string;
  category: string;
  description: string;
  specifications: {
    material?: string;
    size?: string;
    [key: string]: string | undefined;
  };
  price: {
    amount: number;
    currency: string;
    unit: string;
  };
  images: string[];
  stock: {
    available: boolean;
    quantity?: number;
    minimumOrder?: number;
  };
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  createdAt: string;
}

interface Statistics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'products' | 'rfq'>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showRFQDetails, setShowRFQDetails] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<{ url: string; name: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const token = localStorage.getItem('adminToken');

  // Check authentication and clear invalid tokens
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Clear old mock tokens
    if (token.startsWith('test-admin-token-')) {
      console.warn('Invalid mock token detected, clearing...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      toast({
        title: 'Session Expired',
        description: 'Please login again with valid credentials',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchSuppliers();
    fetchStatistics();
    fetchProducts();
    fetchRFQs();
  }, [filterStatus]);
  
  const fetchRFQs = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/rfqs`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.data || data.rfqs || []);
        console.log('RFQs loaded:', data.data?.length || 0);
      } else {
        console.error('Failed to fetch RFQs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const url = filterStatus === 'all' 
        ? `${API_URL}/admin/suppliers`
        : `${API_URL}/admin/suppliers?status=${filterStatus}`;

      console.log('Fetching suppliers from:', url);
      console.log('Using token:', token);
      setDebugInfo(`Fetching from: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      setDebugInfo(`Response: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        // Token is invalid, clear and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        toast({
          title: 'Session Expired',
          description: 'Please login again',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setDebugInfo(`Data received: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data.success) {
        console.log('Suppliers loaded:', data.data?.length || 0);
        setSuppliers(data.data || []);
        if (data.data?.length === 0) {
          toast({
            title: 'Info',
            description: 'No suppliers found in database',
            variant: 'default',
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      const errorMsg = error instanceof Error ? error.message : 'Backend server not connected';
      setDebugInfo(`ERROR: ${errorMsg}`);
      // Use mock data if backend is not available
      setSuppliers([]);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Set default statistics when backend is unavailable
      setStatistics({ pending: 0, approved: 0, rejected: 0, total: 0 });
    }
  };

  const fetchProducts = async () => {
    try {
      const url = filterStatus === 'all'
        ? `${API_URL}/admin/products`
        : `${API_URL}/admin/products?status=${filterStatus}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const handleApproveProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/products/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Product approved successfully',
        });
        fetchProducts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve product',
        variant: 'destructive',
      });
    }
  };

  const handleRejectProduct = async (id: string, reason: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/products/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Product rejected',
        });
        fetchProducts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
        fetchProducts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/suppliers/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve supplier');
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.emailSent === false 
            ? 'Supplier approved but email failed to send. Check email configuration.' 
            : 'Supplier approved successfully',
        });
        fetchSuppliers();
        fetchStatistics();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve supplier - Backend server not connected',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSupplier || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/suppliers/${selectedSupplier._id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject supplier');
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.emailSent === false 
            ? 'Supplier rejected but email failed to send. Check email configuration.' 
            : 'Supplier rejected',
        });
        setShowRejectDialog(false);
        setRejectionReason('');
        fetchSuppliers();
        fetchStatistics();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject supplier - Backend server not connected',
        variant: 'destructive',
      });
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] sm:text-xs',
      approved: 'bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] sm:text-xs',
      rejected: 'bg-pink-500/20 text-pink-300 border-pink-500/30 text-[10px] sm:text-xs',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const exportToExcel = () => {
    // Prepare data for Excel export
    const excelData = suppliers.map(supplier => ({
      'Company Name': supplier.companyName,
      'Contact Person': supplier.contactPerson,
      'Email': supplier.email,
      'Phone': supplier.phone,
      'Business Type': supplier.businessType,
      'Years in Business': supplier.yearsInBusiness,
      'Street': supplier.address.street,
      'City': supplier.address.city,
      'State': supplier.address.state,
      'Pincode': supplier.address.pincode,
      'Country': supplier.address.country,
      'Products Offered': supplier.productsOffered.join(', '),
      'Business Description': supplier.businessDescription,
      'Status': supplier.status,
      'Submitted Date': new Date(supplier.submittedAt).toLocaleString(),
      'Rejection Reason': supplier.rejectionReason || 'N/A',
      'PAN Document': supplier.documents.pan?.fileName || 'N/A',
      'GST Document': supplier.documents.gst?.fileName || 'N/A',
      'CIN Document': supplier.documents.cin?.fileName || 'N/A',
      'Bank Proof': supplier.documents.bankProof?.fileName || 'N/A',
      'Business License': supplier.documents.businessLicense?.fileName || 'N/A',
      'Aadhaar': supplier.documents.aadhaar?.fileName || 'N/A',
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

    // Set column widths
    const maxWidth = 50;
    const colWidths = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = colWidths;

    // Generate filename with current date
    const fileName = `Suppliers_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download file
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: 'Success',
      description: `Exported ${suppliers.length} suppliers to Excel`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b3d] to-[#1a1625]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d1b3d] to-[#3d2554] border-b border-purple-500/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                {/* 3D Icon Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/60 via-orange-500/60 to-blue-500/60 rounded-xl backdrop-blur-xl border border-white/20 transform rotate-3"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-orange-500/80 via-purple-500/80 to-blue-500/80 rounded-xl backdrop-blur-xl border border-white/30 shadow-xl">
                  <div className="absolute inset-[2px] bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-slate-900/90 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black">
                  <span className="bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Admin Dashboard</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Supplier Management Portal</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-none bg-white/10 border border-purple-400/30 text-white font-semibold hover:bg-white/20 transition-all shadow-lg backdrop-blur-sm"
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  toast({
                    title: 'Logged Out',
                    description: 'You have been logged out successfully',
                  });
                  navigate('/login');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="font-semibold text-xs sm:text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Quick Actions Bar */}
        <div className="mb-6 sm:mb-8">
          <Card className="border border-purple-500/20 bg-gradient-to-r from-[#2d1b3d] via-[#1f1529] to-[#2d1b3d] backdrop-blur-xl hover:border-purple-400/40 transition-all">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-purple-500/30 border border-purple-500/40 flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Quick Actions</h3>
                    <p className="text-xs text-slate-400 hidden sm:block">Manage your dashboard efficiently</p>
                  </div>
                </div>
            <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-all group"
                    onClick={() => {
                      fetchSuppliers();
                      fetchStatistics();
                      fetchProducts();
                      toast({ title: 'Refreshed', description: 'Data updated successfully' });
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="hidden sm:inline">Refresh Data</span>
                    <span className="sm:hidden">Refresh</span>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => navigate('/dashboard/automation')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Automation Suite</span>
                    <span className="sm:hidden">Automation</span>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 hover:from-orange-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    onClick={exportToExcel}
                    disabled={suppliers.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export Excel</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
          <Card className="border border-purple-500/20 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-purple-300">Total</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">{statistics.total}</p>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-purple-400/70 mt-0.5 sm:mt-1">All submissions</p>
              <div className="mt-1 sm:mt-2 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-blue-400 font-medium">+12% month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/20 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-purple-300">Pending</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-orange-400">{statistics.pending}</p>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-orange-400/70 mt-0.5 sm:mt-1 font-medium">Need action</p>
              <div className="mt-1 sm:mt-2 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-orange-400 font-medium">Review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/20 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-purple-300">Approved</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-purple-400">{statistics.approved}</p>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-purple-400/70 mt-0.5 sm:mt-1 font-medium">Active</p>
              <div className="mt-1 sm:mt-2 flex items-center gap-1">
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-purple-400 font-medium">Verified</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/20 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-purple-300">Rejected</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-pink-400">{statistics.rejected}</p>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-purple-400/70 mt-0.5 sm:mt-1">Declined</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="mb-8 sm:mb-10">
          <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                <Button
                  onClick={() => setActiveTab('suppliers')}
                  className={`flex-1 h-10 sm:h-11 lg:h-12 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === 'suppliers'
                      ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-transparent text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                  }`}
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Suppliers</span>
                  <span className="sm:hidden">Suppliers</span>
                  {statistics.pending > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-orange-500 text-white text-xs py-0 px-1.5">{statistics.pending}</Badge>
                  )}
                </Button>
                <Button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 h-10 sm:h-11 lg:h-12 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === 'products'
                      ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-transparent text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                  }`}
                >
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Products</span>
                  <span className="sm:hidden">Products</span>
                  {products.filter(p => p.status === 'pending').length > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-orange-500 text-white text-xs py-0 px-1.5">
                      {products.filter(p => p.status === 'pending').length}
                    </Badge>
                  )}
                </Button>
                <Button
                  onClick={() => setActiveTab('rfq')}
                  className={`flex-1 h-10 sm:h-11 lg:h-12 font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === 'rfq'
                      ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-transparent text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                  }`}
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span>RFQ</span>
                  {rfqs.filter(r => r.status === 'pending').length > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-orange-500 text-white text-xs py-0 px-1.5">
                      {rfqs.filter(r => r.status === 'pending').length}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Section */}
        {activeTab === 'suppliers' && (
          <>
        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
          {/* Status Distribution Pie Chart */}
          <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-white font-bold">Status Distribution</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Application breakdown by status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 flex flex-col">
              <ChartContainer
                config={{
                  pending: { label: 'Pending', color: '#f97316' },
                  approved: { label: 'Approved', color: '#8b5cf6' },
                  rejected: { label: 'Rejected', color: '#ec4899' },
                }}
                className="h-[240px] sm:h-[280px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                        <stop offset="100%" stopColor="#db2777" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: 'Pending', value: statistics.pending, gradient: 'url(#pendingGradient)' },
                        { name: 'Approved', value: statistics.approved, gradient: 'url(#approvedGradient)' },
                        { name: 'Rejected', value: statistics.rejected, gradient: 'url(#rejectedGradient)' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="white" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            className="font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={window.innerWidth < 640 ? 70 : 85}
                      innerRadius={window.innerWidth < 640 ? 35 : 42}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { name: 'Pending', value: statistics.pending, gradient: 'url(#pendingGradient)' },
                        { name: 'Approved', value: statistics.approved, gradient: 'url(#approvedGradient)' },
                        { name: 'Rejected', value: statistics.rejected, gradient: 'url(#rejectedGradient)' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.gradient} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 shadow-2xl">
                              <p className="text-white font-bold text-sm">{payload[0].name}</p>
                              <p className="text-slate-300 text-xs mt-1">Count: <span className="font-semibold">{payload[0].value}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              {/* Legend at Bottom */}
              <div className="mt-6 sm:mt-8 w-full">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-2"></div>
                    <span className="text-[10px] sm:text-xs font-semibold text-white">Pending</span>
                    <span className="text-[12px] sm:text-sm font-bold text-orange-400">{statistics.pending}</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-2"></div>
                    <span className="text-[10px] sm:text-xs font-semibold text-white">Approved</span>
                    <span className="text-[12px] sm:text-sm font-bold text-purple-400">{statistics.approved}</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 mb-2"></div>
                    <span className="text-[10px] sm:text-xs font-semibold text-white">Rejected</span>
                    <span className="text-[12px] sm:text-sm font-bold text-pink-400">{statistics.rejected}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Overview Wave Chart */}
          <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
            <CardHeader className="border-b border-purple-500/20 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base lg:text-lg text-white font-bold">Status Overview</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-400">Comparative analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-2 sm:px-6">
              <ChartContainer
                config={{
                  pending: { label: 'Pending', color: '#f97316' },
                  approved: { label: 'Approved', color: '#8b5cf6' },
                  rejected: { label: 'Rejected', color: '#ec4899' },
                  total: { label: 'Total', color: '#3b82f6' },
                }}
                className="h-[200px] sm:h-[250px] lg:h-[320px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { status: 'Pending', count: statistics.pending },
                      { status: 'Approved', count: statistics.approved },
                      { status: 'Rejected', count: statistics.rejected },
                      { status: 'Total', count: statistics.total },
                    ]}
                    margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#ec4899" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="33%" stopColor="#ec4899" />
                        <stop offset="66%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 51, 234, 0.2)" vertical={false} />
                    <XAxis 
                      dataKey="status" 
                      stroke="#a78bfa" 
                      style={{ fontSize: window.innerWidth < 640 ? '10px' : '13px', fontWeight: '600' }}
                      tick={{ fill: '#c4b5fd' }}
                      axisLine={{ stroke: '#7c3aed', strokeWidth: 2 }}
                      angle={window.innerWidth < 640 ? -45 : 0}
                      textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                      height={window.innerWidth < 640 ? 50 : 30}
                    />
                    <YAxis 
                      stroke="#a78bfa" 
                      style={{ fontSize: window.innerWidth < 640 ? '10px' : '13px', fontWeight: '600' }}
                      tick={{ fill: '#c4b5fd' }}
                      axisLine={{ stroke: '#7c3aed', strokeWidth: 2 }}
                      width={window.innerWidth < 640 ? 30 : 40}
                    />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-2 sm:p-3 shadow-2xl">
                              <p className="text-white font-bold text-xs sm:text-sm">{payload[0].payload.status}</p>
                              <p className="text-slate-300 text-[10px] sm:text-xs mt-1">Count: <span className="font-semibold">{payload[0].value}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="url(#strokeGradient)" 
                      strokeWidth={3}
                      fill="url(#areaGradient)" 
                      fillOpacity={0.6}
                      animationDuration={1500}
                      animationBegin={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                  <span className="text-[9px] sm:text-xs text-slate-300">Pending</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
                  <span className="text-[9px] sm:text-xs text-slate-300">Approved</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-pink-500"></div>
                  <span className="text-[9px] sm:text-xs text-slate-300">Rejected</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[9px] sm:text-xs text-slate-300">Total</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <div className="mb-8 sm:mb-10">
          <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <CardHeader className="border-b border-purple-500/20 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg text-white font-bold">Recent Activity</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Latest updates and actions</CardDescription>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex gap-4 group hover:bg-purple-500/5 p-3 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-px h-full bg-purple-500/20 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">Supplier Approved</p>
                      <span className="text-xs text-slate-400">2 hours ago</span>
                    </div>
                    <p className="text-xs text-slate-400">New supplier <span className="text-purple-400 font-medium">Tech Solutions Ltd.</span> has been approved</p>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex gap-4 group hover:bg-purple-500/5 p-3 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-px h-full bg-purple-500/20 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">New Application</p>
                      <span className="text-xs text-slate-400">5 hours ago</span>
                    </div>
                    <p className="text-xs text-slate-400">Pending review for <span className="text-orange-400 font-medium">Global Traders Inc.</span></p>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex gap-4 group hover:bg-purple-500/5 p-3 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Download className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-px h-full bg-purple-500/20 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">Data Export</p>
                      <span className="text-xs text-slate-400">1 day ago</span>
                    </div>
                    <p className="text-xs text-slate-400">Exported <span className="text-blue-400 font-medium">245 supplier records</span> to Excel</p>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="flex gap-4 group hover:bg-purple-500/5 p-3 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">Application Rejected</p>
                      <span className="text-xs text-slate-400">2 days ago</span>
                    </div>
                    <p className="text-xs text-slate-400">Rejected <span className="text-pink-400 font-medium">XYZ Corp</span> - Incomplete documentation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6 border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
          <CardContent className="pt-3 sm:pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-l-md flex items-center justify-center">
                    <Search className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <Input
                    placeholder="Search by company name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 sm:pl-14 border-purple-500/30 focus:border-purple-500 bg-[#1f1529]/50 text-white placeholder:text-purple-300/50 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full md:w-48 lg:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none z-10" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="pl-10 border-purple-500/30 focus:border-purple-500 bg-[#1f1529]/50 text-white h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2d1b3d] border-purple-500/30">
                      <SelectItem value="all" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">All Status</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-orange-500/20 focus:bg-orange-500/20">Pending</SelectItem>
                      <SelectItem value="approved" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">Approved</SelectItem>
                      <SelectItem value="rejected" className="text-white hover:bg-pink-500/20 focus:bg-pink-500/20">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-b border-purple-500/20">
              <CardTitle className="text-base sm:text-lg md:text-xl text-white">Supplier Applications</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-purple-300/70">Review and manage supplier registrations</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <p className="text-center py-8 text-sm sm:text-base text-purple-300">Loading...</p>
              ) : filteredSuppliers.length === 0 ? (
                <p className="text-center py-8 text-purple-400/70 text-sm sm:text-base">No suppliers found</p>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gradient-to-r from-purple-500/20 to-orange-500/20">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Company</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Contact Person</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Email</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Phone</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Location</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Type</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Experience</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Status</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Submitted</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier._id} className="hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-orange-500/10 transition-all duration-300 group">
                          <td className="px-3 sm:px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Building2 className="w-4 h-4 text-purple-400" />
                              </div>
                              <p className="font-medium text-white text-xs sm:text-sm">{supplier.companyName}</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <p className="text-xs sm:text-sm text-purple-200">{supplier.contactPerson}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-purple-300">{supplier.email}</td>
                          <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-purple-300">{supplier.phone}</td>
                          <td className="px-3 sm:px-4 py-3">
                            <div className="text-xs sm:text-sm text-purple-200">
                              <p>{supplier.address.city}</p>
                              <p className="text-[10px] sm:text-xs text-purple-400">{supplier.address.state}</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <Badge variant="outline" className="text-[10px] sm:text-xs border-purple-400/50 text-purple-300">{supplier.businessType}</Badge>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <p className="text-xs sm:text-sm text-purple-200">{supplier.yearsInBusiness} yrs</p>
                          </td>
                          <td className="px-3 sm:px-4 py-3">{getStatusBadge(supplier.status)}</td>
                          <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-purple-300">
                            {new Date(supplier.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 h-7 sm:h-8 px-2 sm:px-3 transition-all group"
                                onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setShowDetails(true);
                                }}
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                              </Button>
                              {supplier.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 h-7 sm:h-8 px-2 sm:px-3 transition-all hover:scale-105"
                                    onClick={() => handleApprove(supplier._id)}
                                  >
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 h-7 sm:h-8 px-2 sm:px-3 transition-all hover:scale-105"
                                    onClick={() => {
                                      setSelectedSupplier(supplier);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          </>
        )}

        {/* Products Section */}
        {activeTab === 'products' && (
          <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-b border-purple-500/20">
              <CardTitle className="text-base sm:text-lg md:text-xl text-white">Product Listings</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-purple-300/70">Review and manage supplier products</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <p className="text-center py-8 text-sm sm:text-base text-purple-300">Loading products...</p>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-purple-400/50 mb-4" />
                  <p className="text-purple-400/70 text-sm sm:text-base">No products found</p>
                  <p className="text-purple-400/50 text-xs sm:text-sm mt-2">Products will appear here once suppliers add them</p>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gradient-to-r from-purple-500/20 to-orange-500/20">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Product</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Supplier</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Category</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Price</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Stock</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Status</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Added</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {products.map((product) => {
                        // Fix image URLs to work in both dev and production
                        let productImageUrl = (product.images && product.images.length > 0) ? product.images[0] : '';
                        if (productImageUrl.includes('localhost:5000')) {
                          const backendBaseUrl = import.meta.env.PROD 
                            ? 'https://backendmatrix.onrender.com'
                            : 'http://localhost:5000';
                          productImageUrl = productImageUrl.replace('http://localhost:5000', backendBaseUrl);
                        }
                        return (
                        <tr key={product._id} className="hover:bg-purple-500/5 transition-colors group">
                          <td className="px-3 sm:px-4 py-3">
                            <div className="flex items-center gap-3">
                              {productImageUrl ? (
                                <img 
                                  src={productImageUrl} 
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500/30"
                                  onError={(e) => {
                                    e.currentTarget.src = '';
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center border-2 border-purple-500/30">
                                  <Package className="w-6 h-6 text-purple-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-white">{product.name}</p>
                                <p className="text-xs text-purple-400/70 line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <p className="text-sm font-medium text-white">{product.supplierId.companyName}</p>
                            <p className="text-xs text-purple-400/70">{product.supplierId.email}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {product.category}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <p className="text-sm font-bold text-white">
                              {product.price.currency} {product.price.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-purple-400/70">per {product.price.unit}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            {product.stock.available ? (
                              <div className="flex items-center gap-1.5 text-green-400">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Available</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-400">
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Out of Stock</span>
                              </div>
                            )}
                            {product.stock.quantity && (
                              <p className="text-xs text-purple-400/70 mt-0.5">{product.stock.quantity} units</p>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <Badge className={
                              product.status === 'active'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : product.status === 'pending'
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                : product.status === 'rejected'
                                ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-xs text-purple-300">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowProductDetails(true);
                                }}
                                className="hover:bg-blue-500/20 text-blue-300 h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {product.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleApproveProduct(product._id)}
                                    className="hover:bg-green-500/20 text-green-400 h-8 w-8 p-0"
                                    title="Approve Product"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setShowRejectDialog(true);
                                    }}
                                    className="hover:bg-red-500/20 text-red-400 h-8 w-8 p-0"
                                    title="Reject Product"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProduct(product._id)}
                                className="hover:bg-red-500/20 text-red-400 h-8 w-8 p-0"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* RFQ Section */}
        {activeTab === 'rfq' && (
          <Card className="border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-b border-purple-500/20 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <CardTitle className="text-xs sm:text-sm md:text-base text-white font-bold">RFQ Requests</CardTitle>
              <CardDescription className="text-[8px] sm:text-xs text-purple-300/70 mt-1">Manage customer requests for quotes</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 overflow-hidden">
              {rfqs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-purple-400/50 mb-3 sm:mb-4" />
                  <p className="text-purple-400/70 text-xs sm:text-base">No RFQs found</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto scrollbar-hide -mx-2 sm:-mx-3 md:-mx-4">
                  <table className="w-full text-[11px] sm:text-xs md:text-sm">
                    <thead className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 sticky top-0">
                      <tr>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 whitespace-nowrap">Customer</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 whitespace-nowrap hidden sm:table-cell">Product</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 whitespace-nowrap hidden md:table-cell">Qty</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 whitespace-nowrap hidden lg:table-cell">Location</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 whitespace-nowrap">Status</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 whitespace-nowrap hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {rfqs.map((rfq) => (
                        <tr key={rfq._id} className="hover:bg-purple-500/10 transition-colors cursor-pointer" onClick={() => { setSelectedRFQ(rfq); setShowRFQDetails(true); }}>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-xs font-semibold text-white truncate">{rfq.customerName}</p>
                              <p className="text-[9px] sm:text-xs text-purple-400/70 truncate">{rfq.email}</p>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden sm:table-cell text-[10px] sm:text-xs text-white truncate">{rfq.productName}</td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden md:table-cell text-[10px] sm:text-xs text-white text-center">{rfq.quantity}</td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden lg:table-cell text-[10px] sm:text-xs text-purple-300 truncate">{rfq.deliveryLocation}</td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                            <Badge className={`text-[10px] sm:text-xs py-0.5 px-1.5 ${rfq.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : rfq.status === 'quoted' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : rfq.status === 'accepted' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-pink-500/20 text-pink-300 border-pink-500/30'}`}>
                              {rfq.status}
                            </Badge>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden sm:table-cell text-[9px] sm:text-xs text-purple-300 whitespace-nowrap">{new Date(rfq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] border-purple-500/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Supplier Application Details</DialogTitle>
              <DialogDescription className="text-purple-300">
                Complete information about the supplier application
              </DialogDescription>
            </DialogHeader>
            {selectedSupplier && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Company Name</label>
                      <p className="text-white font-medium">{selectedSupplier.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Contact Person</label>
                      <p className="text-white font-medium">{selectedSupplier.contactPerson}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Email</label>
                      <p className="text-white font-medium">{selectedSupplier.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Phone</label>
                      <p className="text-white font-medium">{selectedSupplier.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Business Type</label>
                      <Badge variant="outline" className="mt-1 border-purple-400/50 text-purple-200">{selectedSupplier.businessType}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedSupplier.status)}</div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-sm font-semibold text-purple-300">Submitted Date</label>
                      <p className="text-white font-medium">
                        {new Date(selectedSupplier.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Address</h3>
                  <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/30 p-4 rounded-lg">
                    <p className="text-white">{selectedSupplier.address.street}</p>
                    <p className="text-white">
                      {selectedSupplier.address.city}, {selectedSupplier.address.state} - {selectedSupplier.address.pincode}
                    </p>
                    <p className="text-white">{selectedSupplier.address.country}</p>
                  </div>
                </div>

                {/* Business Details */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Business Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Years in Business</label>
                      <p className="text-white font-medium">{selectedSupplier.yearsInBusiness} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Business Description</label>
                      <p className="text-white bg-purple-500/10 backdrop-blur-xl border border-purple-500/30 p-3 rounded-lg">{selectedSupplier.businessDescription}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Products/Services Offered</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSupplier.productsOffered.map((product, idx) => (
                          <Badge key={idx} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Uploaded Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* PAN Card */}
                    {selectedSupplier.documents.pan && (
                      <div className="border-2 border-purple-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all bg-gradient-to-br from-purple-500/5 to-orange-500/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">PAN Card</p>
                              <p className="text-xs text-purple-300 truncate max-w-[200px]">{selectedSupplier.documents.pan.fileName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            onClick={() => setPreviewDocument({
                              url: `${API_URL.replace('/api', '')}${selectedSupplier.documents.pan.fileUrl}`,
                              name: 'PAN Card'
                            })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <a
                            href={`${API_URL.replace('/api', '')}${selectedSupplier.documents.pan.fileUrl}`}
                            download
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* GST Certificate */}
                    {selectedSupplier.documents.gst && (
                      <div className="border-2 border-purple-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all bg-gradient-to-br from-purple-500/5 to-orange-500/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">GST Certificate</p>
                              <p className="text-xs text-purple-300 truncate max-w-[200px]">{selectedSupplier.documents.gst.fileName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            onClick={() => setPreviewDocument({
                              url: `${API_URL.replace('/api', '')}${selectedSupplier.documents.gst.fileUrl}`,
                              name: 'GST Certificate'
                            })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <a
                            href={`${API_URL.replace('/api', '')}${selectedSupplier.documents.gst.fileUrl}`}
                            download
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* CIN Certificate */}
                    {selectedSupplier.documents.cin && (
                      <div className="border-2 border-purple-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all bg-gradient-to-br from-purple-500/5 to-orange-500/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">CIN Certificate</p>
                              <p className="text-xs text-purple-300 truncate max-w-[200px]">{selectedSupplier.documents.cin.fileName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            onClick={() => setPreviewDocument({
                              url: `${API_URL.replace('/api', '')}${selectedSupplier.documents.cin.fileUrl}`,
                              name: 'CIN Certificate'
                            })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <a
                            href={`${API_URL.replace('/api', '')}${selectedSupplier.documents.cin.fileUrl}`}
                            download
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Bank Proof */}
                    {selectedSupplier.documents.bankProof && (
                      <div className="border-2 border-purple-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all bg-gradient-to-br from-purple-500/5 to-orange-500/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">Bank Proof</p>
                              <p className="text-xs text-purple-300 truncate max-w-[200px]">{selectedSupplier.documents.bankProof.fileName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            onClick={() => setPreviewDocument({
                              url: `${API_URL.replace('/api', '')}${selectedSupplier.documents.bankProof.fileUrl}`,
                              name: 'Bank Proof'
                            })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <a
                            href={`${API_URL.replace('/api', '')}${selectedSupplier.documents.bankProof.fileUrl}`}
                            download
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Business License */}
                    {selectedSupplier.documents.businessLicense && (
                      <div className="border-2 border-purple-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all bg-gradient-to-br from-purple-500/5 to-orange-500/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">Business License</p>
                              <p className="text-xs text-purple-300 truncate max-w-[200px]">{selectedSupplier.documents.businessLicense.fileName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            onClick={() => setPreviewDocument({
                              url: `${API_URL.replace('/api', '')}${selectedSupplier.documents.businessLicense.fileUrl}`,
                              name: 'Business License'
                            })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <a
                            href={`${API_URL.replace('/api', '')}${selectedSupplier.documents.businessLicense.fileUrl}`}
                            download
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Aadhaar Card */}
                    {selectedSupplier.documents.aadhaar && (
                      <div className="border-2 border-purple-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all bg-gradient-to-br from-purple-500/5 to-orange-500/5 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">Aadhaar Card</p>
                              <p className="text-xs text-purple-300 truncate max-w-[200px]">{selectedSupplier.documents.aadhaar.fileName}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            onClick={() => setPreviewDocument({
                              url: `${API_URL.replace('/api', '')}${selectedSupplier.documents.aadhaar.fileUrl}`,
                              name: 'Aadhaar Card'
                            })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <a
                            href={`${API_URL.replace('/api', '')}${selectedSupplier.documents.aadhaar.fileUrl}`}
                            download
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSupplier.rejectionReason && (
                  <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-lg p-4">
                    <label className="text-sm font-semibold text-red-300">Rejection Reason</label>
                    <p className="text-red-200 mt-1">{selectedSupplier.rejectionReason}</p>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-purple-500/30">
                  {selectedSupplier.status === 'pending' && (
                    <>
                      <Button
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                        onClick={() => {
                          handleApprove(selectedSupplier._id);
                          setShowDetails(false);
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                        onClick={() => {
                          setShowDetails(false);
                          setShowRejectDialog(true);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-6xl h-[90vh] p-0 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] border-purple-500/30 backdrop-blur-xl">
            <DialogHeader className="p-6 pb-4 border-b border-purple-500/30">
              <DialogTitle className="text-xl bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">{previewDocument?.name}</DialogTitle>
              <DialogDescription className="text-purple-300">
                Document preview - Click outside to close
              </DialogDescription>
            </DialogHeader>
            {previewDocument && (
              <div className="flex-1 overflow-hidden px-6 pb-6">
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full border-2 border-purple-500/30 rounded-lg bg-white"
                  title={previewDocument.name}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Product Details Dialog */}
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] border-purple-500/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Product Details</DialogTitle>
              <DialogDescription className="text-purple-300">
                Complete information about the product listing
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Images */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Product Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedProduct.images.map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`${selectedProduct.name} - ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-purple-500/30"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Product Name</label>
                      <p className="text-white font-medium">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Category</label>
                      <Badge className="mt-1 bg-blue-500/20 text-blue-300 border-blue-500/30">{selectedProduct.category}</Badge>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-sm font-semibold text-purple-300">Description</label>
                      <p className="text-white mt-1">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>

                {/* Supplier Information */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Supplier Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Company Name</label>
                      <p className="text-white font-medium">{selectedProduct.supplierId.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Email</label>
                      <p className="text-white font-medium">{selectedProduct.supplierId.email}</p>
                    </div>
                  </div>
                </div>

                {/* Price & Stock */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Price & Stock</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Price</label>
                      <p className="text-white font-bold text-lg">{selectedProduct.price.currency} {selectedProduct.price.amount.toLocaleString()}</p>
                      <p className="text-purple-400/70 text-sm">per {selectedProduct.price.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Stock Status</label>
                      <Badge className={selectedProduct.stock.available ? 'bg-green-500/20 text-green-300 border-green-500/30 mt-1' : 'bg-red-500/20 text-red-300 border-red-500/30 mt-1'}>
                        {selectedProduct.stock.available ? 'Available' : 'Out of Stock'}
                      </Badge>
                    </div>
                    {selectedProduct.stock.quantity && (
                      <div>
                        <label className="text-sm font-semibold text-purple-300">Quantity</label>
                        <p className="text-white font-medium">{selectedProduct.stock.quantity} units</p>
                      </div>
                    )}
                    {selectedProduct.stock.minimumOrder && (
                      <div>
                        <label className="text-sm font-semibold text-purple-300">Minimum Order</label>
                        <p className="text-white font-medium">{selectedProduct.stock.minimumOrder} units</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Current Status</label>
                      <div className="mt-1">
                        <Badge className={
                          selectedProduct.status === 'active'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : selectedProduct.status === 'pending'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            : selectedProduct.status === 'rejected'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }>
                          {selectedProduct.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-purple-300">Added Date</label>
                      <p className="text-white font-medium">
                        {new Date(selectedProduct.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-purple-500/30">
                  {selectedProduct.status === 'pending' && (
                    <>
                      <Button
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                        onClick={() => {
                          handleApproveProduct(selectedProduct._id);
                          setShowProductDetails(false);
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Product
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                        onClick={() => {
                          setShowProductDetails(false);
                          setShowRejectDialog(true);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Product
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowProductDetails(false)}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] border-purple-500/30 backdrop-blur-xl">
            <DialogHeader className="border-b border-purple-500/30 pb-4">
              <DialogTitle className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Reject {selectedProduct ? 'Product' : 'Supplier Application'}
              </DialogTitle>
              <DialogDescription className="text-purple-300">
                Provide a reason for rejection. This will be sent via email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                className="bg-purple-500/10 backdrop-blur-xl border-purple-500/30 text-white placeholder:text-purple-400/50 focus:border-purple-400"
              />
              <div className="flex flex-wrap justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectDialog(false)}
                  className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg" 
                  onClick={() => {
                    if (selectedProduct) {
                      handleRejectProduct(selectedProduct._id, rejectionReason);
                      setShowRejectDialog(false);
                      setRejectionReason('');
                    } else {
                      handleReject();
                    }
                  }}
                >
                  Reject {selectedProduct ? 'Product' : 'Application'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* RFQ Details Modal */}
        <Dialog open={showRFQDetails} onOpenChange={setShowRFQDetails}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] border-purple-500/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">RFQ Details</DialogTitle>
              <DialogDescription className="text-purple-300">Complete request for quotation information</DialogDescription>
            </DialogHeader>
            {selectedRFQ && (
              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold text-purple-300">Name</label><p className="text-white font-medium">{selectedRFQ.customerName}</p></div>
                    <div><label className="text-sm font-semibold text-purple-300">Email</label><p className="text-white font-medium break-all">{selectedRFQ.email}</p></div>
                    <div><label className="text-sm font-semibold text-purple-300">Phone</label><p className="text-white font-medium">{selectedRFQ.phone}</p></div>
                    <div><label className="text-sm font-semibold text-purple-300">Company</label><p className="text-white font-medium">{selectedRFQ.company || 'Not specified'}</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Product & Delivery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold text-purple-300">Product</label><p className="text-white font-medium">{selectedRFQ.productName}</p></div>
                    <div><label className="text-sm font-semibold text-purple-300">Category</label><p className="text-white font-medium">{selectedRFQ.productCategory}</p></div>
                    <div><label className="text-sm font-semibold text-purple-300">Quantity</label><p className="text-white font-medium">{selectedRFQ.quantity} {selectedRFQ.unit}</p></div>
                    <div><label className="text-sm font-semibold text-purple-300">📍 Delivery Location</label><p className="text-white font-medium text-lg">{selectedRFQ.deliveryLocation || 'Not specified'}</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3 border-b border-purple-500/30 pb-2">Status & Timeline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold text-purple-300">Status</label><Badge className={selectedRFQ.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30 mt-2' : 'bg-blue-500/20 text-blue-300 border-blue-500/30 mt-2'}>{selectedRFQ.status}</Badge></div>
                    <div><label className="text-sm font-semibold text-purple-300">Submitted</label><p className="text-white font-medium">{new Date(selectedRFQ.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</p></div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-purple-500/30">
                  <Button variant="outline" className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20" onClick={() => setShowRFQDetails(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
