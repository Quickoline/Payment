import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import authService from './authService';
import apiKeyService from './apiKeyService';

class PaymentService {
  // Safely extract a clear error message from axios error responses
  getApiErrorMessage(error, fallback) {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
    return (
      data?.error ||
      data?.message ||
      error?.message ||
      fallback
    );
  }

  // Get API key for authorization
  async getApiKey() {
    try {
      return await apiKeyService.getApiKey();
    } catch (error) {
      throw new Error('API key required for this operation. Please create an API key first.');
    }
  }

  // Transactions Section - requires API key authorization
  async getTransactions(filters = {}) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.payment_gateway) params.append('payment_gateway', filters.payment_gateway);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const url = `${API_ENDPOINTS.TRANSACTIONS}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Transactions fetch error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to fetch transactions'));
    }
  }

  // Payout Section - requires admin authorization (JWT)
  async getPayouts() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(API_ENDPOINTS.PAYOUTS, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Payouts fetch error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to fetch payouts'));
    }
  }

  // Payin Section - requires JWT authorization
  async getBalance() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(API_ENDPOINTS.BALANCE, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Normalize API response to a frontend-friendly shape
      const api = response.data || {};
      const bal = api.balance || {};
      const normalized = {
        // Commonly displayed top-level values expected by the UI
        availableBalance: bal.available_balance ?? bal.availableBalance ?? '0.00',
        pendingBalance: bal.pending_payouts ?? bal.pendingBalance ?? '0.00',
        totalBalance: bal.total_revenue ?? bal.totalBalance ?? '0.00',

        // Additional useful fields preserved
        commissionDeducted: bal.commission_deducted ?? null,
        commissionRate: bal.commission_rate ?? null,
        netRevenue: bal.net_revenue ?? null,
        totalPaidOut: bal.total_paid_out ?? null,

        // Pass-through sections for detailed views if needed
        transactionSummary: api.transaction_summary || {},
        payoutEligibility: api.payout_eligibility || {},
        merchant: api.merchant || {},

        // Keep raw in case pages need exact backend fields
        raw: api,
      };

      return normalized;
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to fetch balance'));
    }
  }

  // Create Payment Link - requires API key + body data
  async createPaymentLink(paymentData) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Transform frontend data to match API specification
      const requestBody = {
        amount: paymentData.amount.toString(),
        customer_name: paymentData.customerName,
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.customerPhone,
        description: paymentData.description || 'Product purchase'
      };

      const response = await axios.post(API_ENDPOINTS.CREATE_LINK, requestBody, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Normalize API response for UI consumption
      const api = response.data || {};
      const normalized = {
        paymentLink: api.payment_url || null,
        linkId: api.payment_link_id || null,
        orderId: api.transaction_id || null,
        transactionId: api.transaction_id || null,
        amount: api.order_amount || paymentData?.amount || null,
        currency: api.order_currency || 'INR',
        status: 'created',
        customerName: paymentData?.customerName || null,
        merchantName: api.merchant_name || null,
        merchantId: api.merchant_id || null,
        referenceId: api.reference_id || null,
        createdAt: new Date().toISOString(),
        qrCode: null, // Not provided in this API
        expiresAt: api.expires_at ? new Date(api.expires_at * 1000).toISOString() : null,
        message: api.message || 'Payment link created successfully',
        success: api.success || false,
        // Preserve raw for any advanced views
        raw: api,
      };

      return normalized;
    } catch (error) {
      console.error('Payment link creation error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to create payment link'));
    }
  }

  // Get Payment Status - requires API key + order ID
  async getPaymentStatus(orderId) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.get(API_ENDPOINTS.PAYMENT_STATUS(orderId), {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Payment status fetch error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to fetch payment status'));
    }
  }

  // Refund Payment - requires API key + order ID + refund data
  async refundPayment(orderId, refundData) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.post(API_ENDPOINTS.REFUND(orderId), refundData, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to process refund'));
    }
  }

  // Request Payout - requires admin token + payout data
  async requestPayout(payoutData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(API_ENDPOINTS.PAYOUT_REQUEST, payoutData, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Payout request error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to request payout'));
    }
  }
}

export default new PaymentService();
