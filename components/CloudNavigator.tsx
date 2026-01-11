/**
 * Cloud Navigator Component
 * Table-based cloud selector similar to PoC Archive navigator
 * Displays all accessible clouds in a cockpit-table format
 * Supports delete (contributors: own clouds, creators/operators: any except Syntheverse)
 * Supports edit via cloud builder assistant
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Cloud, ExternalLink, Trash2, Edit2, X } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SandboxConfigurationWizard from './SandboxConfigurationWizard';

interface EnterpriseCloud {
  id: string;
  name: string;
  description: string | null;
  operator: string;
  subscription_tier: string | null;
  contribution_count?: number;
  qualified_count?: number;
  synth_activated?: boolean;
  vault_status?: string;
  created_at?: string | null;
  current_epoch?: string;
  scoring_config?: any;
}

interface CloudNavigatorProps {
  userEmail?: string | null;
  isCreator?: boolean;
  isOperator?: boolean;
}

export function CloudNavigator({ userEmail, isCreator = false, isOperator = false }: CloudNavigatorProps) {
  const [clouds, setClouds] = useState<EnterpriseCloud[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCloud, setSelectedCloud] = useState<string>('syntheverse');
  const [editingCloud, setEditingCloud] = useState<EnterpriseCloud | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingCloudId, setDeletingCloudId] = useState<string | null>(null);

  useEffect(() => {
    fetchClouds();
  }, []);

  async function fetchClouds() {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/sandboxes');
      if (res.ok) {
        const data = await res.json();
        const fetchedClouds = data.sandboxes || [];
        setClouds(fetchedClouds);
        
        // If operator (not creator) and syntheverse is selected, switch to first available cloud
        if (isOperator && !isCreator && selectedCloud === 'syntheverse' && fetchedClouds.length > 0) {
          const firstCloud = fetchedClouds[0];
          handleCloudClick(firstCloud.id);
        }
      }
    } catch (error) {
      console.error('Error fetching clouds:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCloudClick = (cloudId: string) => {
    setSelectedCloud(cloudId);
    // Store in localStorage for persistence
    localStorage.setItem('selectedCloud', cloudId);
    // Dispatch custom event to notify StatusIndicators
    window.dispatchEvent(new CustomEvent('cloudChanged', { detail: { cloudId } }));
  };

  const handleEdit = (cloud: EnterpriseCloud, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCloud(cloud);
    setShowEditDialog(true);
  };

  const handleDelete = async (cloudId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete this cloud? This action cannot be undone.`)) {
      return;
    }

    setDeletingCloudId(cloudId);
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${cloudId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh clouds list
        await fetchClouds();
        // If deleted cloud was selected, reset to Syntheverse
        if (selectedCloud === cloudId) {
          handleCloudClick('syntheverse');
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete cloud');
      }
    } catch (error) {
      console.error('Error deleting cloud:', error);
      alert('Failed to delete cloud');
    } finally {
      setDeletingCloudId(null);
    }
  };

  const handleSaveConfig = async (config: any) => {
    if (!editingCloud) return;

    try {
      // Update cloud via PATCH endpoint
      const res = await fetch(`/api/enterprise/sandboxes/${editingCloud.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          scoring_config: {
            novelty_weight: config.novelty_weight || 1.0,
            density_weight: config.density_weight || 1.0,
            coherence_weight: config.coherence_weight || 1.0,
            alignment_weight: config.alignment_weight || 1.0,
            qualification_threshold: config.qualification_threshold || 4000,
            overlap_penalty_start: config.overlap_penalty_start || 30,
            sweet_spot_center: config.sweet_spot_center || 14.2,
            sweet_spot_tolerance: config.sweet_spot_tolerance || 5.0,
          },
        }),
      });

      if (res.ok) {
        setShowEditDialog(false);
        setEditingCloud(null);
        await fetchClouds();
        alert('Cloud configuration saved successfully');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save cloud configuration');
      }
    } catch (error) {
      console.error('Error saving cloud configuration:', error);
      alert('Failed to save cloud configuration');
    }
  };

  const canDelete = (cloud: EnterpriseCloud): boolean => {
    if (cloud.id === 'syntheverse') return false;
    if (isCreator || isOperator) return true;
    if (userEmail && cloud.operator === userEmail) return true;
    return false;
  };

  const canEdit = (cloud: EnterpriseCloud): boolean => {
    if (cloud.id === 'syntheverse') return false;
    if (isCreator || isOperator) return true;
    if (userEmail && cloud.operator === userEmail) return true;
    return false;
  };

  const getStatusBadge = (cloud: EnterpriseCloud) => {
    if (cloud.synth_activated) {
      return (
        <span className="cockpit-badge bg-green-500/20 text-green-400 border-green-500/50">
          Activated
        </span>
      );
    }
    if (cloud.vault_status === 'paused') {
      return (
        <span className="cockpit-badge bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
          Paused
        </span>
      );
    }
    return (
      <span className="cockpit-badge bg-gray-500/20 text-gray-400 border-gray-500/50">
        Inactive
      </span>
    );
  };

  // Include Syntheverse as the first "cloud" (only for creators, not operators)
  const syntherverseCloud: EnterpriseCloud = {
    id: 'syntheverse',
    name: 'Syntheverse',
    description: 'Main Syntheverse Protocol',
    operator: 'system',
    subscription_tier: null,
    contribution_count: 0,
    qualified_count: 0,
    synth_activated: true,
    vault_status: 'active',
  };

  // Operators (enterprise users) see only their own clouds, creators see everything
  const allClouds: EnterpriseCloud[] = isCreator 
    ? [syntherverseCloud, ...clouds]
    : clouds;

  return (
    <div className="cockpit-module cockpit-panel">
      <div className="p-4 md:p-6">
        {/* Module Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3 md:mb-6 md:pb-4">
          <div>
            <div className="cockpit-label">CLOUD NAVIGATOR</div>
            <div className="cockpit-title mt-1 text-2xl">CLOUD SELECTOR</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchClouds()}
              className="cockpit-lever px-4 py-2 text-sm"
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="cockpit-text opacity-60">Loading clouds...</div>
          </div>
        ) : allClouds.length === 0 ? (
          <div className="py-12 text-center">
            <div className="cockpit-text mb-4">No clouds found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cockpit-table">
              <thead>
                <tr>
                  <th>Cloud Name</th>
                  <th>Description</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th className="text-right">Contributions</th>
                  <th className="text-right">Qualified</th>
                  <th>Operator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allClouds.map((cloud) => {
                  const isSelected = selectedCloud === cloud.id;
                  return (
                    <tr
                      key={cloud.id}
                      onClick={() => handleCloudClick(cloud.id)}
                      className={`cursor-pointer ${isSelected ? 'bg-[var(--cockpit-carbon)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hydrogen-amber)]/30 to-purple-500/30 text-xs font-semibold">
                            {cloud.id === 'syntheverse' ? 'S' : cloud.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium">{cloud.name}</div>
                        </div>
                      </td>
                      <td className="cockpit-text text-sm">
                        {cloud.description || '—'}
                      </td>
                      <td className="cockpit-text text-sm">
                        {cloud.subscription_tier || (cloud.id === 'syntheverse' ? 'Main Protocol' : '—')}
                      </td>
                      <td>{getStatusBadge(cloud)}</td>
                      <td className="cockpit-number text-right font-mono">
                        {cloud.contribution_count || 0}
                      </td>
                      <td className="cockpit-number text-right font-mono">
                        {cloud.qualified_count || 0}
                      </td>
                      <td className="cockpit-text text-sm">
                        {cloud.id === 'syntheverse' ? 'System' : cloud.operator.split('@')[0]}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="cockpit-text text-xs text-[var(--hydrogen-amber)]">
                              Selected
                            </span>
                          )}
                          {cloud.id !== 'syntheverse' && (
                            <Link
                              href={`/enterprise/sandbox/${cloud.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="cockpit-lever text-xs"
                            >
                              <ExternalLink className="mr-1 inline h-3 w-3" />
                              View
                            </Link>
                          )}
                          {canEdit(cloud) && (
                            <button
                              onClick={(e) => handleEdit(cloud, e)}
                              className="cockpit-lever text-xs"
                              title="Edit cloud configuration"
                            >
                              <Edit2 className="mr-1 inline h-3 w-3" />
                              Edit
                            </button>
                          )}
                          {canDelete(cloud) && (
                            <button
                              onClick={(e) => handleDelete(cloud.id, e)}
                              disabled={deletingCloudId === cloud.id}
                              className="cockpit-lever text-xs bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                              title="Delete cloud"
                            >
                              <Trash2 className="mr-1 inline h-3 w-3" />
                              {deletingCloudId === cloud.id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Dialog - Cloud Builder Assistant */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) setEditingCloud(null);
      }}>
        <DialogContent className="cockpit-panel max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--cockpit-near-black)] border-2 border-[var(--keyline-primary)]">
          <DialogHeader>
            <DialogTitle className="cockpit-title text-xl mb-4">
              Edit Cloud: {editingCloud?.name}
            </DialogTitle>
          </DialogHeader>
          {editingCloud && (
            <div className="mt-4">
              <SandboxConfigurationWizard
                sandboxId={editingCloud.id}
                initialConfig={{
                  name: editingCloud.name,
                  description: editingCloud.description || '',
                  mission: '',
                  project_goals: '',
                  synth_activation_fee: 10000,
                  monthly_rent_tier: 'Seed',
                  energy_cost_per_evaluation: 100,
                  energy_cost_per_registration: 500,
                  founder_threshold: 8000,
                  pioneer_threshold: 6000,
                  community_threshold: 5000,
                  ecosystem_threshold: 4000,
                  current_epoch: editingCloud.current_epoch || 'founder',
                  novelty_weight: editingCloud.scoring_config?.novelty_weight || 1.0,
                  density_weight: editingCloud.scoring_config?.density_weight || 1.0,
                  coherence_weight: editingCloud.scoring_config?.coherence_weight || 1.0,
                  alignment_weight: editingCloud.scoring_config?.alignment_weight || 1.0,
                  qualification_threshold: editingCloud.scoring_config?.qualification_threshold || 4000,
                  overlap_penalty_start: editingCloud.scoring_config?.overlap_penalty_start || 30,
                  sweet_spot_center: editingCloud.scoring_config?.sweet_spot_center || 14.2,
                  sweet_spot_tolerance: editingCloud.scoring_config?.sweet_spot_tolerance || 5.0,
                  public_access: false,
                  contributor_channels: [],
                  allow_external_submissions: false,
                  gold_focus: false,
                  silver_focus: false,
                  copper_focus: false,
                  hybrid_metals: true,
                }}
                onSave={handleSaveConfig}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

