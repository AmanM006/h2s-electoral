'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
] as const;

/**
 * Component for selecting the application language.
 * Uses the LanguageContext to update the global language state.
 * 
 * @returns The LanguageSelector component.
 */
export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
      <Globe size={20} className="text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        aria-label="Select language"
        className="bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-gray-900 text-white">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
