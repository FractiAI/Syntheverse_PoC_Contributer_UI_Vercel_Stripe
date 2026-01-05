'use client';

import { useState, useEffect } from 'react';
import { Users, Link as LinkIcon, Activity } from 'lucide-react';

interface CockpitStats {
  blockchain: {
    network: string;
    chainId: number;
    registeredPocs: number;
    totalTransactions: number;
    contractAddresses: {
      lens: string;
      synth90t: string;
      vault: string;
    };
  };
  archive: {
    total: number;
    active: number;
    archived: number;
    qualified: number;
    onChain: number;
  };
  users: {
    total: number;
    active: number;
    operators: number;
    deleted: number;
  };
  database: {
    contributions: number;
    allocations: number;
    auditLogs: number;
    enterpriseSandboxes: number;
  };
  activity: {
    pageActivity: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    newUsers: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    submissions: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
      byStatus: {
        evaluating: number;
        qualified: number;
        unqualified: number;
        payment_pending: number;
      };
    };
    chatSessions: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    problemsReported: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
      byType: {
        errors: number;
        evaluation_errors: number;
        payment_errors: number;
        other: number;
      };
    };
  };
}

export function CreatorCockpitStats() {
  const [stats, setStats] = useState<CockpitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      // Fetch archive stats
      const archiveRes = await fetch('/api/creator/archive/reset');
      const archiveData = archiveRes.ok ? await archiveRes.json() : null;

      // Fetch user stats
      const usersRes = await fetch('/api/creator/users?limit=1000');
      const usersData = usersRes.ok ? await usersRes.json() : null;

      // Fetch database stats - get pagination totals
      let allocationsCount = 0;
      let auditLogsCount = 0;
      let sandboxesCount = 0;

      try {
        const allocationsRes = await fetch('/api/creator/database/allocations?limit=1');
        if (allocationsRes.ok) {
          const allocationsData = await allocationsRes.json();
          allocationsCount = allocationsData?.pagination?.total || 0;
        }
      } catch (e) {
        console.error('Failed to fetch allocations count:', e);
      }

      try {
        const auditLogsRes = await fetch('/api/creator/database/audit_log?limit=1');
        if (auditLogsRes.ok) {
          const auditLogsData = await auditLogsRes.json();
          auditLogsCount = auditLogsData?.pagination?.total || 0;
        }
      } catch (e) {
        console.error('Failed to fetch audit logs count:', e);
      }

      try {
        const sandboxesRes = await fetch('/api/creator/database/enterprise_sandboxes?limit=1');
        if (sandboxesRes.ok) {
          const sandboxesData = await sandboxesRes.json();
          sandboxesCount = sandboxesData?.pagination?.total || 0;
        }
      } catch (e) {
        console.error('Failed to fetch sandboxes count:', e);
      }

      // Fetch blockchain data
      const blockchainRes = await fetch('/api/creator/blockchain-stats');
      const blockchainData = blockchainRes.ok ? await blockchainRes.json() : null;

      // Fetch activity stats
      const activityRes = await fetch('/api/creator/activity-stats');
      const activityData = activityRes.ok ? await activityRes.json() : null;

      // Calculate stats
      const archiveStats = archiveData?.statistics || {};
      const userPagination = usersData?.pagination || { total: 0 };
      const users = usersData?.users || [];

      const operators = users.filter((u: any) => u.role === 'operator').length;
      const deleted = users.filter((u: any) => u.deleted_at).length;

      setStats({
        blockchain: blockchainData || {
          network: 'Base Mainnet',
          chainId: 8453,
          registeredPocs: archiveStats.registered || 0,
          totalTransactions: blockchainData?.totalTransactions || archiveStats.registered || 0,
          contractAddresses: blockchainData?.contractAddresses || {
            lens: '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8',
            synth90t: '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
            vault: '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3',
          },
        },
        archive: {
          total: Object.values(archiveStats.by_status || {}).reduce(
            (sum: number, s: any) => sum + (s.count || 0),
            0
          ),
          active: archiveStats.by_status?.find((s: any) => s.status === 'evaluating')?.count || 0,
          archived: archiveStats.archived_resettable || 0,
          qualified: archiveStats.by_status?.find((s: any) => s.status === 'qualified')?.count || 0,
          onChain: archiveStats.registered || 0,
        },
        users: {
          total: userPagination.total || 0,
          active: userPagination.total - deleted,
          operators,
          deleted,
        },
        database: {
          contributions:
            Object.values(archiveStats.by_status || {}).reduce(
              (sum: number, s: any) => sum + (s.count || 0),
              0
            ) || 0,
          allocations: allocationsCount,
          auditLogs: auditLogsCount,
          enterpriseSandboxes: sandboxesCount,
        },
        activity: activityData?.stats || {
          pageActivity: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          newUsers: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          submissions: {
            total: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            byStatus: { evaluating: 0, qualified: 0, unqualified: 0, payment_pending: 0 },
          },
          chatSessions: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          problemsReported: {
            total: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            byType: { errors: 0, evaluation_errors: 0, payment_errors: 0, other: 0 },
          },
        },
      });
    } catch (error) {
      console.error('Failed to load cockpit stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text opacity-60">Initializing awareness bridge...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-6">
      {/* Core Metrics - Syntheverse Narrative */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Liberated Contributions */}
        <div className="cockpit-panel border-l-4 border-[var(--hydrogen-amber)] p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">◎</span>
            <div className="cockpit-label text-xs">LIBERATED CONTRIBUTIONS</div>
          </div>
          <div className="cockpit-title mb-2 text-3xl">{stats.archive.total}</div>
          <div className="cockpit-text mb-4 text-sm opacity-75">
            Visible, demonstrable, verifiable via HHF-AI MRI
          </div>
          <div className="space-y-2 border-t border-[var(--keyline-primary)] pt-3">
            <div className="flex justify-between text-sm">
              <span className="cockpit-text opacity-70">On-Chain Proofs:</span>
              <span className="cockpit-number text-[var(--hydrogen-amber)]">
                {stats.archive.onChain}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="cockpit-text opacity-70">Qualified:</span>
              <span className="cockpit-number">{stats.archive.qualified}</span>
            </div>
          </div>
        </div>

        {/* Base Mainnet */}
        <div className="cockpit-panel border-l-4 border-blue-500 p-6">
          <div className="mb-3 flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <div className="cockpit-label text-xs">BASE MAINNET</div>
            <Activity className="ml-auto h-4 w-4 animate-pulse text-green-500" />
          </div>
          <div className="cockpit-title mb-2 text-3xl">{stats.blockchain.registeredPocs}</div>
          <div className="cockpit-text mb-4 text-sm opacity-75">
            Permanently anchored, verifiable by all
          </div>
          <div className="space-y-2 border-t border-[var(--keyline-primary)] pt-3">
            <div className="flex justify-between text-sm">
              <span className="cockpit-text opacity-70">Network:</span>
              <span className="cockpit-number text-xs">{stats.blockchain.network}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="cockpit-text opacity-70">Transactions:</span>
              <span className="cockpit-number">{stats.blockchain.totalTransactions}</span>
            </div>
          </div>
        </div>

        {/* Active Operators */}
        <div className="cockpit-panel border-l-4 border-purple-500 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            <div className="cockpit-label text-xs">ACTIVE OPERATORS</div>
          </div>
          <div className="cockpit-title mb-2 text-3xl">{stats.users.operators}</div>
          <div className="cockpit-text mb-4 text-sm opacity-75">Authorized system access</div>
          <div className="space-y-2 border-t border-[var(--keyline-primary)] pt-3">
            <div className="flex justify-between text-sm">
              <span className="cockpit-text opacity-70">Total Users:</span>
              <span className="cockpit-number">{stats.users.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="cockpit-text opacity-70">This Month:</span>
              <span className="cockpit-number text-green-400">
                {stats.activity.newUsers.thisMonth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
