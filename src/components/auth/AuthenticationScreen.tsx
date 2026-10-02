import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { LockKeyhole, Mail, Store } from 'lucide-react';
import { auth } from '../../lib/firebase';

export const AuthenticationScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setLoading(true);
    try {
      if (isSignup) await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch { setError('We could not complete your request. Check your email and password, then try again.'); }
    finally { setLoading(false); }
  };
  return <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-7 shadow-sm space-y-5">
      <div className="text-center"><div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center"><Store className="h-6 w-6" /></div><h1 className="text-xl font-black text-stone-900">DailyMart</h1><p className="mt-1 text-sm text-stone-500">{isSignup ? 'Create your account' : 'Log in to continue'}</p></div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">{error}</p>}
      <label className="block text-xs font-bold text-stone-700">Email<div className="relative mt-1"><Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm" placeholder="you@example.com" /></div></label>
      <label className="block text-xs font-bold text-stone-700">Password<div className="relative mt-1"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><input required minLength={8} type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm" placeholder="••••••••" /></div></label>
      <button disabled={loading} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Please wait…' : 'Continue'}</button>
      <button type="button" onClick={() => setIsSignup(!isSignup)} className="w-full text-xs font-bold text-emerald-700">{isSignup ? 'Already have an account? Log in' : 'New to DailyMart? Create an account'}</button>
    </form>
  </main>;
};
