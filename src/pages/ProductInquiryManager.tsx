import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  AlertCircle, 
  Users,
  Phone,
  Mail,
  Package,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

// Dynamic API URL based on environment
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🌐 Product Inquiry Manager hostname:', hostname);
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('💻 Product Inquiry Manager running locally - using localhost backend');
      return 'http://localhost:5000/api';
    }
    
    if (hostname.includes('vercel.app') || hostname.includes('ritzyard.com')) {
      console.log('✅ Product Inquiry Manager running on Vercel - using production backend');
      return 'https://backendmatrix.onrender.com/api';
    }
  }
  
  if (import.meta.env.VITE_API_URL) {
    console.log('⚙️ Product Inquiry Manager using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  console.log('💻 Product Inquiry Manager defaulting to localhost backend');
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();
console.log('📡 Product Inquiry Manager API Base URL:', API_BASE_URL);

interface ProductInquiry {
  _id: string;
  inquiryNumber: string;
  productName: string;
  customerName: string;
  phone: string;
  email?: string;
  quantity?: string;
  specifications?: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  total: number;
  new: number;
  contacted: number;
  quoted: number;
  converted: number;
  closed: number;
  urgent: number;
  high: number;
}

const ProductInquiryManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ProductInquiry[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    new: 0,
    contacted: 0,
    quoted: 0,
    converted: 0,
    closed: 0,
    urgent: 0,
    high: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ProductInquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      
      console.log('Fetching from:', `${API_BASE_URL}/product-inquiries/admin/all`);
      const response = await axios.get(`${API_BASE_URL}/product-inquiries/admin/all`, config);
      console.log('Response:', response.data);

      if (response.data.success) {
        setInquiries(response.data.data);
        setFilteredInquiries(response.data.data);
        setStatistics(response.data.stats);
        console.log('Loaded inquiries:', response.data.data.length);
      }
    } catch (error: any) {
      console.error('Error fetching inquiries:', error.response?.data || error.message);
      toast.error('Failed to load product inquiries');
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
          inquiry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-500/20 text-blue-400 border-blue-400/30', label: 'New' },
      contacted: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30', label: 'Contacted' },
      quoted: { color: 'bg-purple-500/20 text-purple-400 border-purple-400/30', label: 'Quoted' },
      converted: { color: 'bg-green-500/20 text-green-400 border-green-400/30', label: 'Converted' },
      closed: { color: 'bg-gray-500/20 text-gray-400 border-gray-400/30', label: 'Closed' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={`${config.color} border font-medium text-xs`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: { color: 'bg-red-500/20 text-red-400 border-red-400/30', label: 'Urgent' },
      high: { color: 'bg-orange-500/20 text-orange-400 border-orange-400/30', label: 'High' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30', label: 'Medium' },
      low: { color: 'bg-green-500/20 text-green-400 border-green-400/30', label: 'Low' },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge className={`${config.color} border font-medium text-xs`}>{config.label}</Badge>;
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/product-inquiries/${id}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchInquiries();
        if (selectedInquiry?._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
        }
      }
    } catch (error: any) {
      console.error('Error updating status:', error.response?.data || error.message);
      toast.error('Failed to update status');
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/product-inquiries/${id}`);

      if (response.data.success) {
        toast.success('Inquiry deleted successfully');
        fetchInquiries();
        if (showDetailModal) {
          setShowDetailModal(false);
          setSelectedInquiry(null);
        }
      }
    } catch (error: any) {
      console.error('Error deleting inquiry:', error.response?.data || error.message);
      toast.error('Failed to delete inquiry');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b3d] to-[#1a1625] p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-400" />
            Product Inquiry Manager
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Manage customer product inquiries and requests</p>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block text-sm">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="Search by inquiry #, product, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block text-sm">Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d1b3d] border-white/10">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block text-sm">Priority Filter</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
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

        {/* Inquiries Grid */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-white flex items-center justify-between flex-wrap gap-3 sm:gap-4 text-base sm:text-lg md:text-xl">
              <span className="text-sm sm:text-base md:text-lg">Product Inquiries ({filteredInquiries.length})</span>
              <Button onClick={fetchInquiries} className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm">
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {loading ? (
              <div className="text-center text-gray-400 py-8 sm:py-12 text-sm sm:text-base">Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center text-gray-400 py-8 sm:py-12 text-sm sm:text-base">No inquiries found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredInquiries.map((inquiry) => (
                  <Card key={inquiry._id} className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-purple-400 font-mono text-xs mb-1">Inquiry #</p>
                          <p className="text-white font-bold text-base sm:text-lg">{inquiry.inquiryNumber}</p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(inquiry.status)}
                        </div>
                      </div>

                      {/* Product */}
                      <div className="border-t border-white/10 pt-3 sm:pt-4">
                        <p className="text-gray-400 text-xs mb-1">Product Requested</p>
                        <p className="text-white font-medium text-sm">{inquiry.productName}</p>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-2 border-t border-white/10 pt-3 sm:pt-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <p className="text-white font-medium text-xs sm:text-sm truncate flex-1 min-w-0">{inquiry.customerName}</p>
                        </div>
                        
                        {inquiry.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <p className="text-gray-300 text-xs truncate flex-1 min-w-0">{inquiry.email}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <p className="text-gray-300 text-xs">{inquiry.phone}</p>
                        </div>
                      </div>

                      {/* Quantity & Priority */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 border-t border-white/10 pt-3 sm:pt-4">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Priority</p>
                          {getPriorityBadge(inquiry.priority)}
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Date</p>
                          <p className="text-gray-300 text-xs">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 border-t border-white/10 pt-3 sm:pt-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowDetailModal(true);
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteInquiry(inquiry._id)}
                          className="bg-red-600 hover:bg-red-700 px-2 sm:px-3"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#2d1b3d] border-white/10 text-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span className="truncate">Inquiry Details - {selectedInquiry?.inquiryNumber}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 sm:space-y-6">
              {/* Product Info */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <Label className="text-gray-400 text-xs sm:text-sm">Product Requested</Label>
                  <p className="text-white font-medium text-sm sm:text-base mt-1">{selectedInquiry.productName}</p>
                </div>
                {selectedInquiry.quantity && (
                  <div>
                    <Label className="text-gray-400 text-xs sm:text-sm">Quantity</Label>
                    <p className="text-white text-sm sm:text-base mt-1">{selectedInquiry.quantity}</p>
                  </div>
                )}
                {selectedInquiry.specifications && (
                  <div>
                    <Label className="text-gray-400 text-xs sm:text-sm">Specifications</Label>
                    <p className="text-white text-sm sm:text-base mt-1 whitespace-pre-wrap">{selectedInquiry.specifications}</p>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t border-white/10 pt-4">
                <div>
                  <Label className="text-gray-400 flex items-center gap-2 text-xs sm:text-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" /> Customer Name
                  </Label>
                  <p className="text-white font-medium text-sm sm:text-base mt-1">{selectedInquiry.customerName}</p>
                </div>
                <div>
                  <Label className="text-gray-400 flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" /> Phone
                  </Label>
                  <p className="text-white text-sm sm:text-base mt-1">{selectedInquiry.phone}</p>
                </div>
                {selectedInquiry.email && (
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" /> Email
                    </Label>
                    <p className="text-white text-sm sm:text-base mt-1 truncate">{selectedInquiry.email}</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="border-t border-white/10 pt-4">
                <Label className="text-gray-400 mb-2 block text-xs sm:text-sm">Update Status</Label>
                <Select
                  value={selectedInquiry.status}
                  onValueChange={(value) => updateStatus(selectedInquiry._id, value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d1b3d] border-white/10">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductInquiryManager;
