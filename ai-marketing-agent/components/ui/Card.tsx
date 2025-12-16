
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`bg-black/40 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
};
