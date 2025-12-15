import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface LoginScreenProps {
    isRecoveryMode?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ isRecoveryMode = false }) => {
    const { login, signup, resetPassword, isPasswordRecovery, updatePassword } = useAuth();

    // Merge internal state (if any) with prop
    const inRecoveryMode = isRecoveryMode || isPasswordRecovery;

    const [isSignUp, setIsSignUp] = useState(false);
    const [isReset, setIsReset] = useState(false);
    // If in recovery mode, default to true for a local "isUpdateMode" or just use the prop directly
    // But we need a separate state for the UI form toggle if we want to allow going back (though recovery mode is sticky in auth)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (inRecoveryMode) {
                if (password.length < 6) throw new Error('Password must be at least 6 characters');
                const { error: updateError } = await updatePassword(password);
                if (updateError) throw updateError;
                setMessage('Password updated successfully! Redirecting...');
                // After update, we might want to reload to clear the recovery event state or rely on auth state change
                setTimeout(() => window.location.reload(), 1500);
            } else if (isReset) {
                const { error: resetError } = await resetPassword(email);
                if (resetError) throw resetError;
                setMessage('Check your email for the password reset link.');
                setIsReset(false);
            } else if (isSignUp) {
                if (!fullName.trim()) throw new Error('Full name is required');
                const { error: signUpError } = await signup(email, password, fullName);
                if (signUpError) throw signUpError;
                setMessage('Account created! Please check your email to confirm before logging in.');
                setIsSignUp(false);
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

            <div className="w-full max-w-md flex flex-col items-center animate-[floatUp_0.5s_ease-out]">

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
                        <span className="text-white font-bold text-xl tracking-tighter">DF</span>
                    </div>
                    <h1 className="text-3xl font-bold text-ios-text mb-2">
                        {inRecoveryMode ? 'Reset Password' : isReset ? 'Reset Password' : isSignUp ? 'Create account' : 'Welcome back'}
                    </h1>
                    <p className="text-ios-secondary">
                        {inRecoveryMode ? 'Enter your new password below.' : isReset ? 'Enter your email to receive instructions.' : isSignUp ? 'Start your 30-day free trial.' : 'Manage your design workflows with AI.'}
                    </p>
                </div>

                {/* Error / Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-shake relative z-10">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-fadeIn relative z-10">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {message}
                    </div>
                )}

                <div className="w-full max-w-sm relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/50">
                        <form onSubmit={handleSubmit} className="w-full space-y-4">

                            {isSignUp && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email Input - Hidden in Password Recovery Mode */}
                            {!inRecoveryMode && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {!isReset && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {inRecoveryMode ? 'New Password' : 'Password'}
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="•••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            {!isSignUp && !isReset && !inRecoveryMode && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => { setIsReset(true); setError(null); setMessage(null); }}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                className="mt-2 py-3 rounded-xl shadow-lg shadow-blue-500/30"
                                isLoading={isLoading}
                            >
                                {inRecoveryMode ? 'Update Password' : isReset ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                            </Button>


                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 w-full flex justify-center">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>
                                    {isReset
                                        ? 'Remember your password?'
                                        : isSignUp
                                            ? 'Already have an account?'
                                            : "Don't have an account?"}
                                </span>
                                <button
                                    onClick={() => {
                                        if (isReset) {
                                            setIsReset(false);
                                            setIsSignUp(false);
                                        } else {
                                            setIsSignUp(!isSignUp);
                                        }
                                        setError(null);
                                        setMessage(null);
                                    }}
                                    className="font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                                >
                                    {isReset ? 'Back to Login' : isSignUp ? 'Sign In' : 'Sign Up'}
                                    {!isReset && <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-6 text-gray-400 text-xs font-medium">
                        © 2023 DesignFlow AI
                    </div>

                </div >
            </div >
        </div >
    );
};