import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import signupService from '../services/signupService';
import superadminPaymentService from '../services/superadminPaymentService';
import Navbar from './Navbar';
import './Dashboard.css';
import './pages/PageLayout.css';

const SuperadminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="page-main">
        <div className="page-header">
          <h1>🏠 Superadmin Dashboard</h1>
          <p>Welcome to your superadmin dashboard. Manage users, transactions, and system-wide operations.</p>
        </div>
        
        <div className="page-content">
          {/* Quick Access Cards */}
          <div className="quick-access">
            <h2>Quick Access</h2>
            <p>Navigate to different sections of the superadmin system.</p>
            
            <div className="access-grid">
              <div className="access-card" onClick={() => navigate('/superadmin/signup')}>
                <div className="access-icon">👥</div>
                <h3>User Registration</h3>
                <p>Register new users for the platform</p>
              </div>
              
              <div className="access-card" onClick={() => navigate('/superadmin/transactions')}>
                <div className="access-icon">📊</div>
                <h3>Admin Transactions</h3>
                <p>View and manage all admin transactions</p>
              </div>
              
              <div className="access-card" onClick={() => navigate('/superadmin/payouts')}>
                <div className="access-icon">💰</div>
                <h3>Admin Payouts</h3>
                <p>Manage admin payouts and commissions</p>
              </div>
              
              <div className="access-card" onClick={() => navigate('/admin')}>
                <div className="access-icon">🔧</div>
                <h3>Admin Features</h3>
                <p>Access admin dashboard features</p>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="system-overview">
            <h2>System Overview</h2>
            <p>Monitor system-wide operations and statistics.</p>
            
            <div className="overview-cards">
              <div className="overview-card">
                <div className="overview-icon">👥</div>
                <div className="overview-content">
                  <h3>User Management</h3>
                  <p>Register and manage platform users</p>
                </div>
              </div>
              
              <div className="overview-card">
                <div className="overview-icon">📊</div>
                <div className="overview-content">
                  <h3>Transaction Monitoring</h3>
                  <p>Monitor all admin transactions across the platform</p>
                </div>
              </div>
              
              <div className="overview-card">
                <div className="overview-icon">💰</div>
                <div className="overview-content">
                  <h3>Payout Management</h3>
                  <p>Manage admin payouts and commission structures</p>
                </div>
              </div>
              
              <div className="overview-card">
                <div className="overview-icon">⚙️</div>
                <div className="overview-content">
                  <h3>System Administration</h3>
                  <p>Access advanced system configuration and settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperadminDashboard;
