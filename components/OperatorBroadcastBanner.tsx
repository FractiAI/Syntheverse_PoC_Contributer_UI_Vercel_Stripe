/**
 * Operator Broadcast Banner
 * Displays important messages from the SYNTH90T MOTHERLODE BLOCKMINE operator
 * Dismissible with localStorage persistence
 */

'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface OperatorBroadcastBannerProps {
    message: string
    urgency?: 'low' | 'medium' | 'high' | 'critical'
    storageKey?: string
}

export function OperatorBroadcastBanner({ 
    message, 
    urgency = 'medium',
    storageKey = 'operator_broadcast_dismissed'
}: OperatorBroadcastBannerProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if banner was previously dismissed
        const dismissed = localStorage.getItem(storageKey)
        if (!dismissed) {
            setIsVisible(true)
        }
    }, [storageKey])

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        // Store dismissal in localStorage
        localStorage.setItem(storageKey, 'true')
    }

    // Don't render if dismissed
    if (isDismissed || !isVisible) {
        return null
    }

    // Get color scheme based on urgency
    const getUrgencyStyles = () => {
        switch (urgency) {
            case 'critical':
                return {
                    bg: 'bg-red-900/20',
                    border: 'border-red-500/50',
                    text: 'text-red-100',
                    icon: 'text-red-400',
                    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                }
            case 'high':
                return {
                    bg: 'bg-orange-900/20',
                    border: 'border-orange-500/50',
                    text: 'text-orange-100',
                    icon: 'text-orange-400',
                    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                }
            case 'medium':
                return {
                    bg: 'bg-[var(--hydrogen-amber)]/10',
                    border: 'border-[var(--hydrogen-amber)]/50',
                    text: 'text-[var(--hydrogen-amber)]',
                    icon: 'text-[var(--hydrogen-amber)]',
                    glow: 'shadow-[0_0_20px_rgba(255,184,77,0.2)]'
                }
            case 'low':
                return {
                    bg: 'bg-blue-900/20',
                    border: 'border-blue-500/50',
                    text: 'text-blue-100',
                    icon: 'text-blue-400',
                    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                }
            default:
                return {
                    bg: 'bg-[var(--hydrogen-amber)]/10',
                    border: 'border-[var(--hydrogen-amber)]/50',
                    text: 'text-[var(--hydrogen-amber)]',
                    icon: 'text-[var(--hydrogen-amber)]',
                    glow: 'shadow-[0_0_20px_rgba(255,184,77,0.2)]'
                }
        }
    }

    const styles = getUrgencyStyles()

    return (
        <div 
            className={`${styles.bg} ${styles.border} border-l-4 ${styles.glow} cockpit-panel p-4 mb-6 relative transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Dismiss Button - Left Side */}
                <button
                    onClick={handleDismiss}
                    className={`${styles.icon} hover:opacity-100 opacity-70 transition-opacity flex-shrink-0 mt-0.5`}
                    aria-label="Dismiss notification"
                    title="Dismiss"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Message Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="cockpit-label text-xs uppercase tracking-wider">
                            OPERATOR BROADCAST
                        </div>
                        <div className={`w-2 h-2 rounded-full ${styles.icon.replace('text-', 'bg-')} animate-pulse`}></div>
                    </div>
                    <div className={`${styles.text} cockpit-text text-sm leading-relaxed`}>
                        {message}
                    </div>
                </div>
            </div>
        </div>
    )
}

