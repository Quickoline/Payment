import React, { useState, useEffect } from 'react';
import { FiLink, FiCopy, FiCheck, FiPlus, FiTrash2, FiEdit, FiPlay } from 'react-icons/fi';
import Sidebar from '../Sidebar';
import webhookService from '../../services/webhookService';
import './PageLayout.css';
import Toast from '../ui/Toast';

const WebhookPage = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [webhookData, setWebhookData] = useState({
    name: '',
    url: '',
    events: [],
    secret: '',
    isActive: true
  });
  const [editingWebhook, setEditingWebhook] = useState(null);

  const webhookEvents = [
    { id: 'payment.success', label: 'Payment Success', description: 'Triggered when a payment is successful' },
    { id: 'payment.failed', label: 'Payment Failed', description: 'Triggered when a payment fails' },
    { id: 'payment.captured', label: 'Payment Captured', description: 'Triggered when a payment is captured' },
    { id: 'payment.refunded', label: 'Payment Refunded', description: 'Triggered when a payment is refunded' },
    { id: 'payout.processed', label: 'Payout Processed', description: 'Triggered when a payout is processed' },
    { id: 'payout.failed', label: 'Payout Failed', description: 'Triggered when a payout fails' },
    { id: 'payment_link.paid', label: 'Payment Link Paid', description: 'Triggered when a payment link is paid' },
    { id: 'payment_link.cancelled', label: 'Payment Link Cancelled', description: 'Triggered when a payment link is cancelled' },
    { id: 'payment_link.expired', label: 'Payment Link Expired', description: 'Triggered when a payment link expires' }
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const response = await webhookService.getWebhooks();
      // Ensure we always have an array
      const webhooksArray = Array.isArray(response) 
        ? response 
        : (response.webhooks || []);
      setWebhooks(webhooksArray);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setError('Failed to fetch webhooks');
      setToast({ message: 'Failed to fetch webhooks', type: 'error' });
      // Set empty array as fallback
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'events') {
      setWebhookData(prev => ({
        ...prev,
        events: value
      }));
    } else {
      setWebhookData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleEventToggle = (eventId) => {
    setWebhookData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!webhookData.name || !webhookData.url || webhookData.events.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      // Validate URL format
      try {
        new URL(webhookData.url);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      const webhookPayload = {
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        secret: webhookData.secret || undefined, // Let backend generate if empty
        isActive: webhookData.isActive
      };

      let result;
      if (editingWebhook) {
        result = await webhookService.updateWebhook(editingWebhook.id, webhookPayload);
        setSuccess('Webhook updated successfully!');
        setToast({ message: 'Webhook updated successfully!', type: 'success' });
      } else {
        result = await webhookService.createWebhook(webhookPayload);
        setSuccess('Webhook created successfully!');
        setToast({ message: 'Webhook created successfully!', type: 'success' });
      }

      // Refresh the webhooks list
      await fetchWebhooks();

      setWebhookData({
        name: '',
        url: '',
        events: [],
        secret: '',
        isActive: true
      });
      setShowAddForm(false);
      setEditingWebhook(null);
    } catch (error) {
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (webhook) => {
    setWebhookData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.isActive
    });
    setEditingWebhook(webhook);
    setShowAddForm(true);
  };

  const handleDelete = async (webhookId) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        await webhookService.deleteWebhook(webhookId);
        setSuccess('Webhook deleted successfully!');
        setToast({ message: 'Webhook deleted successfully!', type: 'success' });
        // Refresh the webhooks list
        await fetchWebhooks();
      } catch (error) {
        setError('Failed to delete webhook');
        setToast({ message: 'Failed to delete webhook', type: 'error' });
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard!', type: 'success' });
  };

  const toggleWebhookStatus = async (webhookId) => {
    try {
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) return;

      await webhookService.toggleWebhookStatus(webhookId, !webhook.isActive);
      setSuccess('Webhook status updated!');
      setToast({ message: 'Webhook status updated!', type: 'success' });
      // Refresh the webhooks list
      await fetchWebhooks();
    } catch (error) {
      setError('Failed to update webhook status');
      setToast({ message: 'Failed to update webhook status', type: 'error' });
    }
  };

  const testWebhook = async (webhookId) => {
    try {
      await webhookService.testWebhook(webhookId);
      setSuccess('Test webhook sent successfully!');
      setToast({ message: 'Test webhook sent successfully!', type: 'success' });
    } catch (error) {
      setError('Failed to send test webhook');
      setToast({ message: 'Failed to send test webhook', type: 'error' });
    }
  };

  return (
    <div className="page-container with-sidebar">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <h1>Webhook Management</h1>
          <p>Configure webhooks to receive real-time notifications about payment events</p>
          <div className="webhook-info">
            <div className="info-card">
              <h4>🔗 Razorpay Webhook URL</h4>
              <p>Configure this URL in your Razorpay Dashboard:</p>
              <div className="url-display">
                <code>https://api.ninex-group.com/api/razorpay/webhook</code>
                <button 
                  onClick={() => copyToClipboard('https://api.ninex-group.com/api/razorpay/webhook')}
                  className="copy-btn small"
                  title="Copy Razorpay webhook URL"
                >
                  <FiCopy />
                </button>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="primary-btn"
            >
              <FiPlus className="icon" />
              {showAddForm ? 'Cancel' : 'Add Webhook'}
            </button>
          </div>
        </div>
        
        <div className="page-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {showAddForm && (
            <div className="webhook-form-card">
              <h3>{editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}</h3>
              <form onSubmit={handleSubmit} className="webhook-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Webhook Name *</label>
                    <input
                      type="text"
                      value={webhookData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="e.g., Payment Success Webhook"
                    />
                  </div>
                  <div className="form-group">
                    <label>Webhook URL *</label>
                    <input
                      type="url"
                      value={webhookData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      required
                      placeholder="https://yourdomain.com/webhook/payment"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Webhook Secret</label>
                  <div className="secret-input-container">
                    <input
                      type="text"
                      value={webhookData.secret}
                      onChange={(e) => handleInputChange('secret', e.target.value)}
                      placeholder="Leave empty to auto-generate"
                    />
                    <button 
                      type="button" 
                      onClick={() => copyToClipboard(webhookData.secret)}
                      className="copy-btn"
                      disabled={!webhookData.secret}
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Events to Subscribe *</label>
                  <div className="events-grid">
                    {webhookEvents.map(event => (
                      <div key={event.id} className="event-option">
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={webhookData.events.includes(event.id)}
                            onChange={() => handleEventToggle(event.id)}
                          />
                          <span className="checkmark"></span>
                          <div className="event-info">
                            <div className="event-label">{event.label}</div>
                            <div className="event-description">{event.description}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={webhookData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Active (Webhook will receive notifications)
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingWebhook(null);
                      setWebhookData({
                        name: '',
                        url: '',
                        events: [],
                        secret: '',
                        isActive: true
                      });
                    }} 
                    className="secondary-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="primary-btn">
                    {loading ? 'Saving...' : (editingWebhook ? 'Update Webhook' : 'Create Webhook')}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading webhooks...</p>
            </div>
          ) : (
            <div className="webhooks-container">
              {Array.isArray(webhooks) && webhooks.length > 0 ? (
                <div className="webhooks-grid">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="webhook-card">
                      <div className="webhook-header">
                        <div className="webhook-title">
                          <FiLink className="webhook-icon" />
                          <h4>{webhook.name}</h4>
                          <span className={`status-badge ${webhook.isActive ? 'active' : 'inactive'}`}>
                            {webhook.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="webhook-actions">
                          <button 
                            onClick={() => testWebhook(webhook.id)}
                            className="action-btn test"
                            title="Test webhook"
                          >
                            <FiPlay />
                          </button>
                          <button 
                            onClick={() => handleEdit(webhook)}
                            className="action-btn edit"
                            title="Edit webhook"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            onClick={() => toggleWebhookStatus(webhook.id)}
                            className={`action-btn toggle ${webhook.isActive ? 'deactivate' : 'activate'}`}
                            title={webhook.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {webhook.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button 
                            onClick={() => handleDelete(webhook.id)}
                            className="action-btn delete"
                            title="Delete webhook"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      
                      <div className="webhook-body">
                        <div className="webhook-detail">
                          <label>URL:</label>
                          <div className="url-container">
                            <span className="url-text">{webhook.url}</span>
                            <button 
                              onClick={() => copyToClipboard(webhook.url)}
                              className="copy-btn small"
                            >
                              <FiCopy />
                            </button>
                          </div>
                        </div>
                        
                        <div className="webhook-detail">
                          <label>Secret:</label>
                          <div className="secret-container">
                            <span className="secret-text">
                              {webhook.secret.substring(0, 8)}...
                            </span>
                            <button 
                              onClick={() => copyToClipboard(webhook.secret)}
                              className="copy-btn small"
                            >
                              <FiCopy />
                            </button>
                          </div>
                        </div>

                        <div className="webhook-detail">
                          <label>Events:</label>
                          <div className="events-list">
                            {webhook.events.map(eventId => {
                              const event = webhookEvents.find(e => e.id === eventId);
                              return (
                                <span key={eventId} className="event-tag">
                                  {event ? event.label : eventId}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {webhook.lastTriggered && (
                          <div className="webhook-detail">
                            <label>Last Triggered:</label>
                            <span className="timestamp">
                              {new Date(webhook.lastTriggered).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><FiLink /></div>
                  <h3>No Webhooks Found</h3>
                  <p>Create your first webhook to start receiving payment notifications.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default WebhookPage;
