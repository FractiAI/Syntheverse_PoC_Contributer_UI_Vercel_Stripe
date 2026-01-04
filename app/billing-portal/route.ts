import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateStripeBillingPortalLink } from '@/utils/stripe/api';
import { debug, debugError } from '@/utils/debug';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  debug('BillingPortal', 'Billing portal route accessed', { origin });

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    debug('BillingPortal', 'Auth check completed', {
      hasUser: !!user,
      hasEmail: !!user?.email,
      authError: authError?.message,
    });

    // If no user, redirect to login
    if (authError || !user || !user.email) {
      debug('BillingPortal', 'No user found, redirecting to login');
      return NextResponse.redirect(new URL('/login', origin));
    }

    debug('BillingPortal', 'Generating billing portal link', { email: user.email });

    // Generate billing portal link - this function handles all errors internally
    let portalUrl: string;
    try {
      portalUrl = await generateStripeBillingPortalLink(user.email);
    } catch (linkError) {
      debugError('BillingPortal', 'Error in generateStripeBillingPortalLink', linkError);
      // Fallback to subscribe page
      portalUrl = '/subscribe';
    }

    debug('BillingPortal', 'Portal URL generated', {
      portalUrl,
      isValid: portalUrl?.startsWith('http'),
    });

    // If we got a Stripe portal URL, redirect there
    if (portalUrl && portalUrl.startsWith('http')) {
      debug('BillingPortal', 'Redirecting to Stripe billing portal', { portalUrl });
      return NextResponse.redirect(portalUrl);
    }

    // Otherwise redirect to subscribe page (relative or absolute)
    debug('BillingPortal', 'Redirecting to subscribe page', { portalUrl });
    if (portalUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(portalUrl, origin));
    }
    return NextResponse.redirect(new URL('/subscribe', origin));
  } catch (error) {
    debugError('BillingPortal', 'Error in billing portal route', error);
    // On any error, redirect to subscribe page
    return NextResponse.redirect(new URL('/subscribe', origin));
  }
}
