import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useForgotPassword } from '../../hooks/useAuth';


export const ForgotPassword = () => {
 const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { mutate, isPending, isSuccess, data, isError, error: mutationError } = useForgotPassword();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

 const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    mutate({ email });
  };


return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Forgot password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your account email and we&apos;ll generate a reset link.
        </p>

        {isSuccess ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            <p>{data?.message}</p>
            {/* No email service wired up yet — shown here directly so the flow is testable.
                In production this would only ever be sent by email, never displayed. */}
            {data?.resetToken && (
              <p className="mt-2">
                Dev-only reset link:{' '}
                <Link to={`/reset-password/${data.resetToken}`} className="font-medium underline">
                  Reset your password
                </Link>
              </p>
            )}
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <FormField label="Email" name="email" type="email" value={email} onChange={handleChange} error={error} />

            {isError && (
              <p className="text-sm text-red-600">
                {(mutationError as any)?.response?.data?.message ?? 'Something went wrong.'}
              </p>
            )}

            <Button type="submit" isLoading={isPending}>
              Send reset link
            </Button>

            <p className="text-center text-sm text-gray-500">
              Remembered it?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

