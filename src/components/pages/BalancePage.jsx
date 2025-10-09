import React, { useState, useEffect } from 'react';
import { 
   
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard,
  FiPercent,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi2';
import paymentService from '../../services/paymentService';
import Sidebar from '../Sidebar';
import './PageLayout.css';
import './BalancePage.css';

const BalancePage = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await paymentService.getBalance();
      setBalance(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="page-container with-sidebar">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1><FiDollarSign /> Balance & Revenue</h1>
            <p>Complete financial overview with commission breakdown</p>
          </div>
          <button 
            onClick={fetchBalance} 
            disabled={loading} 
            className="refresh-btn"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="page-content">
          {error && (
            <div className="error-message">
              <FiInfo /> {error}
            </div>
          )}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading balance information...</p>
            </div>
          ) : balance ? (
            <div className="balance-container">
              {/* Primary Balance Cards */}
              <div className="balance-cards">
                <div className="balance-card primary">
                  <div className="balance-icon">
                    <FiDollarSign />
                  </div>
                  <div className="balance-content">
                    <div className="balance-label">Available Balance</div>
                    <div className="balance-amount">
                      {formatCurrency(balance.availableBalance)}
                    </div>
                    <div className="balance-description">
                      Ready to withdraw
                    </div>
                  </div>
                </div>
                
                <div className="balance-card secondary">
                  <div className="balance-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="balance-content">
                    <div className="balance-label">Total Revenue</div>
                    <div className="balance-amount">
                      {formatCurrency(balance.totalBalance)}
                    </div>
                    <div className="balance-description">
                      Gross payments received
                    </div>
                  </div>
                </div>

                <div className="balance-card tertiary">
                  <div className="balance-icon">
                    <HiOutlineChartBar />
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

                <div className="balance-card quaternary">
                  <div className="balance-icon">
                    <FiPercent />
                  </div>
                  <div className="balance-content">
                    <div className="balance-label">Commission Deducted</div>
                    <div className="balance-amount">
                      {formatCurrency(balance.commissionDeducted)}
                    </div>
                    <div className="balance-description">
                      {balance.commissionRate || 'Gateway charges'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="breakdown-section">
                <h3><FiInfo /> Revenue Breakdown</h3>
                <div className="breakdown-card">
                  <div className="breakdown-row">
                    <span className="breakdown-label">Total Revenue:</span>
                    <span className="breakdown-value">
                      {formatCurrency(balance.totalBalance)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">Total Refunded:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.raw?.balance?.total_refunded || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative highlight">
                    <span className="breakdown-label">Commission Deducted:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.commissionDeducted)}
                    </span>
                  </div>
                  
                  <div className="breakdown-divider"></div>
                  
                  <div className="breakdown-row">
                    <span className="breakdown-label">Net Revenue:</span>
                    <span className="breakdown-value success">
                      {formatCurrency(balance.netRevenue)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">Total Paid Out:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.totalPaidOut)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">Pending Payouts:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.pendingBalance)}
                    </span>
                  </div>
                  
                  <div className="breakdown-divider"></div>
                  
                  <div className="breakdown-row total">
                    <span className="breakdown-label">Available Balance:</span>
                    <span className="breakdown-value primary">
                      {formatCurrency(balance.availableBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Structure */}
              {balance.raw?.balance?.commission_structure && (
                <div className="commission-section">
                  <h3><FiPercent /> Commission Structure</h3>
                  <div className="commission-cards">
                    <div className="commission-card">
                      <div className="commission-title">Payin Commission</div>
                      <div className="commission-rate">
                        {balance.raw.balance.commission_structure.payin}
                      </div>
                      <div className="commission-description">
                        Applied on all incoming payments
                      </div>
                    </div>
                    
                    <div className="commission-card">
                      <div className="commission-title">Minimum Charge</div>
                      <div className="commission-rate">
                        {balance.raw.balance.commission_structure.minimum_charge}
                      </div>
                      <div className="commission-description">
                        Minimum per transaction
                      </div>
                    </div>
                    
                    <div className="commission-card">
                      <div className="commission-title">Payout (₹500-₹1000)</div>
                      <div className="commission-rate">
                        {balance.raw.balance.commission_structure.payout_500_to_1000}
                      </div>
                      <div className="commission-description">
                        Flat fee for small payouts
                      </div>
                    </div>
                    
                    <div className="commission-card">
                      <div className="commission-title">Payout (Above ₹1000)</div>
                      <div className="commission-rate">
                        {balance.raw.balance.commission_structure.payout_above_1000}
                      </div>
                      <div className="commission-description">
                        Percentage-based fee
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Summary */}
              {balance.transactionSummary && Object.keys(balance.transactionSummary).length > 0 && (
                <div className="summary-section">
                  <h3><FiTrendingUp /> Transaction Summary</h3>
                  <div className="details-grid">
                    <div className="detail-card">
                      <div className="detail-icon">
                        <FiCreditCard />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Total Transactions</div>
                        <div className="detail-value">
                          {balance.transactionSummary.total_transactions || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">
                        <FiTrendingUp />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Completed Payouts</div>
                        <div className="detail-value">
                          {balance.transactionSummary.total_payouts_completed || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">
                        <HiOutlineChartBar />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Pending Requests</div>
                        <div className="detail-value">
                          {balance.transactionSummary.pending_payout_requests || 0}
                        </div>
                      </div>
                    </div>
                    
                    {balance.transactionSummary.avg_commission_per_transaction && (
                      <div className="detail-card">
                        <div className="detail-icon">
                          <FiPercent />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Avg Commission/Txn</div>
                          <div className="detail-value">
                            {formatCurrency(balance.transactionSummary.avg_commission_per_transaction)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payout Eligibility */}
              {balance.payoutEligibility && (
                <div className="eligibility-section">
                  <h3> Payout Eligibility</h3>
                  <div className="eligibility-card">
                    <div className="eligibility-status">
                      <span className={`status-badge ${balance.payoutEligibility.can_request_payout ? 'eligible' : 'not-eligible'}`}>
                        {balance.payoutEligibility.can_request_payout ? '✓ Eligible for Payout' : '✕ Not Eligible'}
                      </span>
                    </div>
                    <div className="eligibility-details">
                      <div className="eligibility-item">
                        <span className="eligibility-label">Minimum Amount:</span>
                        <span className="eligibility-value">
                          {formatCurrency(balance.payoutEligibility.minimum_payout_amount)}
                        </span>
                      </div>
                      <div className="eligibility-item">
                        <span className="eligibility-label">Maximum Amount:</span>
                        <span className="eligibility-value">
                          {formatCurrency(balance.payoutEligibility.maximum_payout_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Merchant Info */}
              {balance.merchant && (
                <div className="merchant-section">
                  <h3><FiInfo /> Account Information</h3>
                  <div className="merchant-card">
                    <div className="merchant-detail">
                      <span className="merchant-label">Merchant Name:</span>
                      <span className="merchant-value">{balance.merchant.merchantName}</span>
                    </div>
                    <div className="merchant-detail">
                      <span className="merchant-label">Email:</span>
                      <span className="merchant-value">{balance.merchant.merchantEmail}</span>
                    </div>
                    <div className="merchant-detail">
                      <span className="merchant-label">Merchant ID:</span>
                      <span className="merchant-value mono">{balance.merchant.merchantId}</span>
                    </div>
                    <div className="merchant-detail">
                      <span className="merchant-label">Last Updated:</span>
                      <span className="merchant-value">{new Date().toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><FiCreditCard /></div>
              <h3>Unable to Load Balance</h3>
              <p>There was an issue loading your balance information.</p>
              <button onClick={fetchBalance} className="primary-btn">
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BalancePage;
