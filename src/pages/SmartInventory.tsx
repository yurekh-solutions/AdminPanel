import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  LogOut,
  ArrowLeft,
  Search,
  AlertCircle,
  TrendingUp,
  Clock,
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
import { smartInventoryService } from '@/lib/automationService';

const SmartInventory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadInventory();
  }, [token, navigate]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await smartInventoryService.getInventory(token!);
      setInventoryData(data || []);
    } catch (error: any) {
      console.error('Failed to load inventory:', error);

      if (error?.message?.includes('401')) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }

      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = inventoryData.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventoryData.filter(item => item.status === 'low-stock');
  const inStockItems = inventoryData.filter(item => item.status === 'in-stock');

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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Smart Inventory</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Real-time stock tracking & alerts</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-purple-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-300">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{inventoryData.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                <TrendingUp className="w-3 h-3" />
                <span>Tracked across suppliers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-300">In Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{inStockItems.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                <span>Ready to fulfill</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-300">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{lowStockItems.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                <AlertCircle className="w-3 h-3" />
                <span>Needs reorder</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by product or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Inventory Grid */}
        {!loading && filteredData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredData.map((item) => (
              <Card
                key={item.id}
                className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg text-white">
                        {item.productName}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-400 mt-1">
                        Supplier: <span className="font-semibold text-purple-300">{item.supplierName}</span>
                      </CardDescription>
                    </div>
                    <Badge className={`text-[9px] sm:text-[10px] ${
                      item.status === 'in-stock'
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    }`}>
                      {item.status === 'in-stock' ? '✓ In Stock' : '! Low Stock'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-purple-500/20">
                      <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Current Stock</p>
                      <p className="text-base sm:text-lg font-bold text-white mt-2">{item.stockLevel}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Min Threshold</p>
                      <p className="text-base sm:text-lg font-bold text-purple-300 mt-2">{item.minThreshold}</p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">Stock Level</p>
                      <p className="text-xs font-semibold text-slate-300">
                        {Math.round((item.stockLevel / (item.stockLevel + item.minThreshold)) * 100)}%
                      </p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          item.status === 'in-stock'
                            ? 'from-green-500 to-green-600'
                            : 'from-orange-500 to-orange-600'
                        }`}
                        style={{
                          width: `${Math.min(100, (item.stockLevel / (item.stockLevel + item.minThreshold)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading inventory data...</p>
          </div>
        ) : (
          <Card className="border border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-purple-400/50 mb-4" />
              <p className="text-slate-400 mb-4">No inventory items found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartInventory;
