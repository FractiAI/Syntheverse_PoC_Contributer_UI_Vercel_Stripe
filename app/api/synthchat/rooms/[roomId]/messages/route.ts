/**
 * Get messages for a specific SynthChat room
 * GET /api/synthchat/rooms/[roomId]/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = params;

    // Verify user is a participant of this room
    const { data: participant } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_email', user.email)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant of this room' }, { status: 403 });
    }

    // Fetch messages with sender information
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        room_id,
        sender_email,
        sender_role,
        message,
        image_url,
        file_url,
        file_name,
        created_at
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(500); // Limit to last 500 messages

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Get sender names from users table
    const senderEmails = [...new Set(messages?.map(m => m.sender_email) || [])];
    const { data: users } = await supabase
      .from('users')
      .select('email, name')
      .in('email', senderEmails);

    // Map sender names to messages
    const messagesWithNames = messages?.map(msg => ({
      ...msg,
      sender_name: users?.find(u => u.email === msg.sender_email)?.name || null,
    }));

    return NextResponse.json({
      messages: messagesWithNames || [],
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
