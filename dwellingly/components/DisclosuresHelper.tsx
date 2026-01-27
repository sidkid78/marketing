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
            <h2 className="text-2xl font-bold text-slate-900">Seller's Disclosure Helper</h2>
            <p className="text-slate-500">Ensure your SDN is complete to avoid liability.</p>
         </div>
         <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{progress}%</p>
            <p className="text-xs text-slate-500">Completeness</p>
         </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
         <div>
            <p className="text-sm font-semibold text-blue-900">Why this matters</p>
            <p className="text-sm text-blue-800 mt-1">
               In Texas, if you fail to provide a complete Seller's Disclosure Notice, the buyer may have the right to terminate the contract up to the day of closing.
            </p>
         </div>
      </div>

      <Card>
         <div className="divide-y divide-slate-100">
            {sections.map(section => (
               <div 
                  key={section.id} 
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => toggleSection(section.id)}
               >
                  <span className={`font-medium ${section.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                     {section.title}
                  </span>
                  {section.completed ? (
                     <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                     <Circle className="w-6 h-6 text-slate-300" />
                  )}
               </div>
            ))}
         </div>
         <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            {progress === 100 ? (
               <div>
                  <p className="text-green-600 font-medium mb-3">Checklist Complete!</p>
                  <Button>
                     <Upload className="w-4 h-4 mr-2" /> Upload Signed SDN
                  </Button>
               </div>
            ) : (
               <p className="text-slate-500 text-sm">Complete all sections to upload.</p>
            )}
         </div>
      </Card>
    </div>
  );
};

export default DisclosuresHelper;