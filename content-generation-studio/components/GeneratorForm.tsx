
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
    <label htmlFor={name} className="text-sm font-medium text-slate-600 dark:text-slate-400">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
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
          label="Content Type"
          name="contentType"
          value={formData.contentType}
          onChange={handleChange}
          options={CONTENT_TYPES}
        />
        <SelectInput
          label="Target Audience"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          options={TARGET_AUDIENCES}
        />
      </div>
      <SelectInput
        label="Format Preference"
        name="formatPreference"
        value={formData.formatPreference}
        onChange={handleChange}
        options={FORMAT_PREFERENCES}
      />
      <div className="flex flex-col space-y-2">
        <label htmlFor="topic" className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Topic or Subject
        </label>
        <textarea
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="e.g., 'Introduction to Quantum Computing'"
          rows={4}
          required
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          'Generating...'
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Content
          </>
        )}
      </button>
    </form>
  );
};

export default GeneratorForm;
