import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button = ({ isLoading, disabled, children, className = '', ...props }: ButtonProps) => (
  <button
    disabled={disabled || isLoading}
    className={`inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5
      text-sm font-medium text-white transition hover:bg-indigo-700
      disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto
      ${className}`}
    {...props}
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        Please wait…
      </span>
    ) : (
      children
    )}
  </button>
);

export default Button

