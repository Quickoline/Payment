import React, { useState, useEffect } from 'react';
import { 
  
  FiRefreshCw, 
  FiPlus, 
  FiX,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiPercent,
  FiDollarSign
} from 'react-icons/fi';
import paymentService from '../../services/paymentService';
import Sidebar from '../Sidebar';
import './PageLayout.css';
import Toast from '../ui/Toast';

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [payoutsSummary, setPayoutsSummary] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [eligibility, setEligibility] = useState({ 
    can_request_payout: true, 
    minimum_payout_amount: 500,
    maximum_payout_amount: 100000 
  });
  const [requestData, setRequestData] = useState({
    amount: '',
    transferMode: 'upi',
    beneficiaryDetails: {
      upiId: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      branchName: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchPayouts();
    loadEligibility();
  }, []);

  const loadEligibility = async () => {
    try {
      const bal = await paymentService.getBalance();
      setBalance(bal);
      const pe = bal.payoutEligibility || bal.payout_eligibility || {};
      setEligibility({
        can_request_payout: pe.can_request_payout ?? true,
        minimum_payout_amount: pe.minimum_payout_amount ?? 500,
        maximum_payout_amount: pe.maximum_payout_amount ?? 100000,
      });
    } catch (e) {
      console.error('Error loading eligibility:', e);
    }
  };

  const fetchPayouts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await paymentService.getPayouts();
      setPayouts(data.payouts || []);
      setPayoutsSummary(data.summary || null);
    } catch (error) {
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setError('');
    
    try {
      const amt = parseFloat(requestData.amount);
      
      if (!eligibility.can_request_payout) {
        throw new Error('You are not eligible to request a payout at this time.');
      }
      if (amt < eligibility.minimum_payout_amount) {
        throw new Error(`Minimum payout amount is ₹${eligibility.minimum_payout_amount}.`);
      }
      if (amt > eligibility.maximum_payout_amount) {
        throw new Error(`Maximum payout amount is ₹${eligibility.maximum_payout_amount}.`);
      }

      const payoutData = {
        amount: amt,
        transferMode: requestData.transferMode,
        beneficiaryDetails: requestData.transferMode === 'upi' 
          ? { upiId: requestData.beneficiaryDetails.upiId }
          : {
              accountNumber: requestData.beneficiaryDetails.accountNumber,
              ifscCode: requestData.beneficiaryDetails.ifscCode,
              accountHolderName: requestData.beneficiaryDetails.accountHolderName,
              bankName: requestData.beneficiaryDetails.bankName,
              branchName: requestData.beneficiaryDetails.branchName
            },
        notes: requestData.notes
      };
      
      const result = await paymentService.requestPayout(payoutData);
      setShowRequestForm(false);
      setToast({ message: 'Payout request submitted successfully!', type: 'success' });
      resetForm();
      fetchPayouts();
      loadEligibility();
    } catch (error) {
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setRequestLoading(false);
    }
  };

  const resetForm = () => {
    setRequestData({
      amount: '',
      transferMode: 'upi',
      beneficiaryDetails: {
        upiId: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
        branchName: ''
      },
      notes: ''
    });
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

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <FiCheck className="status-icon" />;
      case 'failed':
      case 'cancelled':
        return <FiX className="status-icon" />;
      case 'requested':
      case 'pending':
      case 'processing':
        return <FiClock className="status-icon" />;
      default:
        return <FiAlertCircle className="status-icon" />;
    }
  };

  return (
    <div className="page-container with-sidebar">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1> Payouts Management</h1>
            <p>Request and track your payout withdrawals</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => {
                fetchPayouts();
                loadEligibility();
              }} 
              disabled={loading} 
              className="refresh-btn"
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setShowRequestForm(!showRequestForm)} 
              className="primary-btn" 
              disabled={!eligibility.can_request_payout}
            >
              {showRequestForm ? <><FiX /> Cancel</> : <><FiPlus /> Request Payout</>}
            </button>
          </div>
        </div>
        
        <div className="page-content">
          {error && (
            <div className="error-message">
              <FiAlertCircle /> {error}
            </div>
          )}

          {/* Balance Summary Cards */}
          {balance && (
            <div className="balance-cards">
              {/* Settled Balance - Available for Payout */}
              <div className="balance-card primary">
                <div className="balance-icon">
                  <FiDollarSign />
                </div>
                <div className="balance-content">
                  <div className="balance-label">Available Balance (Settled)</div>
                  <div className="balance-amount">
                    {formatCurrency(balance.raw?.balance?.available_balance || balance.availableBalance)}
                  </div>
                  <div className="balance-description">
                    ✓ Ready to withdraw
                  </div>
                </div>
              </div>

              {/* Unsettled Balance - Locked */}
              <div className="balance-card warning">
                <div className="balance-icon">
                  <FiClock />
                </div>
                <div className="balance-content">
                  <div className="balance-label">Unsettled Balance</div>
                  <div className="balance-amount">
                    {formatCurrency(balance.raw?.balance?.unsettled_net_revenue || 0)}
                  </div>
                  <div className="balance-description">
                    ⏳ Settles tomorrow 3 PM
                  </div>
                </div>
              </div>

              {/* Pending Payouts */}
              <div className="balance-card tertiary">
                <div className="balance-icon">
                  <FiClock />
                </div>
                <div className="balance-content">
                  <div className="balance-label">Pending Payouts</div>
                  <div className="balance-amount">
                    {formatCurrency(balance.pendingBalance)}
                  </div>
                  <div className="balance-description">
                    Awaiting processing
                  </div>
                </div>
              </div>

              {/* Commission Deducted */}
              <div className="balance-card quaternary">
                <div className="balance-icon">
                  <FiPercent />
                </div>
                <div className="balance-content">
                  <div className="balance-label">Total Commission</div>
                  <div className="balance-amount">
                    {formatCurrency(balance.commissionDeducted)}
                  </div>
                  <div className="balance-description">
                    Gateway charges
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settlement Warning Banner */}
          {balance?.raw?.settlement_info?.unsettled_transactions > 0 && (
            <div className="settlement-warning-banner">
              <div className="banner-icon">
                <FiInfo />
              </div>
              <div className="banner-content">
                <strong>Settlement Notice:</strong>{' '}
                You have {formatCurrency(balance.raw.balance.unsettled_net_revenue)} in unsettled funds{' '}
                from {balance.raw.settlement_info.unsettled_transactions} transaction(s).{' '}
                These funds will be available for payout after tomorrow's 3 PM settlement.
              </div>
            </div>
          )}

          {/* Payout Summary Cards */}
          {payoutsSummary && (
            <div className="payout-summary-section">
              <h3><FiPercent /> Payout Statistics</h3>
              <div className="summary-cards-grid">
                <div className="summary-stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-content">
                    <div className="stat-value">{payoutsSummary.total_payout_requests || 0}</div>
                    <div className="stat-label">Total Requests</div>
                  </div>
                </div>

                <div className="summary-stat-card success">
                  <div className="stat-icon"><FiCheck /></div>
                  <div className="stat-content">
                    <div className="stat-value">{payoutsSummary.completed_payouts || 0}</div>
                    <div className="stat-label">Completed</div>
                    <div className="stat-amount">{formatCurrency(payoutsSummary.total_completed)}</div>
                  </div>
                </div>

                <div className="summary-stat-card warning">
                  <div className="stat-icon"><FiClock /></div>
                  <div className="stat-content">
                    <div className="stat-value">{payoutsSummary.pending_payouts || 0}</div>
                    <div className="stat-label">Pending</div>
                    <div className="stat-amount">{formatCurrency(payoutsSummary.total_pending)}</div>
                  </div>
                </div>

                <div className="summary-stat-card info">
                  <div className="stat-icon"><FiPercent /></div>
                  <div className="stat-content">
                    <div className="stat-value">{formatCurrency(payoutsSummary.total_commission_paid)}</div>
                    <div className="stat-label">Commission Paid</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commission Info */}
          <div className="info-message">
            <FiInfo /> <strong>Payout Charges:</strong> ₹500-₹1000: Flat ₹35.40 | Above ₹1000: 1.77% (includes 18% GST)
          </div>

          {/* Eligibility Notice */}
          {!eligibility.can_request_payout && (
            <div className="warning-message">
              <FiAlertCircle /> <strong>Cannot Request Payout:</strong> You need at least ₹500 in settled balance to request a payout. 
              {balance?.raw?.settlement_info?.unsettled_transactions > 0 && (
                <span> Your unsettled funds will be available after tomorrow's 3 PM settlement.</span>
              )}
            </div>
          )}
          
          {/* Request Form */}
          {showRequestForm && (
            <div className="request-form-card">
              <h3><FiPlus /> Request New Payout</h3>
              
              <form onSubmit={handleRequestPayout} className="payout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      value={requestData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      required
                      min={eligibility.minimum_payout_amount}
                      max={eligibility.maximum_payout_amount}
                      step="0.01"
                      placeholder={`Min: ₹${eligibility.minimum_payout_amount}`}
                    />
                    <small style={{ fontSize: '12px', color: '#666' }}>
                      Min: ₹{eligibility.minimum_payout_amount} | Max: ₹{eligibility.maximum_payout_amount}
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label>Transfer Mode *</label>
                    <select
                      value={requestData.transferMode}
                      onChange={(e) => {
                        handleInputChange('transferMode', e.target.value);
                        resetForm();
                        handleInputChange('transferMode', e.target.value);
                      }}
                    >
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {requestData.transferMode === 'upi' ? (
                  <div className="form-group">
                    <label>UPI ID *</label>
                    <input
                      type="text"
                      value={requestData.beneficiaryDetails.upiId}
                      onChange={(e) => handleInputChange('beneficiaryDetails.upiId', e.target.value)}
                      required
                      placeholder="merchant@paytm"
                      pattern="[a-zA-Z0-9._-]+@[a-zA-Z]+"
                    />
                    <small style={{ fontSize: '12px', color: '#666' }}>
                      Example: merchant@paytm, user@ybl
                    </small>
                  </div>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Account Holder Name *</label>
                        <input
                          type="text"
                          value={requestData.beneficiaryDetails.accountHolderName}
                          onChange={(e) => handleInputChange('beneficiaryDetails.accountHolderName', e.target.value)}
                          required
                          placeholder="Full name as per bank"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Account Number *</label>
                        <input
                          type="text"
                          value={requestData.beneficiaryDetails.accountNumber}
                          onChange={(e) => handleInputChange('beneficiaryDetails.accountNumber', e.target.value)}
                          required
                          placeholder="1234567890123456"
                          minLength="9"
                          maxLength="18"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>IFSC Code *</label>
                        <input
                          type="text"
                          value={requestData.beneficiaryDetails.ifscCode}
                          onChange={(e) => handleInputChange('beneficiaryDetails.ifscCode', e.target.value.toUpperCase())}
                          required
                          placeholder="SBIN0001234"
                          pattern="[A-Z]{4}0[A-Z0-9]{6}"
                          maxLength="11"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Bank Name</label>
                        <input
                          type="text"
                          value={requestData.beneficiaryDetails.bankName}
                          onChange={(e) => handleInputChange('beneficiaryDetails.bankName', e.target.value)}
                          placeholder="State Bank of India"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Branch Name</label>
                      <input
                        type="text"
                        value={requestData.beneficiaryDetails.branchName}
                        onChange={(e) => handleInputChange('beneficiaryDetails.branchName', e.target.value)}
                        placeholder="Katraj Branch"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={requestData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Optional: Add notes for this payout"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowRequestForm(false);
                      resetForm();
                    }}
                    className="secondary-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={requestLoading || !eligibility.can_request_payout}
                    className="primary-btn"
                  >
                    {requestLoading ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Payouts List */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payouts...</p>
            </div>
          ) : (
            <div className="payouts-container">
              {payouts.length > 0 ? (
                <>
                  <h3><FiClock /> Payout History</h3>
                  <div className="payouts-grid">
                    {payouts.map((payout, index) => (
                      <div key={payout.payoutId || index} className="payout-card">
                        <div className="payout-header">
                          <div className="payout-id">
                            {payout.payoutId || `PAYOUT-${index + 1}`}
                          </div>
                          <div className={`payout-status status-${(payout.status || 'pending').toLowerCase()}`}>
                            {getStatusIcon(payout.status)}
                            {payout.status || 'Pending'}
                          </div>
                        </div>
                        
                        <div className="payout-body">
                          <div className="payout-amount">
                            {formatCurrency(payout.amount)}
                          </div>
                          
                          <div className="payout-details">
                            <div className="detail-row">
                              <span className="detail-label">Net Amount:</span>
                              <span className="detail-value" style={{ color: '#10b981', fontWeight: 600 }}>
                                {formatCurrency(payout.netAmount)}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Commission:</span>
                              <span className="detail-value">{formatCurrency(payout.commission)}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Mode:</span>
                              <span className="detail-value">
                                {payout.transferMode === 'bank_transfer' ? 'Bank Transfer' : 'UPI'}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Requested:</span>
                              <span className="detail-value">{formatDate(payout.requestedAt)}</span>
                            </div>
                            {payout.adminNotes && (
                              <div className="detail-row">
                                <span className="detail-label">Notes:</span>
                                <span className="detail-value">{payout.adminNotes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h3>No Payouts Found</h3>
                  <p>No payout requests have been made yet.</p>
                  <button 
                    onClick={() => setShowRequestForm(true)} 
                    className="primary-btn"
                    disabled={!eligibility.can_request_payout}
                  >
                    Request Your First Payout
                  </button>
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
