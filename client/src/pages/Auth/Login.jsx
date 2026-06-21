import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DotPattern from '../../components/common/DotPattern';
import { Eye, EyeOff, Building, Mail, Lock, Building2 } from 'lucide-react';
import { Spinner } from '../../components/common/Loader';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      tenantSlug: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setGeneralError('');
    try {
      const result = await login(data.email, data.password, data.tenantSlug);
      if (result.success) {
        // Redirect will happen in AuthLayout based on user role,
        // but navigating to a base path like '/' forces layout recalculation.
        navigate('/');
      } else {
        setGeneralError(result.error || 'Invalid credentials or tenant details.');
      }
    } catch (err) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex text-stardust-text select-none">
      {/* Left Panel - Brand Showcase */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-indigo-darkest to-walnut-noir items-center justify-center overflow-hidden border-r border-indigo-border/20">
        <DotPattern opacity={0.3} />
        <div className="z-10 max-w-md text-center p-8 space-y-6">
          <div className="flex justify-center">
            <Building2 className="text-indigo-brand w-20 h-20" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-wider">LUCID-HR</h2>
            <p className="text-sm text-grey-text mt-3 font-medium uppercase tracking-widest leading-relaxed">
              Workforce Optimization & Operations
            </p>
          </div>
          <p className="text-xs text-grey-text/80 leading-relaxed">
            Access your unified self-service portal to punch attendance, request leaves, track organizational timelines, and review performance reports.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-walnut-noir flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 bg-charcoal-sidebar border border-indigo-border p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight">Portal Authentication</h3>
            <p className="text-sm text-grey-text mt-2">Enter your employee workspace credentials</p>
          </div>

          {generalError && (
            <div className="p-3.5 bg-badge-absent/20 border border-badge-absent/40 rounded-lg text-xs text-[#704A3C] text-center font-medium leading-relaxed">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username or Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-grey-text block">
                Username or Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-text w-4 h-4" />
                <input
                  {...register('email', {
                    required: 'Username or Email is required',
                  })}
                  type="text"
                  placeholder="e.g. name@company.com or username"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors placeholder:text-grey-placeholder"
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-[#704A3C] font-medium block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-grey-text block">
                  Account Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-teal-accent hover:underline cursor-pointer"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-text w-4 h-4" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors placeholder:text-grey-placeholder"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-text hover:text-stardust-text cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] text-[#704A3C] font-medium block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover disabled:bg-indigo-brand/40 text-stardust-text shadow-lg shadow-indigo-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to System</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
