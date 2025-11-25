import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Copy,
  LogOut,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { autoReplyService } from '@/lib/automationService';

const AutoReplyManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'general',
    message: '',
  });

  // Load auto-replies on component mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadReplies();
  }, [token, navigate]);

  const loadReplies = async () => {
    setLoading(true);
    try {
      const data = await autoReplyService.getAll(token!);
      setReplies(data || []);
    } catch (error: any) {
      console.error('Failed to load auto-replies:', error);
      
      // Check if it's a 401 Unauthorized error
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        console.warn('❌ 401 Unauthorized - Session expired');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please login again.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      // Use demo data if API fails
      setReplies([
        {
          id: '1',
          name: 'General Inquiry',
          trigger: 'general',
          message: 'Thank you for your inquiry. We have received your message and will respond within 24 hours.',
          usage: 145,
          status: 'active',
        },
        {
          id: '2',
          name: 'Pricing Question',
          trigger: 'pricing',
          message: 'Thank you for your interest. Our pricing is competitive and customizable based on quantity. Please contact our sales team for a detailed quote.',
          usage: 89,
          status: 'active',
        },
        {
          id: '3',
          name: 'MOQ Information',
          trigger: 'moq',
          message: 'Our Minimum Order Quantity (MOQ) is flexible and depends on the product. Please specify your product of interest for detailed MOQ information.',
          usage: 156,
          status: 'active',
        },
        {
          id: '4',
          name: 'Bulk Order',
          trigger: 'bulk',
          message: 'Thank you for your bulk order inquiry. Our team specializes in large-scale orders with special discounts. A dedicated account manager will contact you shortly.',
          usage: 234,
          status: 'active',
        },
      ]);
      toast({
        title: 'Info',
        description: 'Showing demo data. Backend not connected.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReplies = replies.filter(
    (reply) =>
      reply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reply.trigger.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (reply?: (typeof replies)[0]) => {
    if (reply) {
      setEditingId(reply.id);
      setFormData({
        name: reply.name,
        trigger: reply.trigger,
        message: reply.message,
      });
    } else {
      setFormData({ name: '', trigger: 'general', message: '' });
      setEditingId(null);
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing reply
        await autoReplyService.update(token!, editingId, formData);
        setReplies(
          replies.map((r) =>
            r.id === editingId
              ? { ...r, ...formData }
              : r
          )
        );
        toast({
          title: 'Success',
          description: 'Auto-reply updated successfully',
        });
      } else {
        // Create new reply
        const newReply = await autoReplyService.create(token!, {
          ...formData,
          usage: 0,
          status: 'active',
        });
        setReplies([...replies, newReply]);
        toast({
          title: 'Success',
          description: 'Auto-reply created successfully',
        });
      }
      setShowDialog(false);
    } catch (error: any) {
      console.error('Failed to save auto-reply:', error);
      
      // Check if it's a 401 Unauthorized error
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        console.warn('❌ 401 Unauthorized - Session expired');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please login again.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      toast({
        title: 'Error',
        description: 'Failed to save auto-reply',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this auto-reply?')) {
      try {
        await autoReplyService.delete(token!, id);
        setReplies(replies.filter((r) => r.id !== id));
        toast({
          title: 'Deleted',
          description: 'Auto-reply removed successfully',
        });
      } catch (error) {
        console.error('Failed to delete auto-reply:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete auto-reply',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDuplicate = async (reply: (typeof replies)[0]) => {
    try {
      const newReply = await autoReplyService.create(token!, {
        ...reply,
        name: `${reply.name} (Copy)`,
        usage: 0,
        status: 'active',
      });
      setReplies([...replies, newReply]);
      toast({
        title: 'Duplicated',
        description: 'Auto-reply duplicated successfully',
      });
    } catch (error) {
      console.error('Failed to duplicate auto-reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate auto-reply',
        variant: 'destructive',
      });
    }
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Auto-Reply Manager</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Manage automated responses</p>
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
        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search auto-replies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Auto-Reply</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Auto-Replies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredReplies.map((reply) => (
            <Card
              key={reply.id}
              className="border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl"
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg text-white">
                      {reply.name}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-400 mt-1">
                      Trigger: <span className="font-semibold text-purple-300">{reply.trigger}</span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[9px] sm:text-[10px]">
                    {reply.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-purple-500/20">
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3">
                    {reply.message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="text-slate-400">
                    <span className="font-semibold text-purple-300">{reply.usage}</span> uses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 sm:h-9 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      onClick={() => handleDuplicate(reply)}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 sm:h-9 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      onClick={() => handleOpenDialog(reply)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 sm:h-9 border-red-500/30 text-red-300 hover:bg-red-500/20"
                      onClick={() => handleDelete(reply.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReplies.length === 0 && (
          <Card className="border border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-purple-400/50 mb-4" />
              <p className="text-slate-400 mb-4">No auto-replies found</p>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
              >
                Create First Auto-Reply
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialog for Create/Edit */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="border-purple-500/20 bg-gradient-to-br from-[#2d1b3d] to-[#1f1529] backdrop-blur-xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? 'Edit Auto-Reply' : 'Create New Auto-Reply'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingId ? 'Update your auto-reply settings' : 'Set up a new automated response'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  Reply Name *
                </label>
                <Input
                  placeholder="e.g., General Inquiry"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-slate-500"
                />
              </div>

            <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  Trigger Type *
                </label>
                <div className="relative z-50">
                  <select
                    value={formData.trigger}
                    onChange={(e) =>
                      setFormData({ ...formData, trigger: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-purple-500/50 focus:outline-none focus:border-purple-500"
                  >
                    <option value="general" className="bg-slate-900 text-white">General Inquiry</option>
                    <option value="pricing" className="bg-slate-900 text-white">Pricing Question</option>
                    <option value="moq" className="bg-slate-900 text-white">MOQ Information</option>
                    <option value="bulk" className="bg-slate-900 text-white">Bulk Order</option>
                    <option value="technical" className="bg-slate-900 text-white">Technical Support</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  Message *
                </label>
                <Textarea
                  placeholder="Enter your auto-reply message..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-slate-500 resize-none h-32"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white"
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AutoReplyManager;
