
import React from 'react';
import type { GeneratorFormState } from '../types';
import { CONTENT_TYPES, TARGET_AUDIENCES, FORMAT_PREFERENCES } from '../constants';
import { SparklesIcon } from './icons';

interface GeneratorFormProps {
  formData: GeneratorFormState;
  setFormData: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  name: keyof GeneratorFormState;
}> = ({ label, value, onChange, options, name }) => (
  <div className="flex flex-col space-y-2">
    <label htmlFor={name} className="text-sm font-medium text-ink">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-signal rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="relative w-full px-3 py-2 bg-sheet text-ink border border-rule rounded-lg focus:outline-none focus:border-rule focus:ring-1 focus:ring-signal transition-all appearance-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-sheet text-ink">
            {option}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink">
        ▼
      </div>
    </div>
  </div>
);

const GeneratorForm: React.FC<GeneratorFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectInput
          label="CONTENT TYPE"
          name="contentType"
          value={formData.contentType}
          onChange={handleChange}
          options={CONTENT_TYPES}
        />
        <SelectInput
          label="TARGET AUDIENCE"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          options={TARGET_AUDIENCES}
        />
      </div>
      <SelectInput
        label="FORMAT PREFERENCE"
        name="formatPreference"
        value={formData.formatPreference}
        onChange={handleChange}
        options={FORMAT_PREFERENCES}
      />
      <div className="flex flex-col space-y-2">
        <label htmlFor="topic" className="text-sm font-medium text-ink">
          TOPIC OR SUBJECT
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-signal rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <textarea
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g., 'Introduction to Quantum Computing'"
            rows={4}
            required
            className="relative w-full px-3 py-2 bg-sheet text-ink border border-rule rounded-lg focus:outline-none focus:border-rule focus:ring-1 focus:ring-signal transition-all placeholder:text-ink-soft"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-black transition-all duration-200
            ${isLoading
            ? 'bg-muted text-ink cursor-not-allowed border-rule'
            : 'bg-signal hover:scale-[1.02]'
          }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-rule border-t-black rounded-full animate-spin"></div>
            GENERATING...
          </div>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            GENERATE CONTENT
          </>
        )}
      </button>
    </form>
  );
};

export default GeneratorForm;
