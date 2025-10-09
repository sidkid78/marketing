
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
  { id: 1, title: 'Campaign Goals' },
  { id: 2, title: 'Target Platforms' },
  { id: 3, title: 'Audience & Offer' },
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
              <h3 className="text-xl font-semibold mb-4 text-foreground">What are your main campaign objectives?</h3>
              <Tooltip text="Select one or more goals. The AI will generate strategies tailored to each objective." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MARKETING_GOALS.map((goal) => (
                <div key={goal.id} 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.goals?.includes(goal.id) ? 'border-primary shadow-lg bg-primary/10' : 'border-border hover:border-primary'}`}
                     onClick={() => {
                       const newGoals = formData.goals?.includes(goal.id) ? formData.goals.filter(g => g !== goal.id) : [...(formData.goals || []), goal.id];
                       setFormData({ ...formData, goals: newGoals as MarketingGoal[] });
                     }}>
                  <h4 className="font-bold text-foreground">{goal.label}</h4>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Platforms
        return (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Where will your campaign run?</h3>
                <Tooltip text="Choose the social media or advertising platform you want to focus on." />
              </div>
                <div className="flex flex-wrap gap-4">
                {PLATFORMS.map((platform) => (
                    <button key={platform.id}
                            type="button"
                            className={`px-4 py-2 border-2 rounded-full font-semibold transition-all ${formData.platforms?.includes(platform.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-primary'}`}
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
          <h3 className="text-xl font-semibold mb-4 text-foreground">Describe your audience and offer.</h3>
          <div className="space-y-6">
              <div>
                  <div className="flex items-center gap-2 mb-4">
                      <label className="block font-semibold mb-4 text-foreground " htmlFor="offer">Brand/Offer Details *</label>
                      <Tooltip text="Describe your product, service, or what you're promoting in 1-2 sentences. This helps the AI tailor its suggestions." />
                  </div>
                  <textarea id="offer" rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., Online yoga classes for busy professionals." value={formData.brand_offer_details} onChange={(e) => setFormData({...formData, brand_offer_details: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block font-semibold text-foreground text-sm" htmlFor="age">Age Range *</label>
                          <Tooltip text="Select the primary age group of your target audience." />
                      </div>
                      <select id="age" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.demographics?.age_range} onChange={(e) => setFormData({...formData, demographics: {...formData.demographics, age_range: e.target.value}})}>
                          <option>18-24</option>
                          <option>25-34</option>
                          <option>35-44</option>
                          <option>45-54</option>
                          <option>55+</option>
                      </select>
                  </div>
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block font-semibold text-foreground" htmlFor="gender">Gender *</label>
                          <Tooltip text="Select the gender of your target audience. Choose 'Any' for a broader reach." />
                      </div>
                      <select id="gender" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.demographics?.gender} onChange={(e) => setFormData({...formData, demographics: {...formData.demographics, gender: e.target.value}})}>
                          <option>Any</option>
                          <option>Female</option>
                          <option>Male</option>
                          <option>Non-binary</option>
                      </select>
                  </div>
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block font-semibold text-foreground" htmlFor="location">Location *</label>
                          <Tooltip text="Specify the primary country, region, or city you are targeting." />
                      </div>
                      <input type="text" id="location" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., United States" value={formData.demographics?.location} onChange={(e) => setFormData({...formData, demographics: {...formData.demographics, location: e.target.value}})} />
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block font-semibold text-foreground" htmlFor="interests">Audience Interests (Optional)</label>
                          <Tooltip text="List a few keywords that describe your audience's interests, separated by commas (e.g., technology, hiking, coffee)." />
                      </div>
                      <input type="text" id="interests" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., fitness, wellness, yoga" value={formData.audience_interests || ''} onChange={(e) => setFormData({...formData, audience_interests: e.target.value})} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <label className="block font-semibold text-foreground" htmlFor="budget">Campaign Budget ($) (Optional)</label>
                          <Tooltip text="Enter the total budget for this campaign. This helps the AI provide realistic recommendations." />
                      </div>
                      <input 
                          type="number" 
                          id="budget" 
                          className="w-full p-3 border border-gray-300 rounded-lg" 
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl bg-card border-border">
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                {steps.map(step => (
                     <div key={step.id} className="text-center w-1/3">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {step.id}
                        </div>
                        <p className={`mt-2 text-sm ${currentStep >= step.id ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{step.title}</p>
                     </div>
                ))}
            </div>
            <div className="bg-muted rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
            </div>
        </div>
        
        <div className="min-h-[400px]">
            {renderStepContent()}
        </div>

        {error && <p className="text-destructive my-4 text-center">{error}</p>}
        
        <div className="mt-8 flex justify-between items-center">
          <Button type="button" onClick={handleBack} disabled={currentStep === 1} variant="secondary" className="bg-secondary text-secondary-foreground hover:opacity-90">
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Generate Plan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
