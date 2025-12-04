import React, { useState, useEffect } from 'react';
import { 
  Boxes,
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  ChevronDown,
  Calendar,
  Phone,
  Mail,
  Building,
  MapPin,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

// Dynamic API URL based on environment
const getApiUrl = () => {
  // Check if we're on Vercel (production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🌐 Admin hostname:', hostname);
    
    // Check if running on localhost (development)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('💻 Admin running locally - using localhost backend');
      return 'http://localhost:5000/api';
    }
    
    // Vercel production domains
    if (hostname.includes('vercel.app') || hostname.includes('ritzyard.com')) {
      console.log('✅ Admin running on Vercel - using production backend');
      return 'https://backendmatrix.onrender.com/api';
    }
  }
  
  // Check if VITE_API_URL is set
  if (import.meta.env.VITE_API_URL) {
    console.log('⚙️ Admin using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to localhost for development
  console.log('💻 Admin defaulting to localhost backend');
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();
console.log('📡 Admin API Base URL:', API_BASE_URL);

interface Material {
  materialName: string;
  category: string;
  grade?: string;
  specification?: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
  requiredByDate?: Date;
}

interface SupplierQuote {
  _id: string;
  supplierId: string;
  supplierName: string;
  quotedPrice: number;
  quotedDate: Date;
  validUntil?: Date;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface MaterialInquiry {
  _id: string;
  inquiryNumber: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  materials: Material[];
  deliveryLocation: string;
  deliveryAddress?: string;
  totalEstimatedValue?: number;
  paymentTerms?: string;
  additionalRequirements?: string;
  status: 'new' | 'under_review' | 'quoted' | 'negotiating' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  supplierQuotes?: SupplierQuote[];
  adminNotes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  total: number;
  new: number;
  under_review: number;
  quoted: number;
  negotiating: number;
  accepted: number;
  completed: number;
  urgent: number;
  high: number;
}

const MaterialInquiryManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<MaterialInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<MaterialInquiry[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    new: 0,
    under_review: 0,
    quoted: 0,
    negotiating: 0,
    accepted: 0,
    completed: 0,
    urgent: 0,
    high: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<MaterialInquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteData, setQuoteData] = useState({
    supplierName: '',
    quotedPrice: '',
    validUntil: '',
    notes: '',
  });

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Build request with or without token
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      
      console.log('Fetching from:', `${API_BASE_URL}/material-inquiries/admin/all`);
      const response = await axios.get(`${API_BASE_URL}/material-inquiries/admin/all`, config);
      console.log('Response:', response.data);

      if (response.data.success) {
        setInquiries(response.data.data);
        setFilteredInquiries(response.data.data);
        setStatistics(response.data.stats);
        console.log('Loaded inquiries:', response.data.data.length);
      }
    } catch (error: any) {
      console.error('Error fetching inquiries:', error.response?.data || error.message);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Filter inquiries
  useEffect(() => {
    let filtered = inquiries;

    if (searchTerm) {
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.inquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((inquiry) => inquiry.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((inquiry) => inquiry.priority === priorityFilter);
    }

    setFilteredInquiries(filtered);
  }, [searchTerm, statusFilter, priorityFilter, inquiries]);

  // Update inquiry status
  const updateStatus = async (inquiryId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_BASE_URL}/material-inquiries/admin/${inquiryId}/status`,
        { status, adminNotes: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchInquiries();
        setShowDetailModal(false);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Add supplier quote
  const handleAddQuote = async () => {
    if (!selectedInquiry || !quoteData.supplierName || !quoteData.quotedPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/material-inquiries/admin/${selectedInquiry._id}/quote`,
        {
          supplierId: 'dummy-id', // You can integrate with actual supplier selection
          supplierName: quoteData.supplierName,
          quotedPrice: parseFloat(quoteData.quotedPrice),
          validUntil: quoteData.validUntil || undefined,
          notes: quoteData.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Quote added successfully');
        setShowQuoteModal(false);
        setQuoteData({ supplierName: '', quotedPrice: '', validUntil: '', notes: '' });
        fetchInquiries();
      }
    } catch (error) {
      toast.error('Failed to add quote');
    }
  };

  // Delete inquiry
  const deleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/material-inquiries/admin/${inquiryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Inquiry deleted successfully');
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to delete inquiry');
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      new: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: AlertCircle },
      under_review: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
      quoted: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: FileText },
      negotiating: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: TrendingUp },
      accepted: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
      completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
      cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: XCircle },
    };

    const style = styles[status] || styles.new;
    const Icon = style.icon;

    return (
      <Badge className={`${style.bg} ${style.text} border-0 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-500/20 text-red-400',
      high: 'bg-orange-500/20 text-orange-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      low: 'bg-green-500/20 text-green-400',
    };

    return <Badge className={`${styles[priority]} border-0`}>{priority}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b3d] to-[#1a1625] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Boxes className="w-10 h-10 text-purple-400" />
            Material Inquiry Manager
          </h1>
          <p className="text-gray-400">Manage bulk material orders and inquiries</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Inquiries</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.total}</p>
                </div>
                <FileText className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">New Inquiries</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{statistics.new}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Urgent Priority</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">{statistics.urgent}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{statistics.completed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by inquiry #, name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d1b3d] border-white/10">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Priority Filter</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d1b3d] border-white/10">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Material Inquiries ({filteredInquiries.length})</span>
              <Button onClick={fetchInquiries} className="bg-purple-600 hover:bg-purple-700">
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No inquiries found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 py-3 px-4">Inquiry #</th>
                      <th className="text-left text-gray-300 py-3 px-4">Customer</th>
                      <th className="text-left text-gray-300 py-3 px-4">Materials</th>
                      <th className="text-left text-gray-300 py-3 px-4">Est. Value</th>
                      <th className="text-left text-gray-300 py-3 px-4">Status</th>
                      <th className="text-left text-gray-300 py-3 px-4">Priority</th>
                      <th className="text-left text-gray-300 py-3 px-4">Date</th>
                      <th className="text-left text-gray-300 py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <span className="text-purple-400 font-mono">{inquiry.inquiryNumber}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{inquiry.customerName}</p>
                            {inquiry.companyName && (
                              <p className="text-gray-400 text-sm">{inquiry.companyName}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-blue-500/20 text-blue-400 border-0">
                            {inquiry.materials.length} items
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-400 font-semibold">
                            {inquiry.totalEstimatedValue
                              ? `₹${inquiry.totalEstimatedValue.toLocaleString()}`
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(inquiry.status)}</td>
                        <td className="py-4 px-4">{getPriorityBadge(inquiry.priority)}</td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setShowDetailModal(true);
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => deleteInquiry(inquiry._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#2d1b3d] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Inquiry Details - {selectedInquiry?.inquiryNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Customer Name
                  </Label>
                  <p className="text-white font-medium">{selectedInquiry.customerName}</p>
                </div>
                <div>
                  <Label className="text-gray-400 flex items-center gap-2">
                    <Building className="w-4 h-4" /> Company
                  </Label>
                  <p className="text-white">{selectedInquiry.companyName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <p className="text-white">{selectedInquiry.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </Label>
                  <p className="text-white">{selectedInquiry.phone}</p>
                </div>
              </div>

              {/* Materials */}
              <div>
                <Label className="text-gray-400 mb-2 block">Materials Requested</Label>
                <div className="space-y-2">
                  {selectedInquiry.materials.map((material, index) => (
                    <Card key={index} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-gray-400 text-sm">Material</p>
                            <p className="text-white font-medium">{material.materialName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Category</p>
                            <p className="text-white">{material.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Quantity</p>
                            <p className="text-white">
                              {material.quantity} {material.unit}
                            </p>
                          </div>
                          {material.targetPrice && (
                            <div>
                              <p className="text-gray-400 text-sm">Target Price</p>
                              <p className="text-green-400">₹{material.targetPrice.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Delivery Location
                  </Label>
                  <p className="text-white">{selectedInquiry.deliveryLocation}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Est. Value</Label>
                  <p className="text-green-400 font-semibold text-xl">
                    ₹{selectedInquiry.totalEstimatedValue?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <Label className="text-gray-400 mb-2 block">Update Status</Label>
                <Select
                  value={selectedInquiry.status}
                  onValueChange={(value) => updateStatus(selectedInquiry._id, value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d1b3d] border-white/10">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Quote Button */}
              <Button
                onClick={() => setShowQuoteModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier Quote
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Quote Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="bg-[#2d1b3d] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Supplier Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Supplier Name *</Label>
              <Input
                value={quoteData.supplierName}
                onChange={(e) => setQuoteData({ ...quoteData, supplierName: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label className="text-gray-300">Quoted Price (₹) *</Label>
              <Input
                type="number"
                value={quoteData.quotedPrice}
                onChange={(e) => setQuoteData({ ...quoteData, quotedPrice: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label className="text-gray-300">Valid Until</Label>
              <Input
                type="date"
                value={quoteData.validUntil}
                onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Notes</Label>
              <Textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuoteModal(false)} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={handleAddQuote} className="bg-purple-600 hover:bg-purple-700">
              Add Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialInquiryManager;
