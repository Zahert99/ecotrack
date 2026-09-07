"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='min-h-full flex items-center justify-center bg-background p-4'>
      <div className='w-full max-w-100 flex flex-col items-center'>
        <div className='mb-6 flex items-center gap-2'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            className='h-7 w-7 text-primary'
            aria-hidden='true'
          >
            <path
              d='M5 21c8 0 13-5 13-13V5h-3C7 5 2 10 2 18v3z'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M5 21c3-3 5-7 5-12'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span className='text-2xl font-semibold tracking-tight text-primary'>
            EcoTrack
          </span>
        </div>

        <div className='w-full rounded-lg border border-border bg-background p-6 shadow-[0_0_0_1px_var(--border)]'>
          <h1 className='mb-4 text-center text-2xl font-semibold text-foreground'>
            Welcome back
          </h1>

          {error && (
            <div
              role='alert'
              className='mb-6 flex items-start gap-2 rounded border border-destructive-muted bg-destructive-muted/50 p-2 text-sm text-destructive-muted-foreground'
            >
              <span aria-hidden='true'>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='email'
                className='text-sm font-medium text-muted-foreground'
              >
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='name@company.com'
                className='w-full rounded border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
              />
            </div>

            <div className='flex flex-col gap-1'>
              <label
                htmlFor='password'
                className='text-sm font-medium text-muted-foreground'
              >
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full rounded border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
              />
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='mt-2 w-full rounded bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60'
            >
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <div className='mt-6 text-center text-sm text-muted-foreground'>
          Don&apos;t have an account?{" "}
          <Link
            href='/signup'
            className='font-medium text-secondary hover:underline'
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
