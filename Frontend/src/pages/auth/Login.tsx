import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBackdrop } from '../../components/layout/AuthBackdrop';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { EyeIcon, EyeOffIcon } from '../../components/ui/icons';
import { useLogin } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';

interface FormState {
  email: string;
  password: string;
}

const initialState: FormState = { email: '', password: '' };

type FormErrors = Partial<Record<keyof FormState, string>>;

const validate = (values: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Password is required';
  return errors;
};

export const Login = () => {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, isError, error } = useLogin();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    mutate(values, {
      onSuccess: (data) => {
        login(data.token);
        navigate('/dashboard');
      },
    });
  };

  return (
    <AuthBackdrop>
      <div className="relative">
        {/* soft glowing halo behind the card, echoing the title's gradient */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 opacity-40 blur-xl" />

        <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Log in</h2>
          <p className="mt-1 text-sm text-white/70">Welcome back — enter your details below.</p>

          <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email"
              name="email"
              type="email"
              variant="dark"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />

            <FormField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              variant="dark"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-white/60 hover:text-white/90"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              }
            />

            <Link
              to="/forgot-password"
              className="-mt-2 self-end text-xs font-medium text-fuchsia-300 hover:text-fuchsia-200 hover:underline"
            >
              Forgot password?
            </Link>

            {isError && (
              <p className="text-sm text-red-300">
                {(error as any)?.response?.data?.message ?? 'Invalid email or password.'}
              </p>
            )}

            <Button type="submit" isLoading={isPending} className="mt-2">
              Log in
            </Button>

            <p className="text-center text-sm text-white/70">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-fuchsia-300 hover:text-fuchsia-200 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </AuthBackdrop>
  );
};
