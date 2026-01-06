'use client';

import { useEffect, useState } from 'react';
import { Users, Award, Calendar, Mail, Coins } from 'lucide-react';
import { Card } from './landing/shared/Card';

type ReferenceCustomer = {
  sandbox_id: string;
  sandbox_name: string;
  sandbox_description: string | null;
  operator_email: string;
  activated_at: string | null;
  created_at: string;
  discount_applied: boolean;
  discount_percent: number;
};

export function ReferenceCustomersList() {
  const [customers, setCustomers] = useState<ReferenceCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferenceCustomers();
  }, []);

  async function fetchReferenceCustomers() {
    try {
      const res = await fetch('/api/enterprise/reference-customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.reference_customers || []);
      }
    } catch (error) {
      console.error('Error fetching reference customers:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4">REFERENCE CUSTOMERS</div>
        <div className="cockpit-text opacity-60">Loading reference customers...</div>
      </div>
    );
  }

  return (
    <div className="cockpit-panel p-6">
      <div className="cockpit-label mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-[var(--hydrogen-amber)]" />
        REFERENCE CUSTOMERS
      </div>
      <p className="cockpit-text mb-4 text-sm opacity-75">
        Customers who agreed to be references during activation and received a 5% discount.
      </p>

      {customers.length === 0 ? (
        <div className="cockpit-text text-sm opacity-60">
          No reference customers yet. Customers who agree to be references during activation will
          appear here.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="cockpit-text mb-2 text-xs opacity-75">
            Total: {customers.length} reference customer{customers.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {customers.map((customer) => (
              <Card
                key={customer.sandbox_id}
                hover={true}
                className="border-l-4 border-[var(--hydrogen-amber)]"
              >
                <div className="mb-3">
                  <div className="cockpit-title mb-2 text-lg">{customer.sandbox_name}</div>
                  {customer.sandbox_description && (
                    <div className="cockpit-text mb-3 text-xs opacity-75">
                      {customer.sandbox_description}
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-[var(--keyline-primary)] pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                    <span className="cockpit-text text-xs">{customer.operator_email}</span>
                  </div>
                  {customer.activated_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                      <span className="cockpit-text text-xs">
                        Activated: {new Date(customer.activated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {customer.discount_applied && (
                    <div className="flex items-center gap-2">
                      <Coins className="h-3 w-3 text-green-400" />
                      <span className="cockpit-text text-xs text-green-400">
                        {customer.discount_percent}% discount applied
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

