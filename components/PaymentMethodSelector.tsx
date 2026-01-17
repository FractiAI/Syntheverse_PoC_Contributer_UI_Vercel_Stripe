/**
 * Payment Method Selector
 * 
 * Allows users to select payment method:
 * - On-chain
 * - Stripe
 * - Venmo
 * - Cash App
 * - Top-scoring blockchain method (NSPFRP-selected)
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Coins, Wallet, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'onchain' | 'stripe' | 'venmo' | 'cashapp' | 'blockchain';
  enabled: boolean;
  icon: React.ReactNode;
  description: string;
  score?: number;
}

interface PaymentMethodSelectorProps {
  amount: number;
  currency?: string;
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod | null;
}

export function PaymentMethodSelector({
  amount,
  currency = 'usd',
  onMethodSelect,
  selectedMethod,
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [topBlockchain, setTopBlockchain] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/methods?includeScores=true');
      const data = await response.json();

      if (data.success && data.methods) {
        const methodList: PaymentMethod[] = data.methods.map((m: any) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          enabled: m.enabled,
          icon: getMethodIcon(m.type),
          description: getMethodDescription(m.type, m),
          score: m.score,
        }));

        setMethods(methodList);

        // Set top blockchain method
        if (data.topBlockchainMethod) {
          const top = data.topBlockchainMethod;
          setTopBlockchain({
            id: top.id,
            name: top.name,
            type: 'blockchain',
            enabled: top.enabled,
            icon: getMethodIcon('blockchain'),
            description: `Top-scoring blockchain method (NSPFRP-selected): ${top.name}`,
            score: top.score,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'onchain':
        return <Coins className="w-5 h-5" />;
      case 'stripe':
        return <CreditCard className="w-5 h-5" />;
      case 'venmo':
        return <Smartphone className="w-5 h-5" />;
      case 'cashapp':
        return <Smartphone className="w-5 h-5" />;
      case 'blockchain':
        return <Zap className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getMethodDescription = (type: string, method: any): string => {
    switch (type) {
      case 'onchain':
        return 'Direct blockchain payment on Base Mainnet';
      case 'stripe':
        return 'Credit/debit card payment via Stripe';
      case 'venmo':
        return 'Quick payment via Venmo';
      case 'cashapp':
        return 'Quick payment via Cash App';
      case 'blockchain':
        return method.score
          ? `Top-scoring blockchain method (Score: ${method.score.toFixed(2)})`
          : 'Blockchain payment method';
      default:
        return 'Payment method';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Select Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method. Amount: {currency.toUpperCase()} {amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {methods.map((method) => (
          <Button
            key={method.id}
            variant={selectedMethod?.id === method.id ? 'default' : 'outline'}
            className="w-full justify-start h-auto p-4"
            onClick={() => onMethodSelect(method)}
            disabled={!method.enabled}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {method.icon}
                <div className="text-left">
                  <div className="font-semibold">{method.name}</div>
                  <div className="text-xs text-muted-foreground">{method.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.score && (
                  <Badge variant="secondary" className="text-xs">
                    Score: {method.score.toFixed(2)}
                  </Badge>
                )}
                {selectedMethod?.id === method.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          </Button>
        ))}

        {topBlockchain && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              🏆 Top-Scoring Blockchain Method (NSPFRP-Selected)
            </div>
            <Button
              variant={selectedMethod?.id === topBlockchain.id ? 'default' : 'outline'}
              className="w-full justify-start h-auto p-4"
              onClick={() => onMethodSelect(topBlockchain)}
              disabled={!topBlockchain.enabled}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {topBlockchain.icon}
                  <div className="text-left">
                    <div className="font-semibold">{topBlockchain.name}</div>
                    <div className="text-xs text-muted-foreground">{topBlockchain.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {topBlockchain.score && (
                    <Badge variant="default" className="text-xs">
                      Top: {topBlockchain.score.toFixed(2)}
                    </Badge>
                  )}
                  {selectedMethod?.id === topBlockchain.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
