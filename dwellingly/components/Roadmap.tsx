import React from 'react';
import { Transaction, Task, TaskStatus } from '../types';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { Check, Lock, ChevronDown, ChevronUp, AlertCircle, History, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface RoadmapProps {
  transaction: Transaction;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigate: (tab: string) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ transaction, updateTaskStatus, onNavigate }) => {
  const [expandedTask, setExpandedTask] = React.useState<string | null>(
    transaction.tasks.find(t => t.status === TaskStatus.PENDING)?.id || null
  );

  const toggleTask = (id: string) => {
    setExpandedTask(expandedTask === id ? null : id);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return <Check className="w-5 h-5 text-ink" />;
      case TaskStatus.LOCKED: return <Lock className="w-4 h-4 text-ink-soft" />;
      default: return <span className="w-2 h-2 bg-signal rounded-full" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-positive border-positive/30';
      case TaskStatus.LOCKED: return 'bg-muted border-rule';
      case TaskStatus.PENDING: return 'bg-white border-rule ring-4 ring-rule';
      default: return 'bg-white border-rule';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-ink">Deal Roadmap</h2>
        <p className="text-ink0">Follow these steps to keep your transaction secure and on time.</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-muted -z-10" />

        <div className="space-y-4">
          {transaction.tasks.map((task) => {
            const isCompleted = task.status === TaskStatus.COMPLETED;
            const isLocked = task.status === TaskStatus.LOCKED;
            const isExpanded = expandedTask === task.id;

            return (
              <div key={task.id} className={`relative transition-all duration-300 ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
                <div 
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => !isLocked && toggleTask(task.id)}
                >
                  <div className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors
                    ${getStatusColor(task.status)}
                  `}>
                    {getStatusIcon(task.status)}
                  </div>

                  <Card className={`flex-1 transition-all ${isExpanded ? 'ring-2 ring-rule' : ''}`}>
                    <div className="flex items-center justify-between cursor-pointer">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-ink-soft uppercase">Step {task.orderIndex}</span>
                            {isCompleted && <Badge variant="success">Completed</Badge>}
                         </div>
                         <h3 className={`font-semibold text-lg ${isCompleted ? 'text-ink0 line-through' : 'text-ink'}`}>
                           {task.title}
                         </h3>
                      </div>
                      <div className="text-ink-soft">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && !isLocked && (
                      <div className="mt-4 pt-4 border-t border-rule animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-ink-soft mb-4 text-sm leading-relaxed">{task.description}</p>
                        
                        {/* What to Prepare Chips */}
                        {task.whatToPrepare && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-ink0 uppercase mb-2">What to prepare:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.whatToPrepare.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-ink">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Required Docs Link */}
                        {task.requiredDocs && task.requiredDocs.length > 0 && (
                           <div className="bg-muted border border-rule rounded-md p-3 mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-ink" />
                                <span className="text-sm text-ink">Review required documents</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-white border-rule text-ink hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('docs');
                                }}
                             >
                               Go to Vault
                             </Button>
                           </div>
                        )}

                        {/* Step Evidence (Audit Trail) */}
                        <div className="bg-muted rounded-lg p-4 border border-rule mb-4">
                           <p className="text-xs font-semibold text-ink0 uppercase mb-3 flex items-center gap-2">
                              <History className="w-3 h-3" /> Step Evidence
                           </p>
                           <div className="space-y-2">
                              {transaction.events.length > 0 ? (
                                transaction.events.slice(0, 3).map((evt) => (
                                  <div key={evt.id} className="text-xs text-ink-soft flex justify-between">
                                    <span>{evt.description}</span>
                                    <span className="text-ink-soft">{format(new Date(evt.timestamp), 'MMM d, h:mm a')}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-ink-soft italic">No activity recorded yet.</p>
                              )}
                           </div>
                        </div>

                        <div className="flex justify-end pt-2">
                           {task.status !== TaskStatus.COMPLETED && (
                             <Button onClick={(e) => {
                               e.stopPropagation();
                               updateTaskStatus(task.id, TaskStatus.COMPLETED);
                             }}>
                               Mark as Complete
                             </Button>
                           )}
                           {task.status === TaskStatus.COMPLETED && (
                             <Button variant="outline" onClick={(e) => {
                               e.stopPropagation();
                               updateTaskStatus(task.id, TaskStatus.PENDING);
                             }}>
                               Reopen Step
                             </Button>
                           )}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;