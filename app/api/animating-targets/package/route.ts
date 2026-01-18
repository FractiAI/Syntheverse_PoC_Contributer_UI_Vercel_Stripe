/**
 * Animating Selectable Targets Package API
 * 
 * Enterprise service for animating selectable targets with holographic blackhole ^7 Vibeverse energy
 * Priced according to Vibeverse energy levels
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkFrequentFlierStatus } from '@/utils/vibeverse/frequent-flier';

export const dynamic = 'force-dynamic';

/**
 * GET: Get available packages with pricing
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userEmail = user?.email || null;
    let frequentFlierStatus = null;

    if (userEmail) {
      frequentFlierStatus = await checkFrequentFlierStatus(userEmail);
    }

    const packages = [
      {
        id: 'quantum',
        name: 'Quantum Targets',
        description: 'Basic animating selectable targets with holographic blackhole energy',
        vibeverseEnergy: 1,
        basePrice: 500,
        targets: 5,
        features: [
          '5 animating selectable targets',
          'Basic holographic blackhole animations',
          '^7 Vibeverse energy level 1',
          'Omniexperience awareness tracking',
          'Portability across sessions',
        ],
        animations: ['float', 'pulse', 'glow'],
        certifications: ['omnibeam'],
        frequentFlierDiscount: 10,
      },
      {
        id: 'resonance',
        name: 'Resonance Targets',
        description: 'Enhanced animating targets with medium Vibeverse energy',
        vibeverseEnergy: 3,
        basePrice: 1500,
        targets: 15,
        features: [
          '15 animating selectable targets',
          'Enhanced holographic blackhole animations',
          '^7 Vibeverse energy level 3',
          'Advanced omniexperience awareness',
          'Cross-platform portability',
          'Continuity tracking',
        ],
        animations: ['float', 'pulse', 'glow', 'spin', 'shimmer'],
        certifications: ['synthscan', 'omnibeam'],
        frequentFlierDiscount: 15,
      },
      {
        id: 'singularity',
        name: 'Singularity Targets',
        description: 'Maximum animating targets with full ^7 Vibeverse energy',
        vibeverseEnergy: 7,
        basePrice: 5000,
        targets: 50,
        features: [
          '50 animating selectable targets',
          'Full holographic blackhole animations',
          '^7 Vibeverse energy level 7 (maximum)',
          'Complete omniexperience awareness',
          'Universal portability',
          'Full continuity tracking',
          'Automatic seamless integration',
          'Priority support',
        ],
        animations: ['float', 'pulse', 'glow', 'spin', 'shimmer', 'wave', 'orbit', 'resonate'],
        certifications: ['synthscan', 'omnibeam'],
        frequentFlierDiscount: 25,
      },
    ];

    // Apply frequent flier discounts if applicable
    const packagesWithPricing = packages.map(pkg => {
      let finalPrice = pkg.basePrice;
      if (frequentFlierStatus?.isActive && pkg.frequentFlierDiscount) {
        finalPrice = pkg.basePrice * (1 - pkg.frequentFlierDiscount / 100);
      }

      return {
        ...pkg,
        price: finalPrice,
        discountedPrice: frequentFlierStatus?.isActive ? finalPrice : null,
        originalPrice: pkg.basePrice,
      };
    });

    return NextResponse.json({
      success: true,
      packages: packagesWithPricing,
      frequentFlier: frequentFlierStatus,
      message: 'Animating Selectable Targets Packages retrieved',
    });
  } catch (error) {
    console.error('[Animating Targets API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get packages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Purchase/Activate package
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, paymentMethod } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID required' },
        { status: 400 }
      );
    }

    // Get package details
    const response = await fetch(`${request.url.split('/api')[0]}/api/animating-targets/package`);
    const data = await response.json();
    const selectedPackage = data.packages.find((p: any) => p.id === packageId);

    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Check frequent flier status for pricing
    const frequentFlierStatus = await checkFrequentFlierStatus(user.email);
    const finalPrice = frequentFlierStatus?.isActive && selectedPackage.frequentFlierDiscount
      ? selectedPackage.price
      : selectedPackage.basePrice;

    // Process payment (integrate with existing payment system)
    // For now, return success (actual payment processing would go here)

    return NextResponse.json({
      success: true,
      package: selectedPackage,
      price: finalPrice,
      frequentFlierDiscount: frequentFlierStatus?.isActive ? selectedPackage.frequentFlierDiscount : 0,
      message: 'Package activated successfully',
    });
  } catch (error) {
    console.error('[Animating Targets API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to activate package',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
