import React, { useState } from 'react';
import { useConvexAuth, useAuthActions } from '@convex-dev/auth/react';
import { useConvexSync } from './ConvexSyncProvider';

const getAuthErrorMessage = (error, mode) => {
  const message = String(error?.message || '');

  if (/InvalidAccountId|Invalid password|invalid secret|credentials/i.test(message)) {
    return 'Invalid email or password';
  }

  if (/already exists|AccountAlreadyExists|Duplicate/i.test(message)) {
    return 'An account already exists for this email';
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

  const toggleMode = () => {
    setError('');
    setMode(mode === 'signUp' ? 'signIn' : 'signUp');
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-sm text-gray-500">Loading</div>;
  }

  if (isAuthenticated) {
    return children;
  }

  const submitPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn('password', {
        flow: mode,
        email,
        password
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="h-screen flex items-center justify-center bg-neutral-50 px-4">
      <form className="w-full max-w-sm rounded border border-neutral-200 bg-white p-5 shadow-sm" onSubmit={submitPassword}>
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">
          {mode === 'signUp' ? 'Create Max account' : 'Sign in to Max'}
        </h1>
        <label className="mb-3 block text-sm text-neutral-700">
          Email
          <input
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="mb-4 block text-sm text-neutral-700">
          Password
          <input
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            type="password"
            value={password}
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <button
          className="mb-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          type="submit"
          disabled={submitting}
        >
          {mode === 'signUp' ? 'Create account' : 'Sign in'}
        </button>
        <button
          className="mb-4 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-800 disabled:opacity-50"
          type="button"
          onClick={toggleMode}
          disabled={submitting}
        >
          {mode === 'signUp' ? 'Use existing account' : 'Create new account'}
        </button>
      </form>
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
