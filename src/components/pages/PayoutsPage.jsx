import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import Navbar from '../Navbar';
import './PageLayout.css';
import Toast from '../ui/Toast';

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [eligibility, setEligibility] = useState({ can_request_payout: true, minimum_payout_amount: 0 });
  const [requestData, setRequestData] = useState({
    amount: '',
    transferMode: 'upi',
    beneficiaryDetails: {
      upiId: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchPayouts();
    // Load payout eligibility from balance endpoint
    (async () => {
      try {
        const bal = await paymentService.getBalance();
        const pe = bal.payoutEligibility || bal.payout_eligibility || {};
        setEligibility({
          can_request_payout: pe.can_request_payout ?? true,
          minimum_payout_amount: pe.minimum_payout_amount ?? 0,
          maximum_payout_amount: pe.maximum_payout_amount,
        });
      } catch (e) {
        // Non-blocking: show toast but do not break page
        setToast({ message: e.message, type: 'error' });
      }
    })();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await paymentService.getPayouts();
      setPayouts(data.payouts || data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setError('');
    
    try {
      // Client-side guard using eligibility data
      const amt = parseFloat(requestData.amount);
      if (!eligibility.can_request_payout) {
        throw new Error('You are not eligible to request a payout at this time.');
      }
      if (Number.isFinite(eligibility.minimum_payout_amount) && amt < eligibility.minimum_payout_amount) {
        throw new Error(`Minimum payout amount is ₹${eligibility.minimum_payout_amount}.`);
      }

      const payoutData = {
        amount: amt,
        transferMode: requestData.transferMode,
        beneficiaryDetails: {
          upiId: requestData.beneficiaryDetails.upiId
        },
        notes: requestData.notes
      };
      
      const result = await paymentService.requestPayout(payoutData);
      setError('');
      setShowRequestForm(false);
      setToast({ message: 'Payout request submitted successfully.', type: 'success' });
      setRequestData({
        amount: '',
        transferMode: 'upi',
        beneficiaryDetails: { upiId: '' },
        notes: ''
      });
      fetchPayouts(); // Refresh the list
    } catch (error) {
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRequestData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRequestData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="page-main">
        <div className="page-header">
          <h1>💰 Payouts</h1>
          <p>Manage payout requests and view payout history</p>
          <div className="header-actions">
            <button onClick={fetchPayouts} disabled={loading} className="refresh-btn">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setShowRequestForm(!showRequestForm)} 
              className="primary-btn" 
              disabled={!eligibility.can_request_payout}
              title={!eligibility.can_request_payout ? 'Payouts are currently not eligible' : undefined}
           >
              {showRequestForm ? 'Cancel' : 'Request Payout'}
            </button>
          </div>
        </div>
        
        <div className="page-content">
          {error && <div className="error-message">{error}</div>}
          {!eligibility.can_request_payout && (
            <div className="error-message">Payouts are currently not eligible. Please try again later.</div>
          )}
          {Number.isFinite(eligibility.minimum_payout_amount) && eligibility.minimum_payout_amount > 0 && (
            <div className="success-message">Minimum payout amount: ₹{eligibility.minimum_payout_amount}</div>
          )}
          
          {showRequestForm && (
            <div className="request-form-card">
              <h3>Request New Payout</h3>
              <form onSubmit={handleRequestPayout} className="payout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      value={requestData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      required
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="form-group">
                    <label>Transfer Mode</label>
                    <select
                      value={requestData.transferMode}
                      onChange={(e) => handleInputChange('transferMode', e.target.value)}
                    >
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    value={requestData.beneficiaryDetails.upiId}
                    onChange={(e) => handleInputChange('beneficiaryDetails.upiId', e.target.value)}
                    required
                    placeholder="merchant@paytm"
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={requestData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Weekly payout"
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowRequestForm(false)} className="secondary-btn">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={requestLoading || !eligibility.can_request_payout}
                    className="primary-btn"
                    title={!eligibility.can_request_payout ? 'Payouts are currently not eligible' : undefined}
                  >
                    {requestLoading ? 'Processing...' : 'Request Payout'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payouts...</p>
            </div>
          ) : (
            <div className="payouts-container">
              {payouts.length > 0 ? (
                <div className="payouts-grid">
                  {payouts.map((payout, index) => (
                    <div key={index} className="payout-card">
                      <div className="payout-header">
                        <div className="payout-id">
                          ID: {payout.id || `PAYOUT-${index + 1}`}
                        </div>
                        <div className={`payout-status status-${(payout.status || 'pending').toLowerCase()}`}>
                          {payout.status || 'Pending'}
                        </div>
                      </div>
                      
                      <div className="payout-body">
                        <div className="payout-amount">
                          ₹{payout.amount || '0.00'}
                        </div>
                        <div className="payout-details">
                          <div className="detail-row">
                            <span className="detail-label">Mode:</span>
                            <span className="detail-value">{payout.transferMode || 'UPI'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{payout.createdAt || new Date().toLocaleDateString()}</span>
                          </div>
                          {payout.notes && (
                            <div className="detail-row">
                              <span className="detail-label">Notes:</span>
                              <span className="detail-value">{payout.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No Payouts Found</h3>
                  <p>No payout requests have been made yet.</p>
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

export default PayoutsPage;
