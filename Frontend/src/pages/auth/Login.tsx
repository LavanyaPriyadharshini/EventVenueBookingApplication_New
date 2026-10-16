import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useLogin } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';


//defining the structure or the properties or the fields
interface FormState {
  email: string;
  password: string;
}

//storing the values of the properties or the fields
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
    setErrors(validationErrors); //react state setter,commonly created using usestate

    if (Object.keys(validationErrors).length > 0) return;
    //returns an array containing the object's property names
    // > 0 - checks whether that array contains at least one property , return Exits the handleSubmit function immediately.

    //this is the part that connects form submission to your API operation
    mutate(values, {
      onSuccess: (data) => {
        login(data.token);
        navigate('/dashboard');
      },
    });
  };
  

   return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Log in</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back — enter your details below.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          {isError && (
            <p className="text-sm text-red-600">
              {(error as any)?.response?.data?.message ?? 'Invalid email or password.'}
            </p>
          )}

          <Button type="submit" isLoading={isPending} className="mt-2">
            Log in
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};




 



 