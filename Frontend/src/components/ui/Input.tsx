import { forwardRef, type InputHTMLAttributes } from 'react';


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    hasError?:boolean;
    variant?: 'light' | 'dark'; // 'light' (default) is used everywhere else; 'dark' is for cards sitting on photographic backgrounds like Login/Register
    //this is a custom property , ? means the property is optional
//     hasError set to true: apply error styling.
// hasError set to false: apply normal styling.
// hasError omitted: also use normal styling.

// //ex - <Input placeholder="Enter your name" />
// <Input
//   placeholder="Enter your email"
//   hasError={true}
// />

}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, variant = 'light', className = '', ...props }, ref) => {
    const lightStyles = hasError
      ? 'border-red-400 text-gray-900 placeholder:text-gray-400 focus:ring-red-300'
      : 'border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-400';

    const darkStyles = hasError
      ? 'border-red-400/70 bg-white/10 text-white placeholder:text-white/40 focus:ring-red-400'
      : 'border-white/30 bg-white/10 text-white placeholder:text-white/40 focus:ring-fuchsia-400';

    return (
      <input
        ref={ref} //- ref receives the ref passed by the parent, if any.
        className={`w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2
          ${variant === 'dark' ? darkStyles : lightStyles}
          ${className}`}
        {...props} //...props collects the remaining properties, such as type and placeholder.
      />
    );
  }
);

export default Input

//this is a reusable input component
//forwardRef allows a parent component to pass a ref through your custom component to the actual HTML input element.
//InputHTMLAttributes- this is a TS provided by react,contains the std properties supported by an html <input> element such as type,placeholder,value,defaultvalue
//HTMLInputElement- specifies which HTML element those properties belong to
