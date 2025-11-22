const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Automation Service
 * Handles all automation-related API calls for the admin panel
 */

interface AutoReply {
  id: string;
  name: string;
  trigger: string;
  message: string;
  usage?: number;
  status: string;
}

interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  score: number;
  status: 'hot' | 'warm' | 'cold';
  potential: string;
}

interface Order {
  id: string;
  supplier: string;
  product: string;
  status: 'pending' | 'processing' | 'processed' | 'fulfilled';
  autoProcessed: boolean;
  automationScore: number;
}

interface AutomationStats {
  autoReplies: number;
  leadScores: number;
  ordersProcessed: number;
  emailsSent: number;
  responseTime: string;
  conversionRate: string;
}

/**
 * Get automation statistics
 */
export const getAutomationStats = async (token: string): Promise<AutomationStats> => {
  try {
    const response = await fetch(`${API_URL}/admin/automation/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch automation stats');
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    throw error;
  }
};

/**
 * Auto-Reply Management
 */
export const autoReplyService = {
  /**
   * Create new auto-reply
   */
  create: async (token: string, reply: Omit<AutoReply, 'id'>): Promise<AutoReply> => {
    const response = await fetch(`${API_URL}/admin/automation/auto-replies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reply),
    });

    if (!response.ok) {
      throw new Error('Failed to create auto-reply');
    }

    return response.json();
  },

  /**
   * Update auto-reply
   */
  update: async (token: string, id: string, reply: Partial<AutoReply>): Promise<AutoReply> => {
    const response = await fetch(`${API_URL}/admin/automation/auto-replies/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reply),
    });

    if (!response.ok) {
      throw new Error('Failed to update auto-reply');
    }

    return response.json();
  },

  /**
   * Delete auto-reply
   */
  delete: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/admin/automation/auto-replies/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete auto-reply');
    }
  },

  /**
   * Get all auto-replies
   */
  getAll: async (token: string): Promise<AutoReply[]> => {
    const response = await fetch(`${API_URL}/admin/automation/auto-replies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch auto-replies');
    }

    const data = await response.json();
    return data.data || [];
  },
};

/**
 * Lead Scoring Management
 */
export const leadScoringService = {
  /**
   * Get all leads with scores
   */
  getLeads: async (token: string): Promise<Lead[]> => {
    const response = await fetch(`${API_URL}/admin/automation/leads`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }

    const data = await response.json();
    return data.data || [];
  },

  /**
   * Get lead by ID
   */
  getLead: async (token: string, id: string): Promise<Lead> => {
    const response = await fetch(`${API_URL}/admin/automation/leads/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lead');
    }

    return response.json();
  },

  /**
   * Assign lead to sales team
   */
  assignToSales: async (token: string, leadId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/admin/automation/leads/${leadId}/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to assign lead');
    }
  },

  /**
   * Re-score lead
   */
  rescore: async (token: string, leadId: string): Promise<number> => {
    const response = await fetch(`${API_URL}/admin/automation/leads/${leadId}/rescore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to rescore lead');
    }

    const data = await response.json();
    return data.score || 0;
  },
};

/**
 * Order Automation Management
 */
export const orderAutomationService = {
  /**
   * Get all orders
   */
  getOrders: async (token: string, filter?: string): Promise<Order[]> => {
    const url = filter
      ? `${API_URL}/admin/automation/orders?status=${filter}`
      : `${API_URL}/admin/automation/orders`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    return data.data || [];
  },

  /**
   * Auto-process order
   */
  autoProcess: async (token: string, orderId: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/admin/automation/orders/${orderId}/auto-process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to auto-process order');
    }

    return response.json();
  },

  /**
   * Get order details
   */
  getOrder: async (token: string, id: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/admin/automation/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return response.json();
  },

  /**
   * Update order status
   */
  updateStatus: async (token: string, id: string, status: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/admin/automation/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return response.json();
  },
};

/**
 * Email Campaign Management
 */
export const emailCampaignService = {
  /**
   * Send email campaign
   */
  sendCampaign: async (
    token: string,
    recipients: string[],
    subject: string,
    body: string
  ): Promise<{ success: boolean; sentCount: number }> => {
    const response = await fetch(`${API_URL}/admin/automation/email-campaign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients, subject, body }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email campaign');
    }

    return response.json();
  },

  /**
   * Get campaign templates
   */
  getTemplates: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/admin/automation/email-templates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch email templates');
    }

    const data = await response.json();
    return data.data || [];
  },

  /**
   * Create email template
   */
  createTemplate: async (
    token: string,
    name: string,
    subject: string,
    body: string
  ): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/automation/email-templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, subject, body }),
    });

    if (!response.ok) {
      throw new Error('Failed to create email template');
    }

    return response.json();
  },
};

/**
 * Analytics Service
 */
export const analyticsService = {
  /**
   * Get automation metrics
   */
  getMetrics: async (token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/automation/metrics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    return response.json();
  },

  /**
   * Get performance report
   */
  getPerformanceReport: async (token: string, period: string = 'month'): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/automation/performance?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch performance report');
    }

    return response.json();
  },

  /**
   * Get system health
   */
  getSystemHealth: async (token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/automation/health`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch system health');
    }

    return response.json();
  },
};

export default {
  getAutomationStats,
  autoReplyService,
  leadScoringService,
  orderAutomationService,
  emailCampaignService,
  analyticsService,
};
