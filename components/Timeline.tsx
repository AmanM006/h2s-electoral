'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

interface TimelineStep {
  title: string;
  description: string;
  icon: string;
  date: string;
}

const defaultSteps: TimelineStep[] = [
  {
    title: 'Voter Registration',
    description: 'Citizens register via Form 6. Must be 18+ and an Indian citizen.',
    icon: '01',
    date: 'Continuous'
  },
  {
    title: 'Election Announcement',
    description: 'ECI announces dates and Model Code of Conduct comes into force.',
    icon: '02',
    date: 'T-Minus'
  },
  {
    title: 'Nomination Filing',
    description: 'Candidates file nominations and affidavits detailing assets.',
    icon: '03',
    date: 'Phase 1'
  },
  {
    title: 'Campaigning',
    description: 'Parties campaign. Ends 48 hours before polling starts.',
    icon: '04',
    date: 'Phase 2'
  },
  {
    title: 'Polling Day',
    description: 'Voters cast their vote using EVMs and VVPATs.',
    icon: '05',
    date: 'Phase 3'
  },
  {
    title: 'Counting & Results',
    description: 'Votes are counted on a scheduled day and results declared.',
    icon: '06',
    date: 'Phase 4'
  }
];

export default function Timeline() {
  const { language } = useLanguage();
  const [steps, setSteps] = useState<TimelineStep[]>(defaultSteps);
  const [headingText, setHeadingText] = useState('Election Roadmap');

  useEffect(() => {
    if (language === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSteps(defaultSteps);
      setHeadingText('Election Roadmap');
      return;
    }

    const translateContent = async () => {
      try {
        const textsToTranslate = [
          'Election Roadmap',
          ...defaultSteps.flatMap(step => [step.title, step.description, step.date])
        ];

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textsToTranslate, target: language })
        });

        if (res.ok) {
          const data = await res.json();
          const translated = data.translatedText;
          setHeadingText(translated[0]);
          
          const newSteps = defaultSteps.map((step, idx) => {
            const baseIdx = 1 + (idx * 3);
            return {
              ...step,
              title: translated[baseIdx],
              description: translated[baseIdx + 1],
              date: translated[baseIdx + 2]
            };
          });
          setSteps(newSteps);
        }
      } catch (error) {
        console.error('Failed to translate timeline:', error);
      }
    };

    translateContent();
  }, [language]);

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-[1px] bg-accent" />
          <h2 id="timeline-heading" className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500">
            {headingText}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group animate-fadeIn relative" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-black text-accent/50 group-hover:text-accent transition-colors duration-500">
                    {step.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {step.date}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-500">
                  {step.title}
                </h3>
                
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
              
              <div className="mt-6 w-8 h-[1px] bg-border-subtle group-hover:w-full transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
