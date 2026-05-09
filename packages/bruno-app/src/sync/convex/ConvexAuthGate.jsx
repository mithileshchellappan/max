import React, { useState } from 'react';
import { useConvexAuth, useAuthActions } from '@convex-dev/auth/react';
import { IconArrowRight, IconEye, IconEyeOff, IconLoader2, IconLock, IconMail, IconUserPlus } from '@tabler/icons';
import MaxLogo from 'components/MaxLogo';
import { useConvexSync } from './ConvexSyncProvider';

const getAuthErrorMessage = (error, mode) => {
  const message = String(error?.message || '');

  if (/InvalidAccountId|Invalid password|invalid secret|credentials/i.test(message)) {
    return 'Invalid email or password';
  }

  if (/already exists|AccountAlreadyExists|Duplicate/i.test(message)) {
    return 'An account already exists for this email';
  }

  if (/code|verification|token/i.test(message)) {
    return 'Could not verify the code. Check it and try again.';
  }

  return mode === 'signUp'
    ? 'Could not create the account. Check the email and password, then try again.'
    : 'Could not sign in. Check the email and password, then try again.';
};

const ConvexAuthGateInner = ({ children }) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signIn');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const selectMode = (nextMode) => {
    setError('');
    setVerificationPending(false);
    setVerificationCode('');
    setMode(nextMode);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f4f6f5] text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <IconLoader2 className="animate-spin" size={16} strokeWidth={1.75} />
          Loading Max
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  const submitPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      const result = await signIn('password', {
        flow: mode,
        email: normalizedEmail,
        password
      });
      if (result?.signingIn === false) {
        setVerificationPending(true);
        setVerificationCode('');
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  };

  const submitVerification = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      await signIn('password', {
        flow: 'email-verification',
        email: normalizedEmail,
        code: verificationCode.trim()
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'verification'));
    } finally {
      setSubmitting(false);
    }
  };

  const isSignUp = mode === 'signUp';
  const submitLabel = isSignUp ? 'Create account' : 'Sign in';

  return (
    <main className="h-screen overflow-hidden bg-[#f4f6f5] text-[#171717]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(360px,0.82fr)_1.18fr]">
        <section className="hidden border-r border-[#d9ded9] bg-[#20211f] px-10 py-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <MaxLogo width={42} />
              <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#b8bbb4]">Max</div>
                <div className="text-[22px] font-semibold leading-tight text-white">Cloud workspace</div>
              </div>
            </div>
            <div className="mt-14 max-w-[360px]">
              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-normal text-white">
                Continue to your API workspace.
              </h1>
              <p className="mt-4 text-[15px] leading-6 text-[#c9ccc5]">
                Keep request work, imports, and workspace changes in one signed-in session.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-[12px] font-semibold text-[#f3a51c]">POST</div>
              <div className="h-2 w-2 rounded-full bg-[#43c59e]" />
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-5/6 rounded-full bg-white/[0.18]" />
              <div className="h-2.5 w-2/3 rounded-full bg-white/[0.12]" />
              <div className="h-2.5 w-4/5 rounded-full bg-white/[0.12]" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="h-16 rounded-md bg-[#f3a51c]/20" />
              <div className="h-16 rounded-md bg-[#43c59e]/20" />
              <div className="h-16 rounded-md bg-white/[0.08]" />
            </div>
          </div>
        </section>

        <section className="flex h-full items-center justify-center px-5 py-8">
          <form
            className="w-full max-w-[390px] rounded-lg border border-[#dde2dd] bg-white p-5 shadow-[0_18px_60px_rgba(20,24,20,0.08)]"
            onSubmit={verificationPending ? submitVerification : submitPassword}
          >
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <MaxLogo width={36} />
              <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#5f665f]">Max</div>
                <div className="text-[18px] font-semibold leading-tight text-[#171717]">Cloud workspace</div>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-[24px] font-semibold leading-tight text-[#171717]">
                {verificationPending ? 'Verify your email' : isSignUp ? 'Create Max account' : 'Sign in to Max'}
              </h2>
              <p className="mt-2 text-sm leading-5 text-[#66605a]">
                {verificationPending ? `Enter the code sent to ${email}.` : isSignUp ? 'Create an account with your workspace email.' : 'Use the email connected to your Max workspace.'}
              </p>
            </div>

            {!verificationPending ? (
              <div className="mb-5 grid grid-cols-2 rounded-md border border-[#dde2dd] bg-[#f3f5f3] p-1">
                <button
                  className={`h-9 rounded-[4px] text-sm font-medium transition ${
                    !isSignUp ? 'bg-white text-[#171717] shadow-sm' : 'text-[#626b62] hover:text-[#171717]'
                  }`}
                  type="button"
                  onClick={() => selectMode('signIn')}
                  disabled={submitting}
                >
                  Sign in
                </button>
                <button
                  className={`h-9 rounded-[4px] text-sm font-medium transition ${
                    isSignUp ? 'bg-white text-[#171717] shadow-sm' : 'text-[#626b62] hover:text-[#171717]'
                  }`}
                  type="button"
                  onClick={() => selectMode('signUp')}
                  disabled={submitting}
                >
                  Create account
                </button>
              </div>
            ) : null}

            <label className="mb-4 block text-sm font-medium text-[#282522]">
              Email
              <div className="mt-1.5 flex h-10 items-center rounded-md border border-[#d6ddd6] bg-white px-3 focus-within:border-[#1f1f1f] focus-within:ring-2 focus-within:ring-[#1f1f1f]/10">
                <IconMail className="mr-2 flex-shrink-0 text-[#7d877d]" size={16} strokeWidth={1.75} />
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#909990]"
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="you@company.com"
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={verificationPending}
                  required
                />
              </div>
            </label>

            {verificationPending ? (
              <label className="mb-4 block text-sm font-medium text-[#282522]">
                Verification code
                <div className="mt-1.5 flex h-10 items-center rounded-md border border-[#d6ddd6] bg-white px-3 focus-within:border-[#1f1f1f] focus-within:ring-2 focus-within:ring-[#1f1f1f]/10">
                  <IconLock className="mr-2 flex-shrink-0 text-[#7d877d]" size={16} strokeWidth={1.75} />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#909990]"
                    type="text"
                    value={verificationCode}
                    autoComplete="one-time-code"
                    placeholder="Code"
                    onChange={(event) => setVerificationCode(event.target.value)}
                    required
                  />
                </div>
              </label>
            ) : (
              <label className="mb-4 block text-sm font-medium text-[#282522]">
                Password
                <div className="mt-1.5 flex h-10 items-center rounded-md border border-[#d6ddd6] bg-white px-3 focus-within:border-[#1f1f1f] focus-within:ring-2 focus-within:ring-[#1f1f1f]/10">
                  <IconLock className="mr-2 flex-shrink-0 text-[#7d877d]" size={16} strokeWidth={1.75} />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#909990]"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    placeholder="Password"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[4px] text-[#707a70] hover:bg-[#eef2ee] hover:text-[#171717]"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <IconEyeOff size={16} strokeWidth={1.75} /> : <IconEye size={16} strokeWidth={1.75} />}
                  </button>
                </div>
              </label>
            )}

            {error ? (
              <div className="mb-4 rounded-md border border-[#f1b9ae] bg-[#fff4f1] px-3 py-2 text-sm leading-5 text-[#9d2a1d]">
                {error}
              </div>
            ) : null}

            <button
              className="flex h-10 w-full items-center justify-center rounded-md bg-[#171717] px-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <IconLoader2 className="mr-2 animate-spin" size={16} strokeWidth={1.75} />
              ) : verificationPending ? (
                <IconArrowRight className="mr-2" size={16} strokeWidth={1.75} />
              ) : isSignUp ? (
                <IconUserPlus className="mr-2" size={16} strokeWidth={1.75} />
              ) : (
                <IconArrowRight className="mr-2" size={16} strokeWidth={1.75} />
              )}
              {submitting ? 'Please wait' : verificationPending ? 'Verify email' : submitLabel}
            </button>

            {verificationPending ? (
              <button
                className="mt-3 h-9 w-full rounded-md text-sm font-medium text-[#626b62] hover:bg-[#f3f5f3] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={submitting}
                onClick={() => {
                  setError('');
                  setVerificationPending(false);
                  setVerificationCode('');
                }}
              >
                Back
              </button>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
};

const ConvexAuthGate = ({ children }) => {
  const { enabled } = useConvexSync();
  if (!enabled) {
    return children;
  }

  return <ConvexAuthGateInner>{children}</ConvexAuthGateInner>;
};

export default ConvexAuthGate;
