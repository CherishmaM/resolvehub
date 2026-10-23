import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { AuthShowcase } from '../components/auth/AuthShowcase';
import { WireframeBackground } from '../components/ui/WireframeBackground';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const POPULAR_JOB_TITLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Developer',
  'QA Engineer',
  'Product Manager',
  'UI/UX Designer',
  'DevOps / SRE',
];

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobTitle: 'Frontend Engineer',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Work email is required.');
      return;
    }

    if (!formData.jobTitle.trim()) {
      setError('Please select or specify your job title.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        jobTitle: formData.jobTitle.trim(),
        password: formData.password,
      });
      window.scrollTo(0, 0);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f3f4fe] to-[#ebeeff] flex flex-col justify-between font-geist selection:bg-[#6257D9] selection:text-white relative overflow-hidden">
      {/* Subtle enterprise 3D wireframe background & ambient lighting */}
      <WireframeBackground variant="auth" />

      {/* Background ambient gradient glow with subtle pulsing animation */}
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
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#6257D9] hover:text-[#5246c7] hover:underline ml-1">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-4 sm:pt-6 pb-12 flex-1 flex flex-col lg:flex-row items-start justify-between gap-12 xl:gap-16 z-10">
        {/* Left Column: Form Section */}
        <div className="w-full lg:w-[45%] xl:w-[42%] max-w-md mx-auto lg:mx-0 animate-fade-up">
          <div className="mb-6">
            <span className="text-[11px] font-semibold tracking-widest text-[#6257D9] uppercase">
              CREATE ACCOUNT
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#20212B] tracking-tight leading-tight mt-1.5">
              Get started with<br />
              Resolve<span className="text-[#6257D9]">Hub</span>.
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-normal">
              Join your team and start resolving issues, all in one place.
            </p>
          </div>

          {error && (
            <div className="mb-4 animate-shake">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#20212B]">
                Full name
              </label>
              <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#6257D9] focus-within:ring-4 focus-within:ring-[#6257D9]/15 shadow-xs hover:shadow-subtle focus-within:shadow-md focus-within:shadow-[#6257D9]/10 transition-all duration-200">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 text-sm font-normal bg-transparent rounded-2xl text-[#20212B] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#20212B]">
                Work email
              </label>
              <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#6257D9] focus-within:ring-4 focus-within:ring-[#6257D9]/15 shadow-xs hover:shadow-subtle focus-within:shadow-md focus-within:shadow-[#6257D9]/10 transition-all duration-200">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-11 pr-10 py-3 text-sm font-normal bg-transparent rounded-2xl text-[#20212B] placeholder:text-slate-400 focus:outline-none"
                />
                {isEmailValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2 animate-scale-in pointer-events-none" />
                )}
              </div>
            </div>

            {/* Choose Job Title / Role */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#20212B]">
                  Job title / Role
                </label>
                <span className="text-[10px] text-slate-400 font-normal">Click a chip or type below</span>
              </div>
              <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#6257D9] focus-within:ring-4 focus-within:ring-[#6257D9]/10 shadow-xs hover:shadow-subtle focus-within:shadow-md focus-within:shadow-[#6257D9]/10 transition-all duration-200">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Engineer, Product Manager"
                  required
                  maxLength={50}
                  className="w-full pl-11 pr-4 py-3 text-sm font-normal bg-transparent rounded-2xl text-[#20212B] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_JOB_TITLES.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, jobTitle: title }))}
                    className={`text-[10px] px-2.5 py-1 rounded-xl transition-all duration-150 font-normal ${
                      formData.jobTitle === title
                        ? 'bg-[#6257D9] text-white shadow-xs font-medium'
                        : 'bg-white hover:bg-[#eef2ff] hover:text-[#6257D9] text-slate-600 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#20212B]">
                Password
              </label>
              <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#6257D9] focus-within:ring-4 focus-within:ring-[#6257D9]/10 shadow-xs hover:shadow-subtle focus-within:shadow-md focus-within:shadow-[#6257D9]/10 transition-all duration-200">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  required
                  className="w-full pl-11 pr-11 py-3 text-sm font-normal bg-transparent rounded-2xl text-[#20212B] placeholder:text-slate-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-transform duration-200 hover:scale-110 active:scale-95"
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

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 px-6 rounded-2xl font-medium text-sm text-white bg-[#6257D9] hover:bg-[#5246c7] shadow-md shadow-[#6257D9]/25 hover:shadow-xl hover:shadow-[#6257D9]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>

            {/* Bottom link */}
            <div className="pt-3 text-center">
              <p className="text-xs text-slate-500 font-normal">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#6257D9] hover:text-[#5246c7] hover:underline"
                >
                  Sign in
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

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-4 flex items-center justify-between text-xs text-slate-400 font-normal z-10">
        <span>ResolveHub &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};
