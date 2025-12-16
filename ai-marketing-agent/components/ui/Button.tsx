
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'relative px-6 py-3 font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mono tracking-wider overflow-hidden group';

  const variantClasses = {
    primary: 'bg-[#00f0ff] text-black hover:bg-[#fff] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] border border-transparent',
    secondary: 'bg-[#ff00ff] text-black hover:bg-[#fff] hover:shadow-[0_0_20px_rgba(255,0,255,0.6)] border border-transparent',
    accent: 'bg-[#39ff14] text-black hover:bg-[#fff] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] border border-transparent',
    outline: 'bg-transparent text-[#00f0ff] border border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {/* Glitch/Scanline effect overlay could go here */}
    </button>
  );
};
