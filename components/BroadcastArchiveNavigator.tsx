/**
 * Broadcast Archive Navigator
 * Displays all broadcast messages in a table format similar to PoC Archive
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Radio, Info, AlertTriangle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Broadcast {
  id: string;
  message: string;
  nature: 'info' | 'warning' | 'alert' | 'announcement' | 'success' | 'milestone' | 'update';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'active' | 'inactive' | 'all';

export function BroadcastArchiveNavigator() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  useEffect(() => {
    fetchBroadcasts();
    
    // Listen for new broadcast creation events
    const handleBroadcastCreated = () => {
      fetchBroadcasts();
    };
    
    window.addEventListener('broadcastCreated', handleBroadcastCreated);
    
    return () => {
      window.removeEventListener('broadcastCreated', handleBroadcastCreated);
    };
  }, []);

  const fetchBroadcasts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/broadcasts/all');
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data.broadcasts || []);
      } else if (response.status === 403) {
        setError('You do not have permission to view broadcasts. Creator or Operator access required.');
        setBroadcasts([]);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load broadcasts' }));
        setError(errorData.error || 'Failed to load broadcasts');
        setBroadcasts([]);
      }
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load broadcasts');
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBroadcasts = (): Broadcast[] => {
    switch (viewMode) {
      case 'active':
        return broadcasts.filter((b) => b.is_active);
      case 'inactive':
        return broadcasts.filter((b) => !b.is_active);
      case 'all':
        return broadcasts;
      default:
        return broadcasts.filter((b) => b.is_active);
    }
  };

  const getNatureIcon = (nature: string) => {
    switch (nature) {
      case 'alert':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      case 'announcement':
      case 'update':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
      case 'milestone':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Radio className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNatureBadgeColor = (nature: string) => {
    switch (nature) {
      case 'alert':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'announcement':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'milestone':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredBroadcasts = getFilteredBroadcasts();

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-[var(--hydrogen-amber)]" />
            <span className="cockpit-text">Loading broadcasts...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && broadcasts.length === 0) {
    return (
      <div className="cockpit-panel p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3">
          <div className="cockpit-label text-xs uppercase tracking-wider">BROADCAST ARCHIVE</div>
          <Button variant="outline" size="sm" onClick={fetchBroadcasts} className="cockpit-lever">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="rounded border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cockpit-panel">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3">
          <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
            <Radio className="h-4 w-4" />
            BROADCAST ARCHIVE
          </div>
          <Button variant="outline" size="sm" onClick={fetchBroadcasts} className="cockpit-lever">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* View Mode Selector */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={viewMode === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('active')}
            className="cockpit-lever"
          >
            Active
          </Button>
          <Button
            variant={viewMode === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('inactive')}
            className="cockpit-lever"
          >
            Inactive
          </Button>
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('all')}
            className="cockpit-lever"
          >
            All
          </Button>
        </div>

        {/* Broadcasts Table */}
        {filteredBroadcasts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="cockpit-text opacity-60">No broadcasts found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--keyline-primary)]">
                  <th className="cockpit-label text-left p-3 text-[10px] uppercase tracking-wider">Status</th>
                  <th className="cockpit-label text-left p-3 text-[10px] uppercase tracking-wider">Type</th>
                  <th className="cockpit-label text-left p-3 text-[10px] uppercase tracking-wider">Message</th>
                  <th className="cockpit-label text-left p-3 text-[10px] uppercase tracking-wider">Created</th>
                  <th className="cockpit-label text-left p-3 text-[10px] uppercase tracking-wider">Created By</th>
                </tr>
              </thead>
              <tbody>
                {filteredBroadcasts.map((broadcast) => (
                  <tr
                    key={broadcast.id}
                    className="border-b border-[var(--keyline-primary)]/30 hover:bg-[var(--cockpit-carbon)]/50 transition-colors"
                  >
                    <td className="p-3">
                      {broadcast.is_active ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="cockpit-text text-xs">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-gray-500" />
                          <span className="cockpit-text text-xs opacity-60">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getNatureIcon(broadcast.nature)}
                        <span className={`cockpit-text text-xs px-2 py-1 rounded border ${getNatureBadgeColor(broadcast.nature)}`}>
                          {broadcast.nature.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="cockpit-text text-xs max-w-md truncate" title={broadcast.message}>
                        {broadcast.message}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="cockpit-text text-xs font-mono opacity-80">
                        {formatDate(broadcast.created_at)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="cockpit-text text-xs opacity-80">
                        {broadcast.created_by || 'System'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {broadcasts.length > 0 && (
          <div className="mt-4 border-t border-[var(--keyline-primary)] pt-3">
            <div className="cockpit-text text-xs opacity-60">
              Showing {filteredBroadcasts.length} of {broadcasts.length} broadcasts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

