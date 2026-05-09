import React, { useState } from 'react';
import { LibraryBig, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created! You can now sign in.");
        setMode('signin');
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      let message = mode === 'signin' 
        ? "Failed to sign in. Please check your credentials." 
        : "Failed to create account.";

      if (err && typeof err === 'object' && 'code' in err) {
        const authErr = err as { code: string };
        const code = authErr.code;

        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          message = mode === 'signin' 
            ? "Invalid email or password. If you haven't created an account yet, please click 'Register' below to set up your administrator access." 
            : "Registration failed. Please ensure your email is formatted correctly and password is at least 6 characters.";
        } else if (code === 'auth/email-already-in-use') {
          message = "This email address is already registered. Please sign in instead.";
        } else if (code === 'auth/invalid-email') {
          message = "The email address format is invalid.";
        } else if (code === 'auth/weak-password') {
          message = "Password is too weak. Use at least 6 characters.";
        } else if (code === 'auth/user-disabled') {
          message = "This administrator account has been disabled.";
        } else if (code === 'auth/too-many-requests') {
          message = "Too many failed attempts. Please try again later.";
        } else if (code === 'auth/operation-not-allowed') {
          message = "Email/Password sign-in is not enabled. Please enable it in the Firebase Console (Auth > Sign-in method).";
        }
      }
      setError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8 bg-slate-50 z-[100]">
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.04)]">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-4 bg-indigo-600 p-3.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <LibraryBig size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lumina Library</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">{mode === 'signin' ? 'Authorized Personnel Access' : 'Administrative Registration'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signin' && (
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-3 mb-2">
                <p className="text-[9px] text-indigo-600 font-medium leading-relaxed uppercase tracking-wider">
                  Notice: Your old credentials have been upgraded to Firebase. Please register a new account if you haven't yet.
                </p>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumina.com"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-12 text-sm outline-none focus:border-indigo-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 hover:text-indigo-600 uppercase tracking-tighter"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[9px] text-slate-400 mt-1.5 px-1 font-medium">Minimum 6 characters required.</p>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <p className="text-[10px] text-rose-500 font-bold text-center uppercase tracking-wider">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                <p className="text-[10px] text-emerald-600 font-bold text-center uppercase tracking-wider">{success}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full h-11 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center shadow-sm uppercase tracking-widest mt-4 disabled:opacity-50"
            >
              {isAuthenticating ? 'Processing...' : mode === 'signin' ? 'Sign In To Library' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setSuccess(null);
              }}
              className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest hover:text-indigo-700 transition-colors"
            >
              {mode === 'signin' ? 'Need to register?' : 'Already have an account?'}
            </button>
          </div>

          {/* Footer Warning */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
              Secured access portal • Encrypted Session
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Admin Mode Active</span>
          </div>
          <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.15em]">
            System Status
          </button>
        </div>
      </motion.main>
    </div>
  );
}
