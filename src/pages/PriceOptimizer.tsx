import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  LogOut,
  ArrowLeft,
  Search,
  DollarSign,
  PercentSquare,
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
import { priceOptimizerService } from '@/lib/automationService';

const PriceOptimizer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [pricingData, setPricingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadPricing();
  }, [token, navigate]);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const data = await priceOptimizerService.getPricing(token!);
      setPricingData(data || []);
    } catch (error: any) {
      console.error('Failed to load pricing data:', error);

      if (error?.message?.includes('401')) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }

      toast({
        title: 'Error',
        description: 'Failed to load pricing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pricingData.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgPriceChange = (pricingData.reduce((sum, item) => sum + parseFloat(item.priceChangePercentage || 0), 0) / Math.max(1, pricingData.length)).toFixed(1);
  const highDemandItems = pricingData.filter(item => item.demand > 50);
  const recommendationChanges = pricingData.filter(item => parseFloat(item.priceChangePercentage) !== 0);

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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Price Optimizer</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Dynamic pricing based on demand</p>
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
              <CardTitle className="text-sm text-purple-300">Tracked Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{pricingData.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                <TrendingUp className="w-3 h-3" />
                <span>Active pricing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-500/20 shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-300">High Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{highDemandItems.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                <span>Opportunity items</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`border shadow-xl bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl ${
            parseFloat(avgPriceChange) > 0 
              ? 'border-green-500/20' 
              : 'border-orange-500/20'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${
                parseFloat(avgPriceChange) > 0 
                  ? 'text-green-300' 
                  : 'text-orange-300'
              }`}>Avg Price Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${
                  parseFloat(avgPriceChange) > 0 
                    ? 'text-green-400' 
                    : 'text-orange-400'
                }`}>
                  {parseFloat(avgPriceChange) > 0 ? '+' : ''}{avgPriceChange}%
                </p>
                {parseFloat(avgPriceChange) > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-orange-400" />
                )}
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

        {/* Pricing Grid */}
        {!loading && filteredData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredData.map((item) => {
              const priceChange = parseFloat(item.priceChangePercentage || 0);
              const savingsPercentage = (((item.recommendedPrice - item.currentPrice) / item.currentPrice) * 100).toFixed(1);
              
              return (
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
                          {item.supplierName}
                        </CardDescription>
                      </div>
                      <Badge className={`text-[9px] sm:text-[10px] ${
                        priceChange > 0
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : priceChange < 0
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}>
                        {priceChange > 0 ? '↑' : priceChange < 0 ? '↓' : '='} {Math.abs(parseFloat(item.priceChangePercentage || 0))}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-purple-500/20">
                        <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Current Price</p>
                        <p className="text-base sm:text-lg font-bold text-white mt-2">₹{item.currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Recommended</p>
                        <p className="text-base sm:text-lg font-bold text-orange-300 mt-2">₹{item.recommendedPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-purple-500/20">
                        <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Demand Level</p>
                        <p className="text-base sm:text-lg font-bold text-white mt-2">{item.demand}%</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <p className="text-[9px] sm:text-xs text-slate-400 font-medium">Price Elasticity</p>
                        <p className="text-base sm:text-lg font-bold text-purple-300 mt-2">{item.elasticity}</p>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-300 font-medium">Potential Revenue Change</p>
                        <p className={`font-bold ${
                          parseFloat(savingsPercentage) > 0 
                            ? 'text-green-400' 
                            : 'text-blue-400'
                        }`}>
                          {parseFloat(savingsPercentage) > 0 ? '+' : ''}{savingsPercentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Last updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading pricing data...</p>
          </div>
        ) : (
          <Card className="border border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-purple-400/50 mb-4" />
              <p className="text-slate-400 mb-4">No pricing data found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PriceOptimizer;
