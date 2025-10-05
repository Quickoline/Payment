import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import './PaymentSection.css';

const PayoutSection = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
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
      const payoutData = {
        amount: parseFloat(requestData.amount),
        transferMode: requestData.transferMode,
        beneficiaryDetails: {
          upiId: requestData.beneficiaryDetails.upiId
        },
        notes: requestData.notes
      };
      
      const result = await paymentService.requestPayout(payoutData);
      setError('');
      setShowRequestForm(false);
      setRequestData({
        amount: '',
        transferMode: 'upi',
        beneficiaryDetails: { upiId: '' },
        notes: ''
      });
      fetchPayouts(); // Refresh the list
    } catch (error) {
      setError(error.message);
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
    <div className="payment-section">
      <div className="section-header">
        <h3>💰 Payouts</h3>
        <div className="section-actions">
          <button onClick={fetchPayouts} disabled={loading} className="refresh-btn">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={() => setShowRequestForm(!showRequestForm)} className="request-btn">
            {showRequestForm ? 'Cancel' : 'Request Payout'}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showRequestForm && (
        <div className="request-form">
          <h4>Request New Payout</h4>
          <form onSubmit={handleRequestPayout}>
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
              <button type="button" onClick={() => setShowRequestForm(false)}>
                Cancel
              </button>
              <button type="submit" disabled={requestLoading}>
                {requestLoading ? 'Processing...' : 'Request Payout'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading-state">Loading payouts...</div>
      ) : (
        <div className="payouts-list">
          {payouts.length > 0 ? (
            payouts.map((payout, index) => (
              <div key={index} className="payout-item">
                <div className="payout-info">
                  <div className="payout-id">ID: {payout.id || `PAYOUT-${index + 1}`}</div>
                  <div className="payout-amount">₹{payout.amount || '0.00'}</div>
                  <div className="payout-status">{payout.status || 'Pending'}</div>
                </div>
                <div className="payout-details">
                  <div className="transfer-mode">{payout.transferMode || 'UPI'}</div>
                  <div className="payout-date">{payout.createdAt || new Date().toLocaleDateString()}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p>No payouts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayoutSection;
