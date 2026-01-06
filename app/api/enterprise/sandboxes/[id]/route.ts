import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Get single sandbox
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(
        and(
          eq(enterpriseSandboxesTable.id, params.id),
          eq(enterpriseSandboxesTable.operator, user.email)
        )
      )
      .limit(1);

    if (!sandbox || sandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    return NextResponse.json({ sandbox: sandbox[0] });
  } catch (error) {
    console.error('Error fetching sandbox:', error);
    return NextResponse.json({ error: 'Failed to fetch sandbox' }, { status: 500 });
  }
}

// PATCH: Update sandbox configuration
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Verify sandbox exists and user is operator
    const existingSandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(
        and(
          eq(enterpriseSandboxesTable.id, params.id),
          eq(enterpriseSandboxesTable.operator, user.email)
        )
      )
      .limit(1);

    if (!existingSandbox || existingSandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    // Update sandbox
    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Sandbox name is required' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const updated = await db
      .update(enterpriseSandboxesTable)
      .set(updateData)
      .where(eq(enterpriseSandboxesTable.id, params.id))
      .returning();

    return NextResponse.json({ sandbox: updated[0] });
  } catch (error) {
    console.error('Error updating sandbox:', error);
    return NextResponse.json({ error: 'Failed to update sandbox' }, { status: 500 });
  }
}
