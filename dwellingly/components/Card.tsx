import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, description, footer }) => {
  return (
    <div className={`bg-white rounded-xl border border-rule overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-rule">
          {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
          {description && <p className="text-sm text-ink0 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-muted border-t border-rule">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;