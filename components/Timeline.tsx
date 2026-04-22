'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

/**
 * Interface defining a step in the election timeline.
 */
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
    icon: '📝',
    date: 'Continuous Process'
  },
  {
    title: 'Election Announcement',
    description: 'Election Commission of India (ECI) announces dates and Model Code of Conduct comes into force.',
    icon: '📢',
    date: 'Pre-Election'
  },
  {
    title: 'Nomination Filing',
    description: 'Candidates file nominations and affidavits detailing assets and criminal records.',
    icon: '📁',
    date: 'Phase 1'
  },
  {
    title: 'Campaigning',
    description: 'Parties and candidates campaign. Ends 48 hours before polling.',
    icon: '🗣️',
    date: 'Phase 2'
  },
  {
    title: 'Polling Day',
    description: 'Voters cast their vote using Electronic Voting Machines (EVMs) and VVPATs.',
    icon: '🗳️',
    date: 'Phase 3'
  },
  {
    title: 'Counting & Results',
    description: 'Votes are counted on a scheduled day and results are declared.',
    icon: '📊',
    date: 'Phase 4'
  }
];

/**
 * Timeline component that visualizes the Indian Election Process.
 * It automatically translates its content based on the global language state.
 * 
 * @returns The Timeline component.
 */
export default function Timeline() {
  const { language } = useLanguage();
  const [steps, setSteps] = useState<TimelineStep[]>(defaultSteps);
  const [headingText, setHeadingText] = useState('Indian Election Process');

  useEffect(() => {
    if (language === 'en') {
      setSteps(defaultSteps);
      setHeadingText('Indian Election Process');
      return;
    }

    const translateContent = async () => {
      try {
        const textsToTranslate = [
          'Indian Election Process',
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
    <section aria-labelledby="timeline-heading" className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="timeline-heading" className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-md">
          {headingText}
        </h2>
        <div className="relative border-l-4 border-indigo-500 ml-4 md:ml-0 md:mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="mb-10 ml-8 group">
              <div className="absolute w-8 h-8 bg-indigo-600 rounded-full -left-[1.15rem] border-4 border-gray-900 flex items-center justify-center text-sm shadow-lg group-hover:scale-125 transition-transform duration-300">
                {step.icon}
              </div>
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 hover:border-indigo-500 transition-colors duration-300">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  <span className="text-sm font-semibold text-indigo-400 bg-gray-900 px-3 py-1 rounded-full">{step.date}</span>
                </div>
                <p className="text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
