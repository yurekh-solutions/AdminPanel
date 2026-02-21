import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import ScrollToTop from './components/ScrollToTop';

// Admin Pages
import {
  AdminLogin,
  AdminDashboard,
  BusinessAutomationSuite,
  AutoReplyManager,
  LeadScoringAdmin,
  OrderAutomation,
  PerformanceAnalytics,
  SmartInventory,
  PriceOptimizer,
  DeletionRequestManager,
} from './pages';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="admin-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/automation" element={<BusinessAutomationSuite />} />
            <Route path="/dashboard/automation/auto-reply" element={<AutoReplyManager />} />
            <Route path="/dashboard/automation/lead-scoring" element={<LeadScoringAdmin />} />
            <Route path="/dashboard/automation/order-automation" element={<OrderAutomation />} />
            <Route path="/dashboard/automation/analytics" element={<PerformanceAnalytics />} />
            <Route path="/dashboard/automation/inventory" element={<SmartInventory />} />
            <Route path="/dashboard/automation/pricing" element={<PriceOptimizer />} />
            <Route path="/dashboard/gdpr-requests" element={<DeletionRequestManager />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
