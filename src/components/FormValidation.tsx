import React from 'react';
import { ValidationError } from '../lib/validators';

export interface FormValidationProps {
  errors: ValidationError[];
  className?: string;
}

export function FormValidation({ errors, className = '' }: FormValidationProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            入力内容に問題があります
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function ValidatedInput({ 
  label, 
  error, 
  required = false, 
  className = '',
  ...props 
}: ValidatedInputProps) {
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        id={inputId}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}

export function ValidatedSelect({ 
  label, 
  error, 
  required = false, 
  options,
  className = '',
  ...props 
}: ValidatedSelectProps) {
  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        {...props}
        id={selectId}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300 text-red-900' : 'border-gray-300'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        <option value="">選択してください</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

