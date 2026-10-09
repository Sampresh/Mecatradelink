'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import AuthCard from './AuthCard';
import { ButtonLink } from '@/components/ui/button';
import { authService } from '@/services';
import { getErrorMessage } from '@/lib/utils';

export default function VerifyEmail() {
  const token = useSearchParams().get('token');
  const [state, setState] = useState({ status: token ? 'loading' : 'error', message: token ? '' : 'This link is missing its token.' });
  const sent = useRef(false); // tokens are single-use; avoid the Strict Mode double call

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    authService
      .verifyEmail(token)
      .then((res) => setState({ status: 'success', message: res.message }))
      .catch((err) => setState({ status: 'error', message: getErrorMessage(err) }));
  }, [token]);

  return (
    <AuthCard title="Email verification">
      <div className="flex flex-col items-center py-4 text-center">
        {state.status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Verifying" />}
        {state.status === 'success' && <CheckCircle2 className="h-12 w-12 text-success" aria-hidden />}
        {state.status === 'error' && <XCircle className="h-12 w-12 text-danger" aria-hidden />}
        <p className="mt-4 text-muted" role="status">{state.message}</p>
        {state.status !== 'loading' && <ButtonLink href="/login" className="mt-6">Go to log in</ButtonLink>}
      </div>
    </AuthCard>
  );
}
