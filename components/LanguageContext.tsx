'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'te' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

/**
 * Provider component for managing global language state.
 * 
 * @param props The provider props containing children.
 * @returns The LanguageContext provider.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the current language state.
 * 
 * @returns The language context value.
 */
export const useLanguage = () => useContext(LanguageContext);
