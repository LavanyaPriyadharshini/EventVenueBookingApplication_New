import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { EyeIcon, EyeOffIcon } from '../../components/ui/icons';
import { useResetPassword } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';


export const ResetPassword = () => {

  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { mutate, isPending, isError, error: mutationError } = useResetPassword();
  const { login } = useAuthContext();
  const navigate = useNavigate();

 const handleChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!token) return;
    setError('');

    mutate(
      { token, payload: { password } },
      {
        onSuccess: (data) => {
          login(data.token);
          navigate('/dashboard');
        },
      }
    );
  };

  
 return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">Choose a new password for your account.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="New password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handleChange}
            error={error}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            }
          />

          {isError && (
            <p className="text-sm text-red-600">
              {(mutationError as any)?.response?.data?.message ??
                'Could not reset password. The link may have expired.'}
            </p>
          )}

          <Button type="submit" isLoading={isPending}>
            Reset password
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Back to log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

//next add these imports in the app.tsx page