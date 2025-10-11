import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard,
  FiPercent,
  FiInfo,
  FiRefreshCw,
  FiClock,
  FiCheck  // ✅ ADD THIS!
} from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
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
      console.log('Balance data received:', data); // ✅ Debug log
      setBalance(data);
    } catch (error) {
      console.error('Balance fetch error:', error);
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
            <p>Complete financial overview with T+1/2 settlement tracking</p>
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
                {/* Available Balance (Settled) */}
                <div className="balance-card primary">
                  <div className="balance-icon">
                    <FiDollarSign />
                  </div>
                  <div className="balance-content">
                    <div className="balance-label">Available Balance (Settled)</div>
                    <div className="balance-amount">
                      {formatCurrency(balance.balance?.available_balance || 0)}
                    </div>
                    <div className="balance-description">
                      ✓ Ready to withdraw
                    </div>
                  </div>
                </div>
                
                {/* Unsettled Balance (Locked) */}
                <div className="balance-card warning">
                  <div className="balance-icon">
                    <FiClock />
                  </div>
                  <div className="balance-content">
                    <div className="balance-label">Unsettled Balance</div>
                    <div className="balance-amount">
                      {formatCurrency(balance.balance?.unsettled_net_revenue )}
                    </div>
                    <div className="balance-description">
                      ⏳ {balance.settlement_info?.next_settlement || 'Settling soon'}
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="balance-card secondary">
                  <div className="balance-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="balance-content">
                    <div className="balance-label">Total Revenue</div>
                    <div className="balance-amount">
                      {formatCurrency(balance.balance?.total_revenue || 0)}
                    </div>
                    <div className="balance-description">
                      Gross payments received
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
                      {formatCurrency(balance.balance?.total_commission || 0)}
                    </div>
                    <div className="balance-description">
                      Gateway charges
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Info Banner */}
              {balance.settlement_info?.unsettled_transactions > 0 && (
                <div className="settlement-info-banner">
                  <div className="banner-icon">
                    <FiInfo />
                  </div>
                  <div className="banner-content">
                    <strong>Settlement Notice (T+1/2):</strong>{' '}
                    {balance.settlement_info.unsettled_transactions} transaction(s) worth{' '}
                    <strong>{formatCurrency(balance.balance.unsettled_net_revenue)}</strong>{' '}
                    will be available for payout {balance.settlement_info.next_settlement_status}.
                  </div>
                </div>
              )}

              {/* Settlement Schedule Info Card */}
              {balance.settlement_info && (
                <div className="settlement-section">
                  <h3><FiClock /> Settlement Information - T+1/2 Policy</h3>
                  <div className="settlement-card">
                    <div className="settlement-stats">
                      <div className="stat-item">
                        <div className="stat-label">Settled Transactions</div>
                        <div className="stat-value success">
                          {balance.settlement_info.settled_transactions || 0}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Unsettled Transactions</div>
                        <div className="stat-value warning">
                          {balance.settlement_info.unsettled_transactions || 0}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Next Settlement</div>
                        <div className="stat-value info">
                          {balance.settlement_info.next_settlement || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="settlement-policy">
                      <p><strong>Settlement Policy:</strong> {'T+1/2 settlement'}</p>
                      <p><strong>Weekend Policy:</strong> {'Saturday and Sunday are off. Weekend payments settle on Monday.'}</p>
                    </div>

                  
                      <div className="settlement-examples">
                        
                        Once you request a payout, the amount will typically start reflecting in your bank the same day.
However, due to bank processing delays or if the amount exceeds ₹2 lakh, it may take 24–48 hours to appear in your account, as per bank policies.
Please ensure you provide the correct bank account details for smooth processing.


If any available funds are not withdrawn via payout, they will automatically be settled to the provided bank account.
                      </div>
                   
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="breakdown-section">
                <h3><FiInfo /> Revenue Breakdown</h3>
                <div className="breakdown-card">
                  {/* Settled Revenue Section */}
                  <div className="breakdown-subsection">
                    <div className="subsection-title">✅ Settled Revenue (Available)</div>
                    
                    <div className="breakdown-row">
                      <span className="breakdown-label">Settled Revenue:</span>
                      <span className="breakdown-value">
                        {formatCurrency(balance.balance?.settled_revenue || 0)}
                      </span>
                    </div>
                    
                    <div className="breakdown-row negative">
                      <span className="breakdown-label">Settled Commission:</span>
                      <span className="breakdown-value">
                        - {formatCurrency(balance.balance?.settled_commission || 0)}
                      </span>
                    </div>
                    
                    <div className="breakdown-row">
                      <span className="breakdown-label">Settled Net Revenue:</span>
                      <span className="breakdown-value success">
                        {formatCurrency(balance.balance?.settled_net_revenue || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="breakdown-divider"></div>

                  {/* Unsettled Revenue Section */}
                  <div className="breakdown-subsection">
                    <div className="subsection-title">⏳ Unsettled Revenue (Locked - {balance.settlement_info?.next_settlement_status || 'Settling soon'})</div>
                    
                    <div className="breakdown-row">
                      <span className="breakdown-label">Unsettled Revenue:</span>
                      <span className="breakdown-value">
                        {formatCurrency(balance.balance?.unsettled_revenue || 0)}
                      </span>
                    </div>
                    
                    <div className="breakdown-row negative">
                      <span className="breakdown-label">Unsettled Commission:</span>
                      <span className="breakdown-value">
                        - {formatCurrency(balance.balance?.unsettled_commission || 0)}
                      </span>
                    </div>
                    
                    <div className="breakdown-row">
                      <span className="breakdown-label">Unsettled Net Revenue:</span>
                      <span className="breakdown-value warning">
                        {formatCurrency(balance.balance?.unsettled_net_revenue || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="breakdown-divider"></div>

                  {/* Total Section */}
                  <div className="breakdown-row">
                    <span className="breakdown-label">Total Revenue:</span>
                    <span className="breakdown-value">
                      {formatCurrency(balance.balance?.total_revenue || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">Total Refunded:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.balance?.total_refunded || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative highlight">
                    <span className="breakdown-label">Total Commission:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.balance?.total_commission || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-divider"></div>
                  
                  <div className="breakdown-row">
                    <span className="breakdown-label">Net Revenue:</span>
                    <span className="breakdown-value success">
                      {formatCurrency(balance.balance?.net_revenue || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">Total Paid Out:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.balance?.total_paid_out || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">Pending Payouts:</span>
                    <span className="breakdown-value">
                      - {formatCurrency(balance.balance?.pending_payouts || 0)}
                    </span>
                  </div>
                  
                  <div className="breakdown-divider"></div>
                  
                  <div className="breakdown-row total">
                    <span className="breakdown-label">💰 Available Balance (Settled Only):</span>
                    <span className="breakdown-value primary">
                      {formatCurrency(balance.balance?.available_balance || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Structure */}
              {balance.balance?.commission_structure && (
                <div className="commission-section">
                  <h3><FiPercent /> Commission Structure</h3>
                  <div className="commission-cards">
                    <div className="commission-card">
                      <div className="commission-title">Payin Commission</div>
                      <div className="commission-rate">3.8%</div>
                     
                    </div>
                    
                    <div className="commission-card">
                      <div className="commission-title">Payout (₹500-₹1000)</div>
                      <div className="commission-rate">₹30</div>
                     
                    </div>
                    
                    <div className="commission-card">
                      <div className="commission-title">Payout (Above ₹1000)</div>
                      <div className="commission-rate">1.50%</div>
                      
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Summary */}
              {balance.transaction_summary && (
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
                          {balance.transaction_summary.total_transactions || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon success">
                        <FiCheck />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Settled Transactions</div>
                        <div className="detail-value">
                          {balance.transaction_summary.settled_transactions || 0}
                        </div>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon warning">
                        <FiClock />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Unsettled Transactions</div>
                        <div className="detail-value">
                          {balance.transaction_summary.unsettled_transactions || 0}
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
                          {balance.transaction_summary.total_payouts_completed || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">
                        <HiOutlineChartBar />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Pending Payout Requests</div>
                        <div className="detail-value">
                          {balance.transaction_summary.pending_payout_requests || 0}
                        </div>
                      </div>
                    </div>
                    
                    {balance.transaction_summary.avg_commission_per_transaction && (
                      <div className="detail-card">
                        <div className="detail-icon">
                          <FiPercent />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Avg Commission/Txn</div>
                          <div className="detail-value">
                            {formatCurrency(balance.transaction_summary.avg_commission_per_transaction)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payout Eligibility */}
              {balance.payout_eligibility && (
                <div className="eligibility-section">
                  <h3><RiMoneyDollarCircleLine /> Payout Eligibility</h3>
                  <div className="eligibility-card">
                    <div className="eligibility-status">
                      <span className={`status-badge ${balance.payout_eligibility.can_request_payout ? 'eligible' : 'not-eligible'}`}>
                        {balance.payout_eligibility.can_request_payout ? '✓ Eligible for Payout' : '✕ Not Eligible'}
                      </span>
                    </div>
                    <div className="eligibility-details">
                      <div className="eligibility-item">
                        <span className="eligibility-label">Available for Payout:</span>
                        <span className="eligibility-value">
                          {formatCurrency(balance.payout_eligibility.available_for_payout || 0)}
                        </span>
                      </div>
                      <div className="eligibility-item">
                        <span className="eligibility-label">Maximum Amount:</span>
                        <span className="eligibility-value">
                          {formatCurrency(balance.payout_eligibility.maximum_payout_amount || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="eligibility-reason">
                      <FiInfo /> {balance.payout_eligibility.reason || 'Settlement status determines payout availability'}
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
