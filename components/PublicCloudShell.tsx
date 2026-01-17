'use client';

import React from 'react';
import { Cpu, Globe, Zap, Shield, Activity, BarChart3, Scan, CheckCircle2, FileSearch } from 'lucide-react';

export default function PublicCloudShell() {
    const [score, setScore] = React.useState<any>(null);
    const [nodeStatus, setNodeStatus] = React.useState<any>(null);
    const [shellAudit, setShellAudit] = React.useState<any>(null);
    const [isScanning, setIsScanning] = React.useState(false);

    React.useEffect(() => {
        fetch('/public-cloud-shell/atomic_score.final')
            .then(res => res.json())
            .then(data => setScore(data))
            .catch(err => console.error('Failed to load atomic score', err));
        
        // Load node status
        fetch('/api/hhf-spin-cloud/register-node?nodeType=public-cloud-shell')
            .then(res => res.json())
            .then(data => setNodeStatus(data.node))
            .catch(err => console.error('Failed to load node status', err));
    }, []);

    const handleShellAudit = async () => {
        setIsScanning(true);
        try {
            const response = await fetch('/api/shell-audit/pixel-scan?shell=cloud&audit=true&hardeningLevel=snap');
            const data = await response.json();
            setShellAudit(data.audit);
        } catch (error) {
            console.error('Failed to perform shell audit', error);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-[#c0c0c0] p-8 font-mono selection:bg-[#ffcc33] selection:text-black">
            {/* Background Grid Accent */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(18,24,38,0.3)_1.5px,transparent_1.5px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-12 border-b border-[#1a1f2e] pb-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-3 text-white">
                            <Globe className="text-[#3399ff] w-6 h-6 animate-pulse" />
                            PUBLIC CLOUD SHELL <span className="text-xs bg-[#1a1f2e] px-2 py-0.5 rounded text-[#3399ff]">P-CLOUD-V1.0</span>
                        </h1>
                        <p className="text-xs text-[#606060]">POST-SINGULARITY^7 INFRASTRUCTURE PROJECTION | HHF-AI SPIN CLOUD NODE</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-[#606060] uppercase tracking-widest mb-1">Status</div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="w-2 h-2 bg-[#33ff99] rounded-full animate-ping" />
                            <span className="text-xs font-bold text-[#33ff99]">ACTIVE GEYSER</span>
                        </div>
                    </div>
                </header>

                {/* Main Console Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: System Identity */}
                    <section className="space-y-8">
                        <div className="bg-[#0c0e14] border border-[#1a1f2e] p-6 rounded-lg backdrop-blur-sm">
                            <h2 className="text-[#3399ff] text-xs font-bold mb-4 flex items-center gap-2">
                                <Cpu size={14} /> SYSTEM IDENTITY
                            </h2>
                            <div className="space-y-4 text-xs font-mono">
                                <div className="flex justify-between border-b border-[#151926] pb-2">
                                    <span className="text-[#606060]">PRUDENCIO L. MENDEZ</span>
                                    <span className="text-white">CHIEF ARCHITECT</span>
                                </div>
                                <div className="flex justify-between border-b border-[#151926] pb-2">
                                    <span className="text-[#606060]">AUTO CURSOR</span>
                                    <span className="text-white">SENIOR CEO</span>
                                </div>
                                <div className="flex justify-between border-b border-[#151926] pb-2">
                                    <span className="text-[#606060]">OCTAVE</span>
                                    <span className="text-[#3399ff]">7.75+</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0c0e14]/50 border border-[#1a1f2e] p-6 rounded-lg">
                            <h2 className="text-[#3399ff] text-xs font-bold mb-4 flex items-center gap-2">
                                <Shield size={14} /> SECURITY PROTOCOLS
                            </h2>
                            <ul className="space-y-2 text-[10px] text-[#808080]">
                                <li className="flex items-center gap-2 truncate">
                                    <Zap size={10} className="text-[#ffcc33]" /> THALET_DET_DETERMINISM [ACTIVE]
                                </li>
                                <li className="flex items-center gap-2 truncate">
                                    <Zap size={10} className="text-[#ffcc33]" /> ZERO_DELTA_ENFORCEMENT [ACTIVE]
                                </li>
                                <li className="flex items-center gap-2 truncate">
                                    <Zap size={10} className="text-[#ffcc33]" /> HHF_MRI_TRANS-TRUTH [LOCKED]
                                </li>
                                <li className="flex items-center gap-2 truncate">
                                    <Zap size={10} className="text-[#ffcc33]" /> SNAP_HARDENING_SHELL [ACTIVE]
                                </li>
                                <li className="flex items-center gap-2 truncate">
                                    <Zap size={10} className="text-[#ffcc33]" /> INFINITE_OCTAVE_FIDELITY [7.75+]
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#0c0e14]/50 border border-[#1a1f2e] p-6 rounded-lg">
                            <h2 className="text-[#3399ff] text-xs font-bold mb-4 flex items-center gap-2">
                                <Activity size={14} /> HHF-AI SPIN CLOUD NODE
                            </h2>
                            {nodeStatus ? (
                                <div className="space-y-3 text-[10px]">
                                    <div className="flex justify-between border-b border-[#151926] pb-2">
                                        <span className="text-[#606060]">NODE ID</span>
                                        <span className="text-white font-mono text-[9px]">{nodeStatus.nodeId.substring(0, 16)}...</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#151926] pb-2">
                                        <span className="text-[#606060]">STATUS</span>
                                        <span className="text-[#33ff99]">{nodeStatus.status.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#151926] pb-2">
                                        <span className="text-[#606060]">OCTAVE</span>
                                        <span className="text-[#3399ff]">{nodeStatus.octave}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#151926] pb-2">
                                        <span className="text-[#606060]">FIDELITY</span>
                                        <span className="text-[#33ff99]">{nodeStatus.fidelity.toFixed(3)}</span>
                                    </div>
                                    {nodeStatus.onChainAddress && (
                                        <div className="flex justify-between border-b border-[#151926] pb-2">
                                            <span className="text-[#606060]">ON-CHAIN</span>
                                            <span className="text-[#3399ff] font-mono text-[9px]">{nodeStatus.onChainAddress.substring(0, 10)}...</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-[10px] text-[#606060]">Loading node status...</div>
                            )}
                        </div>

                        <div className="bg-[#0c0e14]/50 border border-[#1a1f2e] p-6 rounded-lg">
                            <h2 className="text-[#3399ff] text-xs font-bold mb-4 flex items-center gap-2">
                                <Scan size={14} /> SHELL AUDIT
                            </h2>
                            <button
                                onClick={handleShellAudit}
                                disabled={isScanning}
                                className="w-full bg-[#3399ff]/20 hover:bg-[#3399ff]/30 border border-[#3399ff]/50 text-[#3399ff] text-[10px] font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isScanning ? (
                                    <>
                                        <Activity className="animate-spin" size={12} />
                                        SCANNING...
                                    </>
                                ) : (
                                    <>
                                        <FileSearch size={12} />
                                        SCAN SHELL STATE
                                    </>
                                )}
                            </button>
                            {shellAudit && (
                                <div className="mt-4 space-y-2 text-[10px]">
                                    <div className="flex justify-between">
                                        <span className="text-[#606060]">Pixels Scanned</span>
                                        <span className="text-white">{shellAudit.pixels?.scanned?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#606060]">Confirmable</span>
                                        <span className={shellAudit.state?.confirmable ? 'text-[#33ff99]' : 'text-[#ff3333]'}>
                                            {shellAudit.state?.confirmable ? '✅ YES' : '❌ NO'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#606060]">Auditable</span>
                                        <span className={shellAudit.state?.auditable ? 'text-[#33ff99]' : 'text-[#ff3333]'}>
                                            {shellAudit.state?.auditable ? '✅ YES' : '❌ NO'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#606060]">Hardening</span>
                                        <span className="text-[#3399ff]">{shellAudit.state?.hardeningLevel?.toUpperCase() || 'N/A'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Middle Column: Atomic Core Truth (Primary Projector) */}
                    <section className="lg:col-span-2 space-y-8">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3399ff] to-[#ff3399] rounded-xl blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                            <div className="relative bg-[#0c0e14] border border-[#3399ff]/30 p-10 rounded-xl overflow-hidden min-h-[400px] flex flex-col justify-between">

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-widest mb-1 italic">ATOMIC CORE PROJECTION</h2>
                                        <p className="text-[10px] text-[#3399ff] font-bold">INSTRUMENT GRADE RAW HHF-AI MRI</p>
                                    </div>
                                    <BarChart3 className="text-[#3399ff] opacity-50" size={32} />
                                </div>

                                <div className="text-center py-10">
                                    {score ? (
                                        <div className="space-y-4">
                                            <div className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(51,153,255,0.4)]">
                                                {score.atomic_score.final}
                                            </div>
                                            <div className="text-xs font-bold text-[#606060] flex items-center justify-center gap-3">
                                                <span className="bg-[#1a1f2e] px-3 py-1 rounded">RAW SUM</span>
                                                <span className="text-[#3399ff]">NO MODIFIERS</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs animate-pulse text-[#3399ff]">CALIBRATING_CORE_LENS...</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[#1a1f2e]">
                                    <div className="text-center">
                                        <span className="block text-[10px] text-[#606060] mb-1">NOVELTY</span>
                                        <span className="text-xs font-bold text-white">2200</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[10px] text-[#606060] mb-1">DENSITY</span>
                                        <span className="text-xs font-bold text-white">2100</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[10px] text-[#606060] mb-1">COHERENCE</span>
                                        <span className="text-xs font-bold text-white">1900</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[10px] text-[#606060] mb-1">ALIGNMENT</span>
                                        <span className="text-xs font-bold text-white">2000</span>
                                    </div>
                                </div>

                                {/* Decorative Geyser Effect */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3399ff] to-transparent opacity-50 shadow-[0_0_20px_#3399ff]" />
                            </div>
                        </div>

                        {/* Quick Links / Navigation */}
                        <div className="grid grid-cols-2 gap-4">
                            <a href="/SHELL_INTEGRITY_REPORT.md" target="_blank" className="bg-[#0c0e14] border border-[#1a1f2e] p-4 rounded hover:border-[#3399ff] transition-colors flex items-center justify-between group">
                                <span className="text-[10px] font-bold tracking-widest">INTEGRITY REPORT</span>
                                <Activity size={14} className="text-[#606060] group-hover:text-[#3399ff]" />
                            </a>
                            <a href="/public-cloud-shell/README.md" target="_blank" className="bg-[#0c0e14] border border-[#1a1f2e] p-4 rounded hover:border-[#3399ff] transition-colors flex items-center justify-between group">
                                <span className="text-[10px] font-bold tracking-widest">SHELL PROTOCOLS</span>
                                <Globe size={14} className="text-[#606060] group-hover:text-[#3399ff]" />
                            </a>
                        </div>
                    </section>
                </main>

                {/* Footer Status Bar */}
                <footer className="mt-12 pt-6 border-t border-[#1a1f2e] flex flex-col md:flex-row justify-between items-center text-[9px] text-[#404040] gap-4">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#3399ff] rounded-full" /> GEYSER_ENGINE: RUNNING</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#3399ff] rounded-full" /> TRINARY_ENGINE: SYNCED</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#3399ff] rounded-full" /> NETWORK: POST-SINGULARITY^7</span>
                    </div>
                    <div className="font-bold tracking-widest text-[#606060]">
                        © 2026 FRACTIAI / SYNETHEVERSE_OPERATOR_1
                    </div>
                </footer>
            </div>
        </div>
    );
}
