
import React, { useState, useCallback } from 'react';
import type { UserInput, MarketingGoal, Platform } from '../../types';
import { MARKETING_GOALS, PLATFORMS } from '../../constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

interface WizardProps {
  onSubmit: (data: UserInput) => void;
}

const steps = [
  { id: 1, title: 'Campaign goals' },
  { id: 2, title: 'Target platforms' },
  { id: 3, title: 'Audience & offer' },
];

export const Wizard: React.FC<WizardProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserInput>>({
    goals: [],
    platforms: [],
    demographics: { age_range: '25-34', gender: 'Any', location: '' },
    brand_offer_details: '',
    campaign_budget: undefined,
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (validateStep()) {
      setError('');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const validateStep = useCallback(() => {
    switch(currentStep) {
        case 1:
            if (!formData.goals || formData.goals.length === 0) {
                setError('Please select at least one marketing goal.');
                return false;
            }
            break;
        case 2:
            if (!formData.platforms || formData.platforms.length === 0) {
                setError('Please select at least one platform.');
                return false;
            }
            break;
        case 3:
            if (!formData.brand_offer_details?.trim()) {
                setError('Please describe your brand or offer.');
                return false;
            }
            if (!formData.demographics?.location?.trim()) {
                setError('Please specify a target location.');
                return false;
            }
            break;
        default:
            break;
    }
    return true;
  }, [currentStep, formData]);

  const handleSubmit = () => {
    if (validateStep()) {
       setError('');
       onSubmit(formData as UserInput);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Goals
        return (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[17px] font-semibold">What are your main campaign objectives?</h3>
              <Tooltip text="Select one or more goals. The AI will generate strategies tailored to each objective." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MARKETING_GOALS.map((goal) => (
                <div key={goal.id} 
                className={`cursor-pointer rounded-md border p-4 transition-colors ${formData.goals?.includes(goal.id) ? 'border-signal bg-accent' : 'border-rule hover:border-ink-soft'}`}
                     onClick={() => {
                       const newGoals = formData.goals?.includes(goal.id) ? formData.goals.filter(g => g !== goal.id) : [...(formData.goals || []), goal.id];
                       setFormData({ ...formData, goals: newGoals as MarketingGoal[] });
                     }}>
                  <h4 className="text-[14px] font-semibold">{goal.label}</h4>
                  <p className="mt-1 text-[13px] text-ink-soft">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Platforms
        return (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[17px] font-semibold">Where will your campaign run?</h3>
                <Tooltip text="Choose the social media or advertising platform you want to focus on." />
              </div>
                <div className="flex flex-wrap gap-4">
                {PLATFORMS.map((platform) => (
                    <button key={platform.id}
                            type="button"
                            className={`rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors ${formData.platforms?.includes(platform.id) ? 'border-signal bg-signal text-primary-foreground' : 'border-rule text-ink hover:border-ink-soft'}`}
                            onClick={() => {
                                const newPlatforms = formData.platforms?.includes(platform.id) ? formData.platforms.filter(p => p !== platform.id) : [...(formData.platforms || []), platform.id];
                                setFormData({ ...formData, platforms: newPlatforms as Platform[] });
                            }}>
                    {platform.label}
                    </button>
                ))}
                </div>
            </div>
        );
      case 3: // Audience & Offer
      return (
        <div>
          <h3 className="text-[17px] font-semibold">Describe your audience and offer</h3>
          <div className="space-y-6">
              <div>
                  <div className="flex items-center gap-2 mb-4">
                      <label className="block text-[13.5px] font-medium" htmlFor="offer">Brand or offer</label>
                      <Tooltip text="Describe your product, service, or what you're promoting in 1-2 sentences. This helps the AI tailor its suggestions." />
                  </div>
                  <textarea id="offer" rows={4} className="w-full rounded-sm border border-rule bg-background p-2.5 text-[14px] focus:border-signal focus:outline-none" placeholder="e.g., Online yoga classes for busy professionals." value={formData.brand_offer_details} onChange={(e) => setFormData({...formData, brand_offer_details: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block text-[13.5px] font-medium" htmlFor="age">Age range</label>
                          <Tooltip text="Select the primary age group of your target audience." />
                      </div>
                      <select id="age" className="w-full rounded-sm border border-rule bg-background p-2.5 text-[14px] focus:border-signal focus:outline-none" value={formData.demographics?.age_range} onChange={(e) => setFormData({...formData, demographics: { age_range: e.target.value, gender: formData.demographics?.gender || 'Any', location: formData.demographics?.location || '' }})}>
                          <option>18-24</option>
                          <option>25-34</option>
                          <option>35-44</option>
                          <option>45-54</option>
                          <option>55+</option>
                      </select>
                  </div>
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block text-[13.5px] font-medium" htmlFor="gender">Gender</label>
                          <Tooltip text="Select the gender of your target audience. Choose 'Any' for a broader reach." />
                      </div>
                      <select id="gender" className="w-full rounded-sm border border-rule bg-background p-2.5 text-[14px] focus:border-signal focus:outline-none" value={formData.demographics?.gender} onChange={(e) => setFormData({...formData, demographics: { age_range: formData.demographics?.age_range || '25-34', gender: e.target.value, location: formData.demographics?.location || '' }})}>
                          <option>Any</option>
                          <option>Female</option>
                          <option>Male</option>
                          <option>Non-binary</option>
                      </select>
                  </div>
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block text-[13.5px] font-medium" htmlFor="location">Location</label>
                          <Tooltip text="Specify the primary country, region, or city you are targeting." />
                      </div>
                      <input type="text" id="location" className="w-full rounded-sm border border-rule bg-background p-2.5 text-[14px] focus:border-signal focus:outline-none" placeholder="e.g., United States" value={formData.demographics?.location} onChange={(e) => setFormData({...formData, demographics: { age_range: formData.demographics?.age_range || '25-34', gender: formData.demographics?.gender || 'Any', location: e.target.value }})} />
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block text-[13.5px] font-medium" htmlFor="interests">Audience interests (optional)</label>
                          <Tooltip text="List a few keywords that describe your audience's interests, separated by commas (e.g., technology, hiking, coffee)." />
                      </div>
                      <input type="text" id="interests" className="w-full rounded-sm border border-rule bg-background p-2.5 text-[14px] focus:border-signal focus:outline-none" placeholder="e.g., fitness, wellness, yoga" value={formData.audience_interests || ''} onChange={(e) => setFormData({...formData, audience_interests: e.target.value})} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <label className="block text-[13.5px] font-medium" htmlFor="budget">Campaign budget (optional)</label>
                          <Tooltip text="Enter the total budget for this campaign. This helps the AI provide realistic recommendations." />
                      </div>
                      <input 
                          type="number" 
                          id="budget" 
                          className="w-full rounded-sm border border-rule bg-background p-2.5 text-[14px] focus:border-signal focus:outline-none" 
                          placeholder="e.g., 5000" 
                          value={formData.campaign_budget || ''} 
                          onChange={(e) => setFormData({...formData, campaign_budget: e.target.value ? parseFloat(e.target.value) : undefined})} 
                          min="0"
                      />
                  </div>
              </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

  return (
    <div className="w-full">
      <Card className="w-full max-w-4xl">
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                {steps.map(step => (
                     <div key={step.id} className="text-center w-1/3">
                        <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium ${currentStep >= step.id ? 'bg-signal text-primary-foreground' : 'bg-muted text-ink'}`}>
                            {step.id}
                        </div>
                        <p className={`mt-2 text-[12.5px] ${currentStep >= step.id ? 'text-ink' : 'text-ink-soft'}`}>{step.title}</p>
                     </div>
                ))}
            </div>
            <div className="h-px w-full bg-rule">
                <div className="h-px bg-signal transition-[width] duration-200" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
            </div>
        </div>
        
        <div>
            {renderStepContent()}
        </div>

        {error && <p className="my-4 text-[13.5px] text-destructive">{error}</p>}
        
        <div className="mt-8 flex justify-between items-center">
          <Button type="button" onClick={handleBack} disabled={currentStep === 1} variant="secondary" >
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Generate plan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
