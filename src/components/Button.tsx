import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'magic';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', fullWidth = false, isLoading = false, className = '', children, ...props }) => {
  const baseStyles = "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ease-out active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#007AFF] text-white shadow-lg shadow-blue-500/30 hover:bg-[#0071E3]",
    secondary: "bg-white text-ios-text border border-gray-200 shadow-sm hover:bg-gray-50",
    ghost: "bg-transparent text-ios-secondary hover:text-ios-text hover:bg-black/5",
    magic: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:brightness-110 border-0"
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};
