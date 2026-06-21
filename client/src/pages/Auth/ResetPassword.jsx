import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Spinner } from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await authService.resetPassword(token, data.password);
      if (response?.success) {
        setSuccess(true);
        toast.success(response.message || 'Password reset successfully!');
      } else {
        toast.error(response?.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-walnut-noir flex items-center justify-center p-6 sm:p-12 select-none text-stardust-text">
        <div className="w-full max-w-md bg-charcoal-sidebar border border-badge-absent/40 p-8 rounded-2xl shadow-2xl space-y-6 text-center">
          <h3 className="text-xl font-bold text-[#704A3C]">Invalid Access</h3>
          <p className="text-sm text-grey-text">
            No secure token was found in the URL. Please request a new password reset link.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text transition-all cursor-pointer"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-walnut-noir flex items-center justify-center p-6 sm:p-12 select-none text-stardust-text">
      <div className="w-full max-w-md bg-charcoal-sidebar border border-indigo-border p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="p-1 rounded text-grey-text hover:text-stardust-text hover:bg-indigo-muted/20 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="text-xs font-semibold text-grey-text uppercase tracking-wider">Back to Login</span>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold">Password Reset Complete</h3>
            <p className="text-sm text-grey-text leading-relaxed">
              Your new private password has been configured successfully. You may now log in to your Workly workspace.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text transition-all cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Set Private Password</h3>
              <p className="text-sm text-grey-text mt-2">
                Establish a new secure password for your HRMS account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-grey-text block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-text w-4 h-4" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors placeholder:text-grey-placeholder"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-grey-text block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-text w-4 h-4" />
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === password || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors placeholder:text-grey-placeholder"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-text hover:text-stardust-text cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-[11px] text-[#704A3C] font-medium block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover disabled:bg-indigo-brand/40 text-stardust-text shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password & Save</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
