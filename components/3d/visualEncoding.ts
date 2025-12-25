/**
 * Visual Encoding Utilities for 3D PoC Nodes
 * 
 * Converts PoC scores and metadata into visual properties:
 * - Size: Density score
 * - Color: Novelty score (blue → green → red gradient)
 * - Shape: Metal type (Gold=Icosahedron, Silver=Octahedron, Copper=Tetrahedron)
 * - Transparency: Coherence score
 */

import * as THREE from 'three'

export interface VisualEncodingParams {
    density: number // 0-2500
    novelty: number // 0-2500
    coherence: number // 0-2500
    metals: string[] // ['gold', 'silver', 'copper']
    qualified?: boolean
    allocated?: boolean
    registered?: boolean
}

export interface VisualEncodingResult {
    scale: number
    color: string // Hex color
    opacity: number // 0-1
    shape: 'icosahedron' | 'octahedron' | 'tetrahedron' | 'combined'
    glow: boolean
    border: boolean
}

/**
 * Calculate node size based on density score
 * Range: 0.3x to 3.0x base size
 */
export function calculateSize(density: number): number {
    const normalized = density / 2500 // 0-1
    const minScale = 0.3
    const maxScale = 3.0
    return minScale + (normalized * (maxScale - minScale))
}

/**
 * Calculate node color based on novelty score
 * Gradient: Blue (low) → Green (medium) → Red (high)
 */
export function calculateColor(novelty: number): string {
    const normalized = novelty / 2500 // 0-1
    
    // HSL color: Blue (240°) → Green (120°) → Red (0°)
    let hue: number
    if (normalized < 0.5) {
        // Blue to Green: 240° to 120°
        hue = 240 - (normalized * 2 * 120)
    } else {
        // Green to Red: 120° to 0°
        hue = 120 - ((normalized - 0.5) * 2 * 120)
    }
    
    const saturation = 100
    const lightness = 50
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Convert hex color to THREE.Color
 */
export function hexToThreeColor(hex: string): THREE.Color {
    return new THREE.Color(hex)
}

/**
 * Calculate opacity based on coherence score
 * Range: 0.3 (low) to 1.0 (high)
 */
export function calculateOpacity(coherence: number): number {
    const normalized = coherence / 2500 // 0-1
    const minOpacity = 0.3
    const maxOpacity = 1.0
    return minOpacity + (normalized * (maxOpacity - minOpacity))
}

/**
 * Determine shape based on metals
 */
export function determineShape(metals: string[]): 'icosahedron' | 'octahedron' | 'tetrahedron' | 'combined' {
    const normalized = metals.map(m => m.toLowerCase())
    const hasGold = normalized.includes('gold')
    const hasSilver = normalized.includes('silver')
    const hasCopper = normalized.includes('copper')
    
    const count = [hasGold, hasSilver, hasCopper].filter(Boolean).length
    
    if (count === 0) {
        return 'tetrahedron' // Default
    }
    
    if (count > 1) {
        return 'combined' // Multiple metals = combined shape
    }
    
    if (hasGold) return 'icosahedron'
    if (hasSilver) return 'octahedron'
    if (hasCopper) return 'tetrahedron'
    
    return 'tetrahedron' // Default fallback
}

/**
 * Get complete visual encoding for a PoC node
 */
export function getVisualEncoding(params: VisualEncodingParams): VisualEncodingResult {
    const scale = calculateSize(params.density || 0)
    const color = calculateColor(params.novelty || 0)
    const opacity = calculateOpacity(params.coherence || 0)
    const shape = determineShape(params.metals || [])
    
    // Visual cues based on status
    const glow = params.qualified === true && params.allocated !== true
    const border = params.allocated === true || params.registered === true
    
    // Adjust opacity for non-qualified PoCs
    const finalOpacity = params.qualified === false ? opacity * 0.5 : opacity
    
    return {
        scale,
        color,
        opacity: finalOpacity,
        shape,
        glow,
        border
    }
}

/**
 * Metal color constants for badges/shapes
 */
export const METAL_COLORS = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    copper: '#CD7F32'
} as const

