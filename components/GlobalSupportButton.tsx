/**
 * Global Support Button - Floating action button for support/subscriptions
 * Appears on all pages except checkout flows
 */

'use client';

import { usePathname } from 'next/navigation';
import { SupportHubTrigger } from './SupportHubTrigger';

export function GlobalSupportButton() {
  const pathname = usePathname();
  
  // Don't show on checkout/payment pages to avoid distractions
  const hideOnPaths = [
    '/api/',
    '/auth/callback',
    '/webhook',
    '/billing-portal',
  ];
  
  const shouldHide = hideOnPaths.some(path => pathname?.startsWith(path));
  
  if (shouldHide) return null;
  
  return <SupportHubTrigger variant="floating" />;
}

