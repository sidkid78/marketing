import React from 'react';
import { PipelineStage } from '../types';
import { Check, Loader2, Search, FileText, Edit, Send, Image as ImageIcon } from 'lucide-react';

interface StageStepperProps {
    currentStage: PipelineStage;
}

const steps = [
    { id: PipelineStage.RESEARCH, label: 'RESEARCH', icon: Search },
    { id: PipelineStage.DRAFT, label: 'DRAFT', icon: FileText },
    { id: PipelineStage.EDIT, label: 'EDIT', icon: Edit },
    { id: PipelineStage.PUBLISH, label: 'PUBLISH', icon: Send },
    { id: PipelineStage.VISUALIZE, label: 'VISUALS', icon: ImageIcon },
];

const StageStepper: React.FC<StageStepperProps> = ({ currentStage }) => {
    const getStatus = (stepId: PipelineStage) => {
        const order = [
            PipelineStage.RESEARCH, 
            PipelineStage.DRAFT, 
            PipelineStage.EDIT, 
            PipelineStage.PUBLISH, 
            PipelineStage.VISUALIZE,
            PipelineStage.COMPLETE
        ];
        
        const currentIndex = order.indexOf(currentStage === PipelineStage.COMPLETE ? PipelineStage.COMPLETE : currentStage);
        const stepIndex = order.indexOf(stepId);

        if (currentStage === PipelineStage.ERROR) return 'error';
        if (currentStage === PipelineStage.COMPLETE) return 'completed';
        
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="w-full py-2">
            <div className="flex items-center justify-between w-full relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-cyber-dark z-0"></div>
                
                {steps.map((step) => {
                    const status = getStatus(step.id);
                    const Icon = step.icon;
                    
                    let circleClass = "bg-cyber-dark border border-white/10 text-cyber-text";
                    let iconElement = <Icon size={16} />;
                    let labelClass = "text-cyber-text/50";

                    if (status === 'completed') {
                        circleClass = "bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_10px_rgba(6,182,212,0.4)]";
                        iconElement = <Check size={16} strokeWidth={3} />;
                        labelClass = "text-cyber-primary font-medium";
                    } else if (status === 'active') {
                        circleClass = "bg-cyber-accent/20 border-cyber-accent text-cyber-accent animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.5)]";
                        iconElement = <Loader2 size={16} className="animate-spin" />;
                        labelClass = "text-cyber-accent font-bold text-shadow-neon";
                    }

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 group flex-1">
                            <div className={`w-10 h-10 rounded transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${circleClass}`}>
                                {iconElement}
                            </div>
                            <span className={`text-[10px] tracking-widest font-mono transition-colors duration-300 ${labelClass}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StageStepper;