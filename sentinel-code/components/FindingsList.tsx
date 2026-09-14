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
    HIGH: 'bg-signal/20 text-ink-soft border-rule',
    MEDIUM: 'bg-[#fcee0a]/20 text-[#fcee0a] border-[#fcee0a]/50',
    LOW: 'bg-signal/20 text-ink border-rule',
  };
  const colorClass = colors[level as keyof typeof colors] || colors.LOW;

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border ${colorClass}`}>
      {level}
    </span>
  );
};

const FindingsList: React.FC<FindingsListProps> = ({ security, performance, quality }) => {

  if (security.length === 0 && performance.length === 0 && quality.length === 0) {
    return (
      <div className="text-center py-12 text-positive/70 bg-sheet rounded-xl border border-positive/30">
        <Check className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <p className="">NO ANOMALIES DETECTED. SYSTEM SECURE.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Security Section */}
      {security.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-ink-soft mb-4 flex items-center gap-2 pl-2 border-l-4 border-rule">
            <AlertOctagon className="w-5 h-5" /> SECURITY_VULNERABILITIES
          </h3>
          <div className="space-y-3">
            {security.map((item, idx) => (
              <div key={idx} className="bg-sheet p-5 rounded-lg border border-rule hover:border-rule transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-ink tracking-wide">{item.issue_type}</div>
                  <SeverityBadge level={item.severity} />
                </div>
                <p className="text-sm text-ink mb-3 leading-relaxed">{item.description}</p>
                <div className="text-xs text-ink bg-sheet border border-rule p-2 rounded mb-3 flex items-center gap-2">
                  <span>📍</span> {item.location}
                </div>
                <div className="text-sm text-positive flex gap-2 items-start bg-positive/5 p-2 rounded border border-positive/30">
                  <span className="font-bold shrink-0">FIX {'>'}</span> {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Performance Section */}
      {performance.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[#fcee0a] mb-4 flex items-center gap-2 pl-2 border-l-4 border-[#fcee0a]">
            <AlertTriangle className="w-5 h-5" /> PERFORMANCE_ISSUES
          </h3>
          <div className="space-y-3">
            {performance.map((item, idx) => (
              <div key={idx} className="bg-sheet p-5 rounded-lg border border-[#fcee0a]/20 hover:border-[#fcee0a]/60 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-ink tracking-wide">{item.issue_type}</div>
                  <SeverityBadge level={item.severity} />
                </div>
                <p className="text-sm text-ink mb-3 leading-relaxed">{item.description}</p>
                <div className="text-xs text-ink bg-sheet border border-rule p-2 rounded mb-3 flex items-center gap-2">
                  <span>📍</span> {item.location}
                </div>
                <div className="text-sm text-positive flex gap-2 items-start bg-positive/5 p-2 rounded border border-positive/30">
                  <span className="font-bold shrink-0">OPTIMIZE {'>'}</span> {item.improvement}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quality Section */}
      {quality.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2 pl-2 border-l-4 border-rule">
            <Info className="w-5 h-5" /> CODE_QUALITY
          </h3>
          <div className="space-y-3">
            {quality.map((item, idx) => (
              <div key={idx} className="bg-sheet p-5 rounded-lg border border-rule hover:border-rule transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-ink tracking-wide capitalize">{item.category}</div>
                </div>
                <p className="text-sm text-ink mb-3 leading-relaxed">{item.description}</p>
                <div className="text-xs text-ink-soft bg-sheet border border-rule p-2 rounded mb-3 flex items-center gap-2">
                  <span>📍</span> {item.location}
                </div>
                <div className="text-sm text-positive flex gap-2 items-start bg-positive/5 p-2 rounded border border-positive/30">
                  <span className="font-bold shrink-0">SUGGESTION {'>'}</span> {item.suggestion}
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