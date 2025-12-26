/**
 * Client-only Canvas wrapper for Three.js
 * This component ensures Three.js only loads in the browser
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

interface Map3DCanvasProps {
    children: React.ReactNode
    bounds: {
        center: [number, number, number]
        range: number
    }
}

export function Map3DCanvas({ children, bounds }: Map3DCanvasProps) {
    const [canRender, setCanRender] = useState(false)
    const [webglSupported, setWebglSupported] = useState(false)

    useEffect(() => {
        // Check if we're in browser
        if (typeof window === 'undefined') return

        // Check WebGL support
        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            if (gl) {
                setWebglSupported(true)
                setCanRender(true)
            } else {
                console.warn('WebGL not supported')
            }
        } catch (e) {
            console.error('WebGL check failed:', e)
        }
    }, [])

    if (!canRender || !webglSupported) {
        return (
            <div className="flex items-center justify-center h-[800px] bg-muted/50 rounded-lg">
                <div className="text-center">
                    <p className="text-muted-foreground">Initializing 3D renderer...</p>
                    {!webglSupported && (
                        <p className="text-sm text-destructive mt-2">WebGL not supported in this browser</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <Canvas
            gl={{ 
                antialias: true, 
                alpha: true,
                powerPreference: "high-performance"
            }}
            dpr={[1, 2]}
            onCreated={(state) => {
                // Ensure WebGL context is valid
                if (!state.gl.getContext()) {
                    console.error('Failed to create WebGL context')
                }
            }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                {/* Grid helper */}
                <Grid args={[100, 100]} cellColor="#6b7280" sectionColor="#9ca3af" />
                
                {children}
                
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={(bounds.range || 100) * 0.3}
                    maxDistance={(bounds.range || 100) * 5}
                    target={bounds.center}
                />
            </Suspense>
        </Canvas>
    )
}

