import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import authService from './authService';

class SuperadminPaymentService {
  async getAdminTransactions(filters = {}) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching admin transactions from:', API_ENDPOINTS.ADMIN_TRANSACTIONS);
      console.log('Using token:', token.substring(0, 20) + '...');

      const response = await axios.get(API_ENDPOINTS.ADMIN_TRANSACTIONS, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          merchantId: filters.merchantId || undefined,
          merchantName: filters.merchantName || undefined,
          status: filters.status || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
        }
      });

      console.log('Admin transactions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin transactions error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden. You do not have permission to access admin transactions.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch admin transactions');
      }
    }
  }

  async createAdminPayout(payoutData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Creating admin payout:', payoutData);
      console.log('Payout endpoint:', API_ENDPOINTS.ADMIN_PAYOUT);

      const response = await axios.post(API_ENDPOINTS.ADMIN_PAYOUT, payoutData, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Admin payout response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin payout error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden. You do not have permission to create admin payouts.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid payout data. Please check all fields.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to create admin payout');
      }
    }
  }

  async updateAdminPayoutStatus(payoutId, action) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!payoutId || !['approve', 'reject'].includes(action)) {
        throw new Error('Invalid payout action');
      }

      const url = `${API_ENDPOINTS.ADMIN_PAYOUTS}/${payoutId}/${action}`;
      const response = await axios.post(url, {}, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Admin payout status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update payout status');
    }
  }

  async getAdminPayouts() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching admin payouts from:', API_ENDPOINTS.ADMIN_PAYOUTS);
      console.log('Using token:', token.substring(0, 20) + '...');

      const response = await axios.get(API_ENDPOINTS.ADMIN_PAYOUTS, {
        headers: {
          'x-auth-token': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Admin payouts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin payouts error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden. You do not have permission to access admin payouts.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch admin payouts');
      }
    }
  }
}

export default new SuperadminPaymentService();
