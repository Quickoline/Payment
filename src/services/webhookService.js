import axios from 'axios';
import { BASE_URL } from '../constants/api';
import authService from './authService';

class WebhookService {
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
      const apiKeyData = await import('./apiKeyService').then(module => module.default.getApiKey());
      return apiKeyData;
    } catch (error) {
      throw new Error('API key required for this operation. Please create an API key first.');
    }
  }

  // Get all webhooks for the merchant
  async getWebhooks() {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.get(`${BASE_URL}/webhooks`, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle different response structures
      const data = response.data;
      if (Array.isArray(data)) {
        return { webhooks: data };
      } else if (data.webhooks && Array.isArray(data.webhooks)) {
        return data;
      } else if (data.success && data.webhooks) {
        return data;
      } else {
        // Return empty array if no webhooks found
        return { webhooks: [] };
      }
    } catch (error) {
      console.error('Webhooks fetch error:', error);
      // If webhook endpoint doesn't exist yet, return empty array
      if (error.response?.status === 404) {
        return { webhooks: [] };
      }
      throw new Error(this.getApiErrorMessage(error, 'Failed to fetch webhooks'));
    }
  }

  // Create a new webhook
  async createWebhook(webhookData) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.post(`${BASE_URL}/webhooks`, webhookData, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Webhook creation error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to create webhook'));
    }
  }

  // Update an existing webhook
  async updateWebhook(webhookId, webhookData) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.put(`${BASE_URL}/webhooks/${webhookId}`, webhookData, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Webhook update error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to update webhook'));
    }
  }

  // Delete a webhook
  async deleteWebhook(webhookId) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.delete(`${BASE_URL}/webhooks/${webhookId}`, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Webhook deletion error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to delete webhook'));
    }
  }

  // Toggle webhook status (activate/deactivate)
  async toggleWebhookStatus(webhookId, isActive) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.patch(`${BASE_URL}/webhooks/${webhookId}/status`, {
        isActive
      }, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Webhook status toggle error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to update webhook status'));
    }
  }

  // Test webhook (send a test notification)
  async testWebhook(webhookId) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.post(`${BASE_URL}/webhooks/${webhookId}/test`, {}, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Webhook test error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to test webhook'));
    }
  }

  // Get webhook events (for testing/verification)
  async getWebhookEvents(webhookId) {
    try {
      const apiKeyData = await this.getApiKey();
      const apiKey = apiKeyData.apiKey || apiKeyData.key;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await axios.get(`${BASE_URL}/webhooks/${webhookId}/events`, {
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Webhook events fetch error:', error);
      throw new Error(this.getApiErrorMessage(error, 'Failed to fetch webhook events'));
    }
  }
}

export default new WebhookService();
