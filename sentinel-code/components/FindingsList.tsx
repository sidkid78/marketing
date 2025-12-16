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
    HIGH: 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50 shadow-[0_0_8px_rgba(255,0,255,0.4)]',
    MEDIUM: 'bg-[#fcee0a]/20 text-[#fcee0a] border-[#fcee0a]/50 shadow-[0_0_8px_rgba(252,238,10,0.4)]',
    LOW: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50 shadow-[0_0_8px_rgba(0,240,255,0.4)]',
  };
  const colorClass = colors[level as keyof typeof colors] || colors.LOW;

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border font-mono tracking-wider ${colorClass}`}>
      {level}
    </span>
  );
};

const FindingsList: React.FC<FindingsListProps> = ({ security, performance, quality }) => {

  if (security.length === 0 && performance.length === 0 && quality.length === 0) {
    return (
      <div className="text-center py-12 text-[#39ff14]/70 bg-black/40 rounded-xl border border-[#39ff14]/20 font-mono">
        <Check className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <p className="tracking-widest">NO ANOMALIES DETECTED. SYSTEM SECURE.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Security Section */}
      {security.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[#ff00ff] mb-4 flex items-center gap-2 font-mono tracking-widest pl-2 border-l-4 border-[#ff00ff]">
            <AlertOctagon className="w-5 h-5" /> SECURITY_VULNERABILITIES
          </h3>
          <div className="space-y-3">
            {security.map((item, idx) => (
              <div key={idx} className="bg-black/60 p-5 rounded-lg border border-[#ff00ff]/20 hover:border-[#ff00ff]/60 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-white font-mono tracking-wide">{item.issue_type}</div>
                  <SeverityBadge level={item.severity} />
                </div>
                <p className="text-sm text-gray-300 mb-3 font-mono leading-relaxed">{item.description}</p>
                <div className="text-xs text-[#00f0ff] font-mono bg-black/80 border border-[#00f0ff]/20 p-2 rounded mb-3 flex items-center gap-2">
                  <span>📍</span> {item.location}
                </div>
                <div className="text-sm text-[#39ff14] flex gap-2 items-start font-mono bg-[#39ff14]/5 p-2 rounded border border-[#39ff14]/10">
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
          <h3 className="text-lg font-bold text-[#fcee0a] mb-4 flex items-center gap-2 font-mono tracking-widest pl-2 border-l-4 border-[#fcee0a]">
            <AlertTriangle className="w-5 h-5" /> PERFORMANCE_ISSUES
          </h3>
          <div className="space-y-3">
            {performance.map((item, idx) => (
              <div key={idx} className="bg-black/60 p-5 rounded-lg border border-[#fcee0a]/20 hover:border-[#fcee0a]/60 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-white font-mono tracking-wide">{item.issue_type}</div>
                  <SeverityBadge level={item.severity} />
                </div>
                <p className="text-sm text-gray-300 mb-3 font-mono leading-relaxed">{item.description}</p>
                <div className="text-xs text-[#00f0ff] font-mono bg-black/80 border border-[#00f0ff]/20 p-2 rounded mb-3 flex items-center gap-2">
                  <span>📍</span> {item.location}
                </div>
                <div className="text-sm text-[#39ff14] flex gap-2 items-start font-mono bg-[#39ff14]/5 p-2 rounded border border-[#39ff14]/10">
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
          <h3 className="text-lg font-bold text-[#00f0ff] mb-4 flex items-center gap-2 font-mono tracking-widest pl-2 border-l-4 border-[#00f0ff]">
            <Info className="w-5 h-5" /> CODE_QUALITY
          </h3>
          <div className="space-y-3">
            {quality.map((item, idx) => (
              <div key={idx} className="bg-black/60 p-5 rounded-lg border border-[#00f0ff]/20 hover:border-[#00f0ff]/60 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-white font-mono tracking-wide capitalize">{item.category}</div>
                </div>
                <p className="text-sm text-gray-300 mb-3 font-mono leading-relaxed">{item.description}</p>
                <div className="text-xs text-gray-400 font-mono bg-black/80 border border-white/10 p-2 rounded mb-3 flex items-center gap-2">
                  <span>📍</span> {item.location}
                </div>
                <div className="text-sm text-[#39ff14] flex gap-2 items-start font-mono bg-[#39ff14]/5 p-2 rounded border border-[#39ff14]/10">
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