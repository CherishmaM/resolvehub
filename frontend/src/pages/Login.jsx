import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { AuthShowcase } from '../components/auth/AuthShowcase';
import { WireframeBackground } from '../components/ui/WireframeBackground';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      window.scrollTo(0, 0);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.message || 'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f3f4fe] to-[#ebeeff] flex flex-col justify-between font-geist selection:bg-[#6257D9] selection:text-white relative overflow-hidden">
      {/* Subtle enterprise 3D wireframe background & ambient lighting */}
      <WireframeBackground variant="auth" />

      {/* Background ambient gradient glows with gentle pulsing animation */}
      <div className="absolute -bottom-28 -right-28 pointer-events-none w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-[#6257D9]/20 to-[#a78bfa]/15 blur-2xl animate-pulse-glow" />
      <div
        className="absolute -top-32 -left-32 pointer-events-none w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#e0e7ff]/40 to-[#c7d2fe]/20 blur-3xl animate-pulse-glow"
        style={{ animationDelay: '3.5s' }}
      />

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-6 sm:pt-8 pb-3 flex items-center justify-between z-10">
        <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
          <Logo size="md" />
        </Link>
        <div className="text-xs sm:text-sm text-slate-500 font-normal">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[#6257D9] hover:text-[#5246c7] hover:underline ml-1">
            Sign up
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-4 sm:pt-6 pb-12 flex-1 flex flex-col lg:flex-row items-start justify-between gap-12 xl:gap-16 z-10">
        {/* Left Column: Form Section */}
        <div className="w-full lg:w-[45%] xl:w-[42%] max-w-md mx-auto lg:mx-0 pt-0 lg:pt-5">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#20212B] tracking-tight leading-tight">
              Welcome back to Resolve<span className="text-[#6257D9]">Hub</span>.
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-normal">
              Sign in to continue to your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#20212B]">
                Work email
              </label>
              <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#6257D9] focus-within:ring-4 focus-within:ring-[#6257D9]/10 shadow-xs hover:shadow-subtle focus-within:shadow-md focus-within:shadow-[#6257D9]/10 transition-all duration-200">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 text-sm font-normal bg-transparent rounded-2xl text-[#20212B] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#20212B]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSent(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-medium text-[#6257D9] hover:text-[#5246c7] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#6257D9] focus-within:ring-4 focus-within:ring-[#6257D9]/10 shadow-xs hover:shadow-subtle focus-within:shadow-md focus-within:shadow-[#6257D9]/10 transition-all duration-200">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 text-sm font-normal bg-transparent rounded-2xl text-[#20212B] placeholder:text-slate-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-normal">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-[#6257D9] focus:ring-[#6257D9] cursor-pointer"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 px-6 rounded-2xl font-medium text-sm text-white bg-[#6257D9] hover:bg-[#5246c7] shadow-md shadow-[#6257D9]/25 hover:shadow-xl hover:shadow-[#6257D9]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Bottom link */}
            <div className="pt-4 text-center">
              <p className="text-xs text-slate-500 font-normal">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-[#6257D9] hover:text-[#5246c7] hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Visual Showcase Section */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] justify-end relative select-none">
          <AuthShowcase />
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-4 flex items-center justify-between text-xs text-slate-400 font-normal z-10">
        <span>ResolveHub &copy; {new Date().getFullYear()}</span>
      </footer>

      {/* Forgot Password Lightbox Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-geist"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#20212B]">Password Recovery</h3>
              <p className="text-xs text-slate-500 font-normal">
                ResolveHub accounts are provisioned and managed within your team's workspace.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reset instructions requested</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed font-normal">
                  If <strong className="font-semibold">{forgotEmail}</strong> matches an active account, your workspace administrator has been notified to reset your password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#20212B] uppercase tracking-wider">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl text-[#20212B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#eef2ff] border border-[#e0e7ff] rounded-xl text-[11px] text-[#6257D9] leading-relaxed font-normal">
                  Tip: In local installations, you can log in directly using the seeded admin account (<code className="font-mono bg-[#e0e7ff] px-1 py-0.5 rounded">admin@fixflow.dev</code> / <code className="font-mono bg-[#e0e7ff] px-1 py-0.5 rounded">password123</code>).
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-[#6257D9] hover:bg-[#5246c7] transition-colors"
                >
                  Request Password Reset
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
