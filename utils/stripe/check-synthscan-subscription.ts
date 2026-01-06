import Stripe from 'stripe';
import { debug, debugError } from '@/utils/debug';

/**
 * Check if user has an active SynthScan subscription
 * Returns subscription details if active, null otherwise
 */
export async function hasActiveSynthScanSubscription(
  email: string
): Promise<{ tier: string; nodeCount: number; subscriptionId: string } | null> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return null;
    }

    const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
    const stripe = new Stripe(sanitizedKey, {
      apiVersion: '2024-06-20',
    });

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return null;
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 100,
    });

    // Find SynthScan subscription
    for (const subscription of subscriptions.data) {
      if (subscription.metadata?.product_type === 'synthscan_monthly_access') {
        return {
          tier: subscription.metadata.tier || 'Unknown',
          nodeCount: parseInt(subscription.metadata.node_count || '1'),
          subscriptionId: subscription.id,
        };
      }
    }

    return null;
  } catch (error) {
    debugError('hasActiveSynthScanSubscription', 'Error checking SynthScan subscription', error);
    return null;
  }
}

