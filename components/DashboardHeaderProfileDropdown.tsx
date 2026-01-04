import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {} from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/auth/actions';
import { debug, debugError, debugWarn } from '@/utils/debug';

export default async function DashboardHeaderProfileDropdown() {
  debug('DashboardHeaderProfileDropdown', 'Starting profile dropdown render');

  try {
    const supabase = createClient();
    debug('DashboardHeaderProfileDropdown', 'Supabase client created');

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    debug('DashboardHeaderProfileDropdown', 'Auth getUser completed', {
      hasUser: !!user,
      hasEmail: !!user?.email,
      error: error?.message,
    });

    // If there's an auth error, still render the dropdown but without user-specific features
    if (error || !user) {
      debugWarn('DashboardHeaderProfileDropdown', 'Auth error or no user', error);
    }

    return (
      <nav className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/account">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <form action={logout} className="w-full">
                <button type="submit" className="flex w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span> Log out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    );
  } catch (error) {
    debugError('DashboardHeaderProfileDropdown', 'Error rendering component', error);
    // Return a minimal fallback UI
    return (
      <nav className="flex items-center">
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </nav>
    );
  }
}
