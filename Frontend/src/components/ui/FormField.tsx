import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Input } from './Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
  variant?: 'light' | 'dark';
}

export const FormField = ({
  label,
  error,
  rightElement,
  variant = 'light',
  className,
  ...inputProps
}: FormFieldProps) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className={`text-sm font-medium ${variant === 'dark' ? 'text-white/90' : 'text-gray-700'}`}
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          hasError={!!error}
          variant={variant}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={className}
          {...inputProps}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className={`text-xs ${variant === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
};
