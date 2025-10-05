import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import apiKeyService from '../services/apiKeyService';
import Navbar from './Navbar';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);


  // Check for existing API key on component mount
  useEffect(() => {
    checkExistingApiKey();
  }, []);

  const checkExistingApiKey = async () => {
    setFetching(true);
    setError('');
    
    try {
      const result = await apiKeyService.getApiKey();
      console.log('API key result:', result);
      
      // Handle different possible response structures
      const apiKeyValue = result?.apiKey || result?.key || result?.data?.apiKey || result?.data?.key || result;
      
      if (apiKeyValue && typeof apiKeyValue === 'string' && apiKeyValue.length > 0) {
        setApiKey(apiKeyValue);
        setHasApiKey(true);
        setSuccess('Existing API key loaded successfully!');
      } else {
        setError('No API key found in response. You may need to create one first.');
        setHasApiKey(false);
      }
    } catch (error) {
      // Handle different error cases
      if (error.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        // Optionally redirect to login
        setTimeout(() => {
          authService.logout();
          navigate('/login');
        }, 2000);
      } else if (error.message.includes('Forbidden')) {
        setError('You do not have permission to access API keys.');
        setHasApiKey(false);
      } else {
        setError(error.message);
        setHasApiKey(false);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleCreateApiKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiKeyService.createApiKey();
      console.log('Create API key result:', result);
      
      // Handle different possible response structures
      const apiKeyValue = result?.apiKey || result?.key || result?.data?.apiKey || result?.data?.key || result;
      
      if (apiKeyValue && typeof apiKeyValue === 'string' && apiKeyValue.length > 0) {
        setApiKey(apiKeyValue);
        setHasApiKey(true);
        setSuccess('API key created successfully! You can only create one API key.');
      } else {
        setApiKey('API Key created successfully');
        setHasApiKey(true);
        setSuccess('API key created successfully! You can only create one API key.');
      }
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('already created')) {
        setError('You have already created an API key. Use the "Get API Key" button to retrieve it.');
        setHasApiKey(true);
      } else if (error.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          authService.logout();
          navigate('/login');
        }, 2000);
      } else if (error.message.includes('Forbidden')) {
        setError('You do not have permission to create API keys.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setSuccess('API key copied to clipboard!');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="page-main">
        <div className="page-header">
          <h1>🏠 Admin Dashboard</h1>
          <p>Welcome to your admin dashboard. Manage API keys and access all payment features.</p>
        </div>
        
        <div className="page-content">
          {/* API Key Management Section */}
          <div className="api-key-section">
            <h2>API Key Management</h2>
            <p>Create and manage your API keys for accessing the backend services.</p>
            
            {fetching && (
              <div className="loading-message">
                Checking for existing API key...
              </div>
            )}
            
            <div className="api-key-form">
              {!hasApiKey ? (
                <button 
                  onClick={handleCreateApiKey} 
                  disabled={loading || fetching}
                  className="create-api-key-btn"
                >
                  {loading ? 'Creating...' : 'Create New API Key'}
                </button>
              ) : (
                <div className="api-key-actions">
                  <button 
                    onClick={checkExistingApiKey} 
                    disabled={fetching}
                    className="get-api-key-btn"
                  >
                    {fetching ? 'Loading...' : 'Get API Key'}
                  </button>
                  <p className="api-key-info">
                    ✅ You have already created an API key. Use the button above to retrieve it.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            {apiKey && (
              <div className="api-key-display">
                <h3>Your API Key:</h3>
                <div className="api-key-container">
                  <input 
                    type="text" 
                    value={apiKey} 
                    readOnly 
                    className="api-key-input"
                  />
                  <button onClick={copyToClipboard} className="copy-btn">
                    Copy
                  </button>
                </div>
                <p className="api-key-warning">
                  ⚠️ Keep this API key secure and don't share it publicly.
                </p>
              </div>
            )}
          </div>

          {/* Quick Access Cards */}
          <div className="quick-access">
            <h2>Quick Access</h2>
            <p>Navigate to different sections of the payment system.</p>
            
            <div className="access-grid">
              <div className="access-card" onClick={() => navigate('/admin/transactions')}>
                <div className="access-icon">📊</div>
                <h3>Transactions</h3>
                <p>View and manage all payment transactions</p>
              </div>
              
              <div className="access-card" onClick={() => navigate('/admin/payouts')}>
                <div className="access-icon">💰</div>
                <h3>Payouts</h3>
                <p>Manage payout requests and history</p>
              </div>
              
              <div className="access-card" onClick={() => navigate('/admin/payins')}>
                <div className="access-icon">💳</div>
                <h3>Payins</h3>
                <p>View account balance and financial overview</p>
              </div>
              
              <div className="access-card" onClick={() => navigate('/admin/payments')}>
                <div className="access-icon">🔗</div>
                <h3>Payments</h3>
                <p>Create and manage payment links</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
