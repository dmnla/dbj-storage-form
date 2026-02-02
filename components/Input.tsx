import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
        {label}
      </label>
      <input
        className={`w-full bg-slate-800/50 border ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-purple-500'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};