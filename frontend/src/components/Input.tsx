import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full h-10 px-3.5
            bg-white
            border rounded-lg
            text-sm text-slate-900
            placeholder:text-slate-400
            transition-all duration-200
            shadow-sm shadow-slate-200/40
            focus:outline-none focus:ring-4 focus:ring-emerald-500/10
            ${
              error 
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' 
                : 'border-slate-200 focus:border-emerald-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-rose-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
