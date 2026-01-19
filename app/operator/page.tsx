import React from 'react';
import HeroOperatorPanel from '@/components/HeroOperatorPanel';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle2, Zap } from 'lucide-react';

export default async function OperatorPage() {
    const { user, isOperator } = await getAuthenticatedUserWithRole();

    if (!user || !isOperator) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Professional Header */}
                <header className="mb-12">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Full Fidelity Animation Experience Console
                                </h1>
                            </div>
                            <p className="text-sm text-slate-600 ml-13">
                                Octave 2-3 Public Cloud Shell · Authorized Operator Station
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-semibold text-green-900 uppercase tracking-wider">
                                    Authorized
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                        </div>
                    </div>
                </header>

                {/* Hero Operator Panel in Clean Card */}
                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Hero Management</CardTitle>
                        <CardDescription>Manage hero configurations and interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HeroOperatorPanel />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
