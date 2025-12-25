/**
 * Interactive PoC Detail Panel Component
 * 
 * Shows detailed information about a selected PoC with scores,
 * status, and action buttons (Allocate SYNTH, Register PoC)
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Coins, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { METAL_COLORS } from './visualEncoding'

interface PoCDetailPanelProps {
    submissionHash: string
    onClose: () => void
}

interface PoCData {
    submission_hash: string
    title: string
    contributor: string
    scores: {
        novelty?: number
        density?: number
        coherence?: number
        alignment?: number
        pod_score?: number
        redundancy?: number
    }
    metals: string[]
    status: string
    qualified: boolean
    epoch?: string
    projectedAllocation?: {
        projected_allocation: number
        eligible: boolean
        epoch: string
        breakdown: {
            base_score: number
            metal_multiplier: number
            metal_combination: string
            final_amount: number
        }
    }
    registrationStatus?: {
        registered: boolean
        registration_date?: string
        transaction_hash?: string
    }
    allocationStatus?: {
        allocated: boolean
        amount?: number
    }
}

export function PoCDetailPanel({ submissionHash, onClose }: PoCDetailPanelProps) {
    const [loading, setLoading] = useState(true)
    const [allocating, setAllocating] = useState(false)
    const [registering, setRegistering] = useState(false)
    const [data, setData] = useState<PoCData | null>(null)
    const [isContributor, setIsContributor] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
        loadPoCData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionHash])
    
    async function loadPoCData() {
        try {
            setLoading(true)
            setError(null)
            
            // Check if user is contributor
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            // Fetch PoC data from sandbox-map API
            const response = await fetch('/api/sandbox-map')
            if (!response.ok) throw new Error('Failed to fetch PoC data')
            
            const mapData = await response.json()
            const node = mapData.nodes?.find((n: any) => n.submission_hash === submissionHash)
            
            if (!node) {
                throw new Error('PoC not found')
            }
            
            // Fetch projected allocation
            let projectedAllocation = null
            try {
                const allocResponse = await fetch(`/api/poc/${submissionHash}/projected-allocation`)
                if (allocResponse.ok) {
                    projectedAllocation = await allocResponse.json()
                }
            } catch (e) {
                console.error('Failed to fetch projected allocation:', e)
            }
            
            // Fetch registration status
            let registrationStatus = null
            try {
                const regResponse = await fetch(`/api/poc/${submissionHash}/registration-status`)
                if (regResponse.ok) {
                    registrationStatus = await regResponse.json()
                }
            } catch (e) {
                console.error('Failed to fetch registration status:', e)
            }
            
            // Check allocation status
            let allocationStatus = null
            try {
                const allocStatusResponse = await fetch(`/api/allocations/${submissionHash}`)
                if (allocStatusResponse.ok) {
                    const allocData = await allocStatusResponse.json()
                    allocationStatus = {
                        allocated: allocData.count > 0,
                        amount: allocData.total_reward || 0
                    }
                }
            } catch (e) {
                console.error('Failed to fetch allocation status:', e)
            }
            
            setData({
                submission_hash: node.submission_hash,
                title: node.title,
                contributor: node.contributor,
                scores: node.scores || {},
                metals: node.metals || [],
                status: node.status,
                qualified: node.scores?.pod_score >= 8000 || false,
                projectedAllocation,
                registrationStatus,
                allocationStatus: allocationStatus || undefined
            })
            
            setIsContributor(user?.email === node.contributor)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load PoC data')
        } finally {
            setLoading(false)
        }
    }
    
    async function handleAllocateTokens() {
        try {
            setAllocating(true)
            setError(null)
            
            const response = await fetch(`/api/poc/${submissionHash}/allocate`, {
                method: 'POST'
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to allocate tokens')
            }
            
            // Reload data
            await loadPoCData()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to allocate tokens')
        } finally {
            setAllocating(false)
        }
    }
    
    async function handleRegisterPoC() {
        try {
            setRegistering(true)
            setError(null)
            
            const response = await fetch(`/api/poc/${submissionHash}/register`, {
                method: 'POST'
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to initiate registration')
            }
            
            const { checkout_url } = await response.json()
            
            // Redirect to Stripe checkout
            window.location.href = checkout_url
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initiate registration')
            setRegistering(false)
        }
    }
    
    if (loading) {
        return (
            <Card className="fixed right-4 top-4 w-96 z-50 max-h-[90vh] overflow-y-auto">
                <CardContent className="p-6 flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }
    
    if (error || !data) {
        return (
            <Card className="fixed right-4 top-4 w-96 z-50">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error || 'Failed to load PoC data'}</p>
                    <Button onClick={onClose} className="mt-4">Close</Button>
                </CardContent>
            </Card>
        )
    }
    
    const canAllocate = isContributor && data.qualified && !data.allocationStatus?.allocated && data.registrationStatus?.registered
    const canRegister = isContributor && !data.registrationStatus?.registered
    
    return (
        <Card className="fixed right-4 top-4 w-96 z-50 max-h-[90vh] overflow-y-auto shadow-lg">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{data.title}</CardTitle>
                        <CardDescription className="mt-1">
                            {data.submission_hash.substring(0, 8)}...
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    {data.metals.map(metal => (
                        <Badge 
                            key={metal} 
                            variant="outline"
                            style={{ borderColor: METAL_COLORS[metal as keyof typeof METAL_COLORS] }}
                        >
                            {metal}
                        </Badge>
                    ))}
                    {data.qualified ? (
                        <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Qualified
                        </Badge>
                    ) : (
                        <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Qualified
                        </Badge>
                    )}
                    {data.registrationStatus?.registered && (
                        <Badge variant="default" className="bg-blue-500">
                            Registered
                        </Badge>
                    )}
                    {data.allocationStatus?.allocated && (
                        <Badge variant="default" className="bg-yellow-500">
                            Allocated
                        </Badge>
                    )}
                </div>
                
                {/* Scores */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Scores</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Novelty:</span>
                            <span className="ml-2 font-mono">{data.scores.novelty || 0}/2500</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Density:</span>
                            <span className="ml-2 font-mono">{data.scores.density || 0}/2500</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Coherence:</span>
                            <span className="ml-2 font-mono">{data.scores.coherence || 0}/2500</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Alignment:</span>
                            <span className="ml-2 font-mono">{data.scores.alignment || 0}/2500</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Pod Score:</span>
                            <span className="ml-2 font-mono font-bold">{data.scores.pod_score || 0}</span>
                        </div>
                        {data.scores.redundancy !== undefined && (
                            <div className="col-span-2">
                                <span className="text-muted-foreground">Redundancy Penalty:</span>
                                <span className="ml-2 font-mono">{data.scores.redundancy}%</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Contributor-specific actions */}
                {isContributor && (
                    <div className="space-y-3 pt-4 border-t">
                        {/* Projected Allocation */}
                        {data.projectedAllocation?.eligible && (
                            <div className="bg-muted p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins className="h-4 w-4 text-yellow-500" />
                                    <span className="font-semibold text-sm">Projected SYNTH Allocation</span>
                                </div>
                                <div className="text-2xl font-bold">
                                    {data.projectedAllocation.projected_allocation.toLocaleString()} SYNTH
                                </div>
                                {data.projectedAllocation.breakdown && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Epoch: {data.projectedAllocation.epoch} • 
                                        Multiplier: {data.projectedAllocation.breakdown.metal_multiplier.toFixed(2)}×
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Allocate SYNTH Button */}
                        <Button
                            onClick={handleAllocateTokens}
                            disabled={!canAllocate || allocating}
                            className="w-full"
                            variant={canAllocate ? "default" : "secondary"}
                        >
                            {allocating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Allocating...
                                </>
                            ) : (
                                <>
                                    <Coins className="h-4 w-4 mr-2" />
                                    Allocate SYNTH
                                </>
                            )}
                        </Button>
                        {!canAllocate && (
                            <p className="text-xs text-muted-foreground">
                                {!data.qualified ? 'PoC must be qualified' :
                                 data.allocationStatus?.allocated ? 'Tokens already allocated' :
                                 !data.registrationStatus?.registered ? 'PoC must be registered first' :
                                 'Cannot allocate'}
                            </p>
                        )}
                        
                        {/* Register PoC Button */}
                        {canRegister && (
                            <Button
                                onClick={handleRegisterPoC}
                                disabled={registering}
                                className="w-full"
                                variant="outline"
                            >
                                {registering ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Register PoC - $200
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}
                
                {/* Error message */}
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

