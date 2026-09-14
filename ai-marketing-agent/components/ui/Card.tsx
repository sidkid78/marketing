import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /**
   * Cards carry no elevation by default. Hierarchy comes from the surface
   * shift and the rule; a shadow under every panel flattens the page into
   * one undifferentiated stack.
   */
  raised?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id, raised = false }) => {
  return (
    <div
      id={id}
      className={`rounded-md border border-rule bg-sheet p-6 ${raised ? 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
