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
  async getTransactions() {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.get(API_ENDPOINTS.TRANSACTIONS, {
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

      const response = await axios.post(API_ENDPOINTS.CREATE_LINK, paymentData, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Normalize API response for UI consumption
      const api = response.data || {};
      const txn = api.transaction || {};
      const pay = api.payment || {};
      const normalized = {
        paymentLink: pay.paymentUrl || pay.url || null,
        linkId: pay.linkId || txn.linkId || null,
        orderId: txn.orderId || null,
        transactionId: txn.transactionId || null,
        amount: txn.amount ?? paymentData?.amount ?? null,
        currency: txn.currency || 'INR',
        status: txn.status || 'created',
        customerName: txn.customerName || paymentData?.customerName || null,
        merchantName: txn.merchantName || null,
        createdAt: txn.createdAt || null,
        qrCode: pay.qrCode || null,
        expiresAt: pay.expiresAt || null,
        message: api.message || 'Payment link created successfully',
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
