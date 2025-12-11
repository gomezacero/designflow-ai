import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const LoginScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!fullName.trim()) throw new Error('Full name is required');
        const { error: signUpError } = await signup(email, password, fullName);
        if (signUpError) throw signUpError;
        // Supabase often requires email confirmation by default, warn user
        setError('Account created! Please check your email to confirm before logging in.');
        setIsSignUp(false); // Switch back to login
      } else {
        const { error: loginError } = await login(email, password);
        if (loginError) throw loginError;
        // Success handled by Auth State listener in hook
      }
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[32px] p-8 md:p-12 flex flex-col items-center animate-[floatUp_0.5s_ease-out]">

        {/* Logo */}
        <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white shadow-lg mb-6">
           <span className="font-bold text-xl tracking-tight">DF</span>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {isSignUp ? 'Create Account' : 'Welcome back'}
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8 px-4 leading-relaxed">
          {isSignUp ? 'Join the team and start automating.' : 'Manage your design workflows with AI.'}
        </p>

        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 w-full">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
            
            {isSignUp && (
                <div className="space-y-1.5 animate-slideDown">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            required={isSignUp}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="you@company.com"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="password" 
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading} 
                className="w-full mt-4 py-3.5 justify-center shadow-lg shadow-blue-500/20"
            >
                {isLoading ? 'Processing...' : (
                    <span className="flex items-center gap-2">
                        {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
                    </span>
                )}
            </Button>

        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 w-full flex justify-center">
            <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
        </div>
      </div>
    </div>
  );
};