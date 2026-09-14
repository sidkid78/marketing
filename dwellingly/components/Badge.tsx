import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'neutral';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const styles = {
    default: "bg-muted text-ink",
    success: "bg-positive/10 text-positive",
    warning: "bg-working/10 text-working",
    error: "bg-destructive/10 text-destructive",
    neutral: "bg-muted text-ink",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;