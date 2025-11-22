import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
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

const OrderAutomation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [orders, setOrders] = useState([
    {
      id: 'ORD-2024-001',
      supplier: 'Steel Industries Ltd',
      product: 'Steel Plates (10mm)',
      quantity: 100,
      unit: 'pieces',
      status: 'processed',
      autoProcessed: true,
      amount: '₹2,50,000',
      orderedAt: '2 hours ago',
      estimatedDelivery: '5 days',
      automationScore: 95,
    },
    {
      id: 'ORD-2024-002',
      supplier: 'ABC Manufacturing',
      product: 'Metal Fasteners',
      quantity: 5000,
      unit: 'units',
      status: 'processing',
      autoProcessed: true,
      amount: '₹75,000',
      orderedAt: '1 hour ago',
      estimatedDelivery: '3 days',
      automationScore: 88,
    },
    {
      id: 'ORD-2024-003',
      supplier: 'Global Traders',
      product: 'Electrical Components',
      quantity: 200,
      unit: 'boxes',
      status: 'fulfilled',
      autoProcessed: true,
      amount: '₹1,80,000',
      orderedAt: '12 hours ago',
      estimatedDelivery: 'Today',
      automationScore: 92,
    },
    {
      id: 'ORD-2024-004',
      supplier: 'Tech Solutions Ltd',
      product: 'Custom Parts',
      quantity: 50,
      unit: 'pieces',
      status: 'pending',
      autoProcessed: false,
      amount: '₹1,50,000',
      orderedAt: '30 minutes ago',
      estimatedDelivery: '7 days',
      automationScore: 35,
    },
    {
      id: 'ORD-2024-005',
      supplier: 'Prime Wholesale',
      product: 'Bulk Rubber Products',
      quantity: 1000,
      unit: 'kg',
      status: 'processed',
      autoProcessed: true,
      amount: '₹3,50,000',
      orderedAt: '3 hours ago',
      estimatedDelivery: '2 days',
      automationScore: 98,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'processed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'pending':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    processed: orders.filter((o) => o.status === 'processed' || o.status === 'fulfilled').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    automated: orders.filter((o) => o.autoProcessed).length,
  };

  const handleAutoProcess = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, autoProcessed: true, status: 'processing', automationScore: 90 }
          : order
      )
    );
    toast({
      title: 'Success',
      description: 'Order queued for automated processing',
    });
  };

  const handleManualReview = (orderId: string) => {
    toast({
      title: 'Opened',
      description: 'Order opened for manual review',
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Order Automation</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Automated order processing</p>
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
              label: 'Total Orders',
              value: stats.total,
              icon: Package,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Automated',
              value: stats.automated,
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Pending Review',
              value: stats.pending,
              icon: Clock,
              color: 'from-yellow-500 to-orange-500',
            },
            {
              label: 'Success Rate',
              value: `${Math.round((stats.automated / stats.total) * 100)}%`,
              icon: TrendingUp,
              color: 'from-purple-500 to-pink-500',
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
                  placeholder="Search orders by ID, supplier, or product..."
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
              <option value="all" className="bg-slate-900 text-white">All Orders</option>
              <option value="processed" className="bg-slate-900 text-white">Processed</option>
              <option value="processing" className="bg-slate-900 text-white">Processing</option>
              <option value="fulfilled" className="bg-slate-900 text-white">Fulfilled</option>
              <option value="pending" className="bg-slate-900 text-white">Pending</option>
            </select>
          </div>
        </div>

        {/* Orders List - Responsive */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {order.id}
                        </h3>
                        <Badge className={`${getStatusColor(order.status)} text-[9px] sm:text-[10px]`}>
                          {order.status.toUpperCase()}
                        </Badge>
                        {order.autoProcessed && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[9px] sm:text-[10px]">
                            AUTO
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {order.supplier} • {order.product}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg sm:text-xl font-bold text-purple-300">
                        {order.amount}
                      </p>
                      <p className="text-xs text-slate-400">{order.orderedAt}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="p-2 sm:p-3 rounded-lg bg-white/5 border border-purple-500/20">
                      <p className="text-slate-400 mb-1">Quantity</p>
                      <p className="font-semibold text-white">
                        {order.quantity} {order.unit}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-white/5 border border-purple-500/20">
                      <p className="text-slate-400 mb-1">Est. Delivery</p>
                      <p className="font-semibold text-white">
                        {order.estimatedDelivery}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-white/5 border border-purple-500/20">
                      <p className="text-slate-400 mb-1">Automation</p>
                      <div className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(order.automationScore)}`} />
                      <p className="text-xs text-slate-400 mt-1">{order.automationScore}%</p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-white/5 border border-purple-500/20">
                      <p className="text-slate-400 mb-1">Action</p>
                      {!order.autoProcessed && (
                        <Button
                          size="sm"
                          onClick={() => handleAutoProcess(order.id)}
                          className="h-6 text-xs bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                        >
                          Auto Process
                        </Button>
                      )}
                      {order.autoProcessed && (
                        <p className="text-xs text-green-300 font-semibold">✓ Processed</p>
                      )}
                    </div>
                  </div>

                  {/* Automation Score and Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-3 border-t border-purple-500/20">
                    <div className="flex-1 text-xs">
                      <p className="text-slate-400 mb-1">Automation Details</p>
                      <p className="text-slate-300">
                        {order.autoProcessed
                          ? '✓ Automatically processed and tracked'
                          : '⚠ Requires manual review'}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                          onClick={() => handleManualReview(order.id)}
                        >
                          <span className="hidden sm:inline">Manual Review</span>
                          <span className="sm:hidden">Review</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="border border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-purple-400/50 mb-4" />
              <p className="text-slate-400">No orders found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderAutomation;
