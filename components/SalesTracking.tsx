'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          SALES TRACKING
        </div>
        <div className="cockpit-title text-2xl">REVENUE & SUBSCRIPTION ANALYTICS</div>
        <div className="cockpit-text mt-2 text-xs opacity-75">
          Real-time sales data from Stripe and database records
        </div>
      </div>

      {/* Revenue Overview - Always Visible */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-1 text-xs">TOTAL REVENUE</div>
          <div className="cockpit-number text-2xl">
            ${stats.revenue.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-1 text-xs">THIS MONTH</div>
          <div className="cockpit-number text-2xl">
            ${stats.revenue.thisMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-1 text-xs">LAST MONTH</div>
          <div className="cockpit-number text-2xl">
            ${stats.revenue.lastMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className="cockpit-lever"
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show Details
            </>
          )}
        </Button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-6">
          {/* Subscriptions */}
          <div className="cockpit-panel p-6">
            <div className="cockpit-label mb-4">SUBSCRIPTIONS</div>
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
                <div className="cockpit-number text-lg">
                  {stats.subscriptions.byTier.tradingPost}
                </div>
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
            <div className="cockpit-label mb-4">REVENUE BY PRODUCT</div>
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
              <div className="cockpit-label mb-4">CUSTOMERS</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
                  <div className="cockpit-label mb-1 text-xs">Total</div>
                  <div className="cockpit-number text-xl">{stats.customers.total}</div>
                </div>
                <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
                  <div className="cockpit-label mb-1 text-xs">Active</div>
                  <div className="cockpit-number text-xl text-green-400">
                    {stats.customers.active}
                  </div>
                </div>
                <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
                  <div className="cockpit-label mb-1 text-xs">New (Month)</div>
                  <div className="cockpit-number text-xl">{stats.customers.newThisMonth}</div>
                </div>
              </div>
            </div>
            <div className="cockpit-panel p-6">
              <div className="cockpit-label mb-4">PAYMENTS</div>
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
      )}
    </div>
  );
}
