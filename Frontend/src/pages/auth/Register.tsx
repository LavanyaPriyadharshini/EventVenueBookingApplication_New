import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useRegister } from '../../hooks/useAuth';


//defines the structure of the form data
//this defines the fields and properties in the registration from
interface FormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

//stores the actual string values of the form data
//once when the user gives the values and register then that will get stored here
const initialState: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  mobileNumber: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;
//keyof extracts the property names of a type.
//In simple terms, keyof FormState means all the field names available in your form.
//Record - creates an object type using specified keys and value types
//General syntax -Record<KeyType, ValueType>
//partial means - makes all properties in a type optional, if not given partial, the valid fields also might throw validation message


//this is a function name Validate- that accepts form values and returns validation errors
//formerrors -specifies the return type, the function should return an object matching the FromErrors type
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
  const { mutate, isPending, isSuccess, isError, error } = useRegister();//use register returns an object containing these properties
//mutate - starts the registration API request
//issuccess is provided by the React Query's mutation state,we need not set it manually


 //it handles user input and updates the form state whenever the user types
 //Whenever the user types into an input field, get that field's name and new value, then update the corresponding property in React state without changing the other fields.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    //setvalues - state setter returned by usestate
    //values - contains the current form data
    //setvalues - updates the form data
    //prev - it is the previous state object- it represents the state before that update
    //{ ...prev, [name]: value - this combines the old state with the new field value
    //...prev - this is the spread operator,it copies the existing properties into a new object
   };


const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    mutate(values);
  };


   return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Register to start booking events.</p>

        {isSuccess ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            Registration successful! You can now{' '}
            <Link to="/login" className="font-medium underline">
              log in
            </Link>
            .
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="First name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <FormField
                label="Last name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />
            </div>

            <FormField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />

            <FormField
              label="Mobile number"
              name="mobileNumber"
              value={values.mobileNumber}
              onChange={handleChange}
              error={errors.mobileNumber}
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
                {(error as any)?.response?.data?.message ?? 'Registration failed. Please try again.'}
              </p>
            )}

            <Button type="submit" isLoading={isPending} className="mt-2">
              Create account
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
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
  

