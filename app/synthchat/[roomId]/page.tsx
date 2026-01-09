/**
 * SynthChat Room Page
 * Dedicated page for WhatsApp/iPhone-style chat interface
 * Route: /synthchat/[roomId]
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SynthChatRoomInterface } from '@/components/SynthChatRoomInterface';

interface SynthChatRoomPageProps {
  params: {
    roomId: string;
  };
  searchParams: {
    search?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function SynthChatRoomPage({ params, searchParams }: SynthChatRoomPageProps) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { roomId } = params;
  const searchTerm = searchParams.search || '';

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <SynthChatRoomInterface 
        roomId={roomId} 
        userEmail={data.user.email!}
        searchTerm={searchTerm}
      />
    </div>
  );
}

