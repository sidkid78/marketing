
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`bg-card text-card-foreground border border-border rounded-xl shadow-lg p-6 transition-shadow hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};
