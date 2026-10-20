import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthBackdrop } from '../../components/layout/AuthBackdrop';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { EyeIcon, EyeOffIcon } from '../../components/ui/icons';
import { useRegister } from '../../hooks/useAuth';

interface FormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

const initialState: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  mobileNumber: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const validate = (values: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address';
  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!values.firstName.trim()) errors.firstName = 'First name is required';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required';
  if (!values.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
  return errors;
};

export const Register = () => {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, isSuccess, isError, error } = useRegister();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    mutate(values);
  };

  return (
    <AuthBackdrop>
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 opacity-40 blur-xl" />

        <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Create your account</h2>
          <p className="mt-1 text-sm text-white/70">Register to start booking events.</p>

          {isSuccess ? (
            <div className="mt-5 rounded-lg border border-green-400/30 bg-green-500/15 p-4 text-sm text-green-200">
              Registration successful! You can now{' '}
              <Link to="/login" className="font-medium underline">
                log in
              </Link>
              .
            </div>
          ) : (
            <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  label="First name"
                  name="firstName"
                  variant="dark"
                  value={values.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />
                <FormField
                  label="Last name"
                  name="lastName"
                  variant="dark"
                  value={values.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
              </div>

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
                label="Mobile number"
                name="mobileNumber"
                variant="dark"
                value={values.mobileNumber}
                onChange={handleChange}
                error={errors.mobileNumber}
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

              {isError && (
                <p className="text-sm text-red-300">
                  {(error as any)?.response?.data?.message ?? 'Registration failed. Please try again.'}
                </p>
              )}

              <Button type="submit" isLoading={isPending} className="mt-2">
                Create account
              </Button>

              <p className="text-center text-sm text-white/70">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-fuchsia-300 hover:text-fuchsia-200 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </AuthBackdrop>
  );
};
