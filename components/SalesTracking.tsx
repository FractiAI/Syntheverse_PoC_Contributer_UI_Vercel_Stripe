'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Activity } from 'lucide-react';

interface SalesStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    byProduct: {
      enterprise: number;
      synthscan: number;
      fieldscan: number;
      pocRegistration: number;
      enterpriseSubmission: number;
      financialAlignment: number;
    };
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
    byTier: {
      pioneer: number;
      tradingPost: number;
      settlement: number;
      metropolis: number;
    };
  };
  payments: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    average: number;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
}

export function SalesTracking() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/sales/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load sales stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text">Loading sales data...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text text-red-400">Failed to load sales data</div>
      </div>
    );
  }

  const revenueChange =
    stats.revenue.lastMonth > 0
      ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          SALES TRACKING
        </div>
        <div className="cockpit-title text-2xl">Revenue & Subscription Analytics</div>
        <div className="cockpit-text mt-2 text-xs opacity-75">
          Real-time sales data from Stripe and database records
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-1 text-xs">Total Revenue</div>
          <div className="cockpit-number text-2xl">
            ${stats.revenue.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-1 text-xs">This Month</div>
          <div className="cockpit-number text-2xl">
            ${stats.revenue.thisMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          {revenueChange !== 0 && (
            <div
              className={`cockpit-text mt-1 text-xs ${
                revenueChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {revenueChange > 0 ? '+' : ''}
              {revenueChange.toFixed(1)}% vs last month
            </div>
          )}
        </div>
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-1 text-xs">Last Month</div>
          <div className="cockpit-number text-2xl">
            ${stats.revenue.lastMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          SUBSCRIPTIONS
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Total</div>
            <div className="cockpit-number text-xl">{stats.subscriptions.total}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Active</div>
            <div className="cockpit-number text-xl text-green-400">
              {stats.subscriptions.active}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Canceled</div>
            <div className="cockpit-number text-xl text-red-400">
              {stats.subscriptions.canceled}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Churn Rate</div>
            <div className="cockpit-number text-xl">
              {stats.subscriptions.total > 0
                ? ((stats.subscriptions.canceled / stats.subscriptions.total) * 100).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>
        <div className="cockpit-label mb-2 text-xs">By Tier</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-3">
            <div className="cockpit-text text-xs opacity-75">Pioneer</div>
            <div className="cockpit-number text-lg">{stats.subscriptions.byTier.pioneer}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-3">
            <div className="cockpit-text text-xs opacity-75">Trading Post</div>
            <div className="cockpit-number text-lg">{stats.subscriptions.byTier.tradingPost}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-3">
            <div className="cockpit-text text-xs opacity-75">Settlement</div>
            <div className="cockpit-number text-lg">{stats.subscriptions.byTier.settlement}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-3">
            <div className="cockpit-text text-xs opacity-75">Metropolis</div>
            <div className="cockpit-number text-lg">{stats.subscriptions.byTier.metropolis}</div>
          </div>
        </div>
      </div>

      {/* Revenue by Product */}
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          REVENUE BY PRODUCT
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Enterprise</div>
            <div className="cockpit-number text-xl">
              $
              {stats.revenue.byProduct.enterprise.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">SynthScan</div>
            <div className="cockpit-number text-xl">
              $
              {stats.revenue.byProduct.synthscan.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">FieldScan</div>
            <div className="cockpit-number text-xl">
              $
              {stats.revenue.byProduct.fieldscan.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">PoC Registration</div>
            <div className="cockpit-number text-xl">
              $
              {stats.revenue.byProduct.pocRegistration.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Enterprise Submission</div>
            <div className="cockpit-number text-xl">
              $
              {stats.revenue.byProduct.enterpriseSubmission.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Financial Alignment</div>
            <div className="cockpit-number text-xl">
              $
              {stats.revenue.byProduct.financialAlignment.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Customers & Payments */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            CUSTOMERS
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">Total</div>
              <div className="cockpit-number text-xl">{stats.customers.total}</div>
            </div>
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">Active</div>
              <div className="cockpit-number text-xl text-green-400">{stats.customers.active}</div>
            </div>
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">New (Month)</div>
              <div className="cockpit-number text-xl">{stats.customers.newThisMonth}</div>
            </div>
          </div>
        </div>
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            PAYMENTS
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">Total</div>
              <div className="cockpit-number text-xl">{stats.payments.total}</div>
            </div>
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">This Month</div>
              <div className="cockpit-number text-xl">{stats.payments.thisMonth}</div>
            </div>
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">Average</div>
              <div className="cockpit-number text-xl">
                ${stats.payments.average.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
