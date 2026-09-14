import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { CheckCircle2, Circle, AlertCircle, Upload } from 'lucide-react';

const DisclosuresHelper: React.FC = () => {
  const [sections, setSections] = useState([
    { id: 1, title: 'Property Section 1 (Occupancy)', completed: false },
    { id: 2, title: 'Property Section 2 (Features & Defects)', completed: false },
    { id: 3, title: 'Section 3 (Smoke Detectors)', completed: false },
    { id: 4, title: 'Section 4 (Repairs needed)', completed: false },
    { id: 5, title: 'Section 5 (Flooding/Drainage)', completed: false },
  ]);

  const toggleSection = (id: number) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const progress = Math.round((sections.filter(s => s.completed).length / sections.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-ink">Seller's Disclosure Helper</h2>
            <p className="text-ink0">Ensure your SDN is complete to avoid liability.</p>
         </div>
         <div className="text-right">
            <p className="text-2xl font-bold text-ink">{progress}%</p>
            <p className="text-xs text-ink0">Completeness</p>
         </div>
      </div>

      <div className="bg-muted border border-rule rounded-lg p-4 flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-ink shrink-0 mt-0.5" />
         <div>
            <p className="text-sm font-semibold text-ink">Why this matters</p>
            <p className="text-sm text-ink mt-1">
               In Texas, if you fail to provide a complete Seller's Disclosure Notice, the buyer may have the right to terminate the contract up to the day of closing.
            </p>
         </div>
      </div>

      <Card>
         <div className="divide-y divide-rule">
            {sections.map(section => (
               <div 
                  key={section.id} 
                  className="p-4 flex items-center justify-between hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => toggleSection(section.id)}
               >
                  <span className={`font-medium ${section.completed ? 'text-ink0 line-through' : 'text-ink'}`}>
                     {section.title}
                  </span>
                  {section.completed ? (
                     <CheckCircle2 className="w-6 h-6 text-positive" />
                  ) : (
                     <Circle className="w-6 h-6 text-ink" />
                  )}
               </div>
            ))}
         </div>
         <div className="bg-muted p-6 border-t border-rule text-center">
            {progress === 100 ? (
               <div>
                  <p className="text-positive font-medium mb-3">Checklist Complete!</p>
                  <Button>
                     <Upload className="w-4 h-4 mr-2" /> Upload Signed SDN
                  </Button>
               </div>
            ) : (
               <p className="text-ink0 text-sm">Complete all sections to upload.</p>
            )}
         </div>
      </Card>
    </div>
  );
};

export default DisclosuresHelper;