import React from 'react';
import { SecurityFinding, PerformanceIssue, QualityIssue } from '../types';
import { AlertTriangle, AlertOctagon, Info, Check } from 'lucide-react';

interface FindingsListProps {
  security: SecurityFinding[];
  performance: PerformanceIssue[];
  quality: QualityIssue[];
}

const SeverityBadge = ({ level }: { level: string }) => {
  const colors = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };
  const colorClass = colors[level as keyof typeof colors] || colors.LOW;
  
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${colorClass}`}>
      {level}
    </span>
  );
};

const FindingsList: React.FC<FindingsListProps> = ({ security, performance, quality }) => {
  
  if (security.length === 0 && performance.length === 0 && quality.length === 0) {
      return (
          <div className="text-center py-12 text-secondary">
              <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No issues found. Great job!</p>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      {/* Security Section */}
      {security.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-danger mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5" /> Security Vulnerabilities
          </h3>
          <div className="space-y-3">
            {security.map((item, idx) => (
              <div key={idx} className="bg-surface p-4 rounded-lg border border-danger/20 hover:border-danger/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-danger/90">{item.issue_type}</div>
                  <SeverityBadge level={item.severity} />
                </div>
                <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                <div className="text-xs text-secondary font-mono bg-background/50 p-2 rounded mb-2">
                  📍 {item.location}
                </div>
                <div className="text-sm text-success/80 flex gap-2 items-start">
                   <span className="font-bold">Fix:</span> {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Performance Section */}
      {performance.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Performance Issues
          </h3>
          <div className="space-y-3">
            {performance.map((item, idx) => (
              <div key={idx} className="bg-surface p-4 rounded-lg border border-accent/20 hover:border-accent/40 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-accent/90">{item.issue_type}</div>
                  <SeverityBadge level={item.severity} />
                </div>
                <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                <div className="text-xs text-secondary font-mono bg-background/50 p-2 rounded mb-2">
                  📍 {item.location}
                </div>
                <div className="text-sm text-success/80 flex gap-2 items-start">
                   <span className="font-bold">Improvement:</span> {item.improvement}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quality Section */}
      {quality.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" /> Code Quality
          </h3>
          <div className="space-y-3">
            {quality.map((item, idx) => (
              <div key={idx} className="bg-surface p-4 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-primary/90 capitalize">{item.category}</div>
                </div>
                <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                <div className="text-xs text-secondary font-mono bg-background/50 p-2 rounded mb-2">
                  📍 {item.location}
                </div>
                <div className="text-sm text-success/80 flex gap-2 items-start">
                   <span className="font-bold">Suggestion:</span> {item.suggestion}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FindingsList;