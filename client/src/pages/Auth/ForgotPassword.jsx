import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, Building, ArrowLeft } from 'lucide-react';
import { Spinner } from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      tenantSlug: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await authService.forgotPassword(data.email);
      if (response?.success) {
        setSuccess(true);
        toast.success(response.message || 'Recovery email sent');
      } else {
        toast.error(response?.message || 'Failed to trigger reset');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="w-14 h-14 bg-indigo-brand/10 border border-indigo-brand/20 text-indigo-brand rounded-full flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold">Reset Instructions Sent</h3>
            <p className="text-sm text-grey-text leading-relaxed">
              If an account matches those details, we have sent a secure password reset link to your email address.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text transition-all cursor-pointer"
            >
              Return to Login Portal
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Recover Password</h3>
              <p className="text-sm text-grey-text mt-2">
                Provide your registered email to receive password reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">


              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-grey-text block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-text w-4 h-4" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    placeholder="e.g. name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors placeholder:text-grey-placeholder"
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-[#704A3C] font-medium block">
                    {errors.email.message}
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
                    <span>Processing Reset...</span>
                  </>
                ) : (
                  <span>Send Recovery Email</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
