import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
}

/**
 * One filled button per view. The signal colour marks the action that moves
 * the work forward; everything else stays quiet so that one stays findable.
 */
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  const variants = {
    primary: 'bg-signal text-white hover:opacity-90',
    secondary: 'bg-muted text-ink hover:bg-secondary',
    accent: 'bg-muted text-ink hover:bg-secondary',
    outline: 'border border-rule bg-transparent text-ink hover:bg-muted',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
