/**
 * Individual PoC Node Component for 3D Map
 * 
 * Renders a single PoC as a 3D shape with visual encoding
 */

'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getVisualEncoding, hexToThreeColor } from './visualEncoding'

interface PoCNodeProps {
    position: [number, number, number]
    submissionHash: string
    title: string
    density: number
    novelty: number
    coherence: number
    metals: string[]
    qualified?: boolean
    allocated?: boolean
    registered?: boolean
    onClick?: (hash: string) => void
    selected?: boolean
}

export function PoCNode({
    position,
    submissionHash,
    title,
    density,
    novelty,
    coherence,
    metals,
    qualified = false,
    allocated = false,
    registered = false,
    onClick,
    selected = false
}: PoCNodeProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    
    // Calculate visual encoding
    const encoding = useMemo(() => getVisualEncoding({
        density,
        novelty,
        coherence,
        metals,
        qualified,
        allocated,
        registered
    }), [density, novelty, coherence, metals, qualified, allocated, registered])
    
    // Create geometry based on shape
    const geometry = useMemo(() => {
        let geom: THREE.BufferGeometry
        switch (encoding.shape) {
            case 'icosahedron':
                geom = new THREE.IcosahedronGeometry(1, 0)
                break
            case 'octahedron':
                geom = new THREE.OctahedronGeometry(1, 0)
                break
            case 'tetrahedron':
                geom = new THREE.TetrahedronGeometry(1, 0)
                break
            case 'combined':
                // Use dodecahedron as combined shape
                geom = new THREE.DodecahedronGeometry(1, 0)
                break
            default:
                geom = new THREE.TetrahedronGeometry(1, 0)
        }
        return geom
    }, [encoding.shape])
    
    // Material with color and opacity
    const material = useMemo(() => {
        try {
            // Convert HSL to RGB for Three.js
            let color: THREE.Color
            if (encoding.color.startsWith('hsl')) {
                // Parse HSL: hsl(240, 100%, 50%)
                const match = encoding.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
                if (match) {
                    const h = parseInt(match[1]) / 360
                    const s = parseInt(match[2]) / 100
                    const l = parseInt(match[3]) / 100
                    color = new THREE.Color().setHSL(h, s, l)
                } else {
                    color = new THREE.Color(encoding.color)
                }
            } else {
                color = new THREE.Color(encoding.color)
            }
            
            return new THREE.MeshStandardMaterial({
                color,
                opacity: encoding.opacity,
                transparent: encoding.opacity < 1.0,
                emissive: encoding.glow ? color.clone() : new THREE.Color(0x000000),
                emissiveIntensity: encoding.glow ? 0.3 : 0,
            })
        } catch (error) {
            console.error('Error creating material:', error, 'Color:', encoding.color)
            return new THREE.MeshStandardMaterial({
                color: 0x888888,
                opacity: encoding.opacity,
                transparent: encoding.opacity < 1.0,
            })
        }
    }, [encoding.color, encoding.opacity, encoding.glow])
    
    // Border/outline material for allocated/registered nodes
    const outlineMaterial = useMemo(() => {
        if (!encoding.border) return null
        
        const borderColor = allocated ? 0xFFD700 : 0x3B82F6 // Gold for allocated, blue for registered
        return new THREE.MeshBasicMaterial({
            color: borderColor,
            side: THREE.BackSide
        })
    }, [encoding.border, allocated])
    
    // Hover/selection effect
    useFrame((state) => {
        if (meshRef.current) {
            // Subtle rotation
            meshRef.current.rotation.y += 0.005
            
            // Pulsing effect if selected
            if (selected) {
                const scale = encoding.scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
                meshRef.current.scale.set(scale, scale, scale)
            } else {
                meshRef.current.scale.set(encoding.scale, encoding.scale, encoding.scale)
            }
        }
    })
    
    const handleClick = (e: any) => {
        e.stopPropagation()
        onClick?.(submissionHash)
    }
    
    return (
        <group position={position}>
            {/* Main node */}
            <mesh
                ref={meshRef}
                geometry={geometry}
                material={material}
                onClick={handleClick}
                onPointerOver={(e) => {
                    e.stopPropagation()
                    document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto'
                }}
            />
            
            {/* Outline for allocated/registered nodes */}
            {outlineMaterial && (
                <mesh
                    geometry={geometry}
                    material={outlineMaterial}
                    scale={encoding.scale * 1.1}
                    onClick={handleClick}
                />
            )}
            
            {/* Title label (only on hover/select - will be handled by parent) */}
        </group>
    )
}

