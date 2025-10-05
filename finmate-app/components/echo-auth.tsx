'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { User, LogOut, Coins } from 'lucide-react';

export function EchoAuth() {
  const { user, signIn, signOut, isLoading } = useEcho();

  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium animate-pulse">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <User className="w-4 h-4" />
        Sign In with Echo
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User balance - Echo manages credits automatically */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <Coins className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-green-700">
          Echo Credits
        </span>
      </div>

      {/* User info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <User className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {user.email || user.id || 'User'}
        </span>
      </div>

      {/* Sign out button */}
      <button
        onClick={signOut}
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
