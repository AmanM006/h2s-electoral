'use client';

import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (!auth || !googleProvider) return;
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-border-subtle">
        <Loader2 size={14} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-300">{user.displayName}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-widest">Citizen</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border-subtle hover:border-red-500/50 hover:bg-red-500/10 transition-colors group"
          aria-label="Sign out"
          title="Sign out"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="User avatar" className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-20" />
          ) : (
            <UserIcon size={14} className="text-gray-400" />
          )}
          <LogOut size={12} className="absolute text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors"
      aria-label="Sign in with Google"
    >
      <LogIn size={14} />
      <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Sign In</span>
    </button>
  );
}
